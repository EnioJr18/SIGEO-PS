import logging
import os
import re

from django.conf import settings
from google import genai
from google.genai import errors
from google.genai import types

logger = logging.getLogger(__name__)

TRAILING_DANGLING_TERMS = {
    "a",
    "ao",
    "aos",
    "as",
    "com",
    "da",
    "das",
    "de",
    "do",
    "dos",
    "e",
    "em",
    "na",
    "nas",
    "no",
    "nos",
    "o",
    "os",
    "para",
    "pela",
    "pelas",
    "pelo",
    "pelos",
    "por",
}


class AIConfigurationError(RuntimeError):
    """Raised when the AI provider is not configured locally."""


class AIEmptyResponseError(RuntimeError):
    """Raised when Gemini returns no usable text."""


class AIExternalServiceError(RuntimeError):
    """Raised when Gemini fails during an external call."""


class AIProviderUnavailableError(RuntimeError):
    """Raised when Gemini is temporarily unavailable or out of quota."""


def _normalize_sentence(value):
    value = " ".join(str(value or "").split()).strip(" ,;:-")
    if not value:
        return ""

    if value[-1] not in ".!?":
        value = f"{value}."

    return value


def _format_optional_details(local, data_evento):
    if local and data_evento:
        return f"em {local}, no dia {data_evento}"

    if local:
        return f"em {local}"

    if data_evento:
        return f"no dia {data_evento}"

    return ""


def _format_proposal_sentence(event_details, category_text):
    if event_details:
        return (
            f"A proposta {event_details} busca fortalecer a participação da comunidade{category_text}, "
            "mantendo um tom acolhedor e organizado"
        )

    return (
        f"A proposta busca fortalecer a participação da comunidade{category_text}, "
        "mantendo um tom acolhedor e organizado"
    )


def _format_activity_sentence(event_details):
    if not event_details:
        return "A atividade busca facilitar o acesso da população a informações e oportunidades importantes"

    return (
        f"A atividade será realizada {event_details}, buscando facilitar o acesso da população "
        "a informações e oportunidades importantes"
    )


def _format_category_text(categoria):
    if not categoria:
        return ""

    return f" na área de {categoria}"


def build_local_event_description_suggestion(data):
    titulo = data.get('titulo') or 'Projeto social'
    categoria = data.get('categoria') or ''
    local = data.get('local') or ''
    data_evento = data.get('data') or ''
    descricao_atual = data.get('descricao_atual') or ''

    current_description = _clean_description_text(descricao_atual)
    event_details = _format_optional_details(local, data_evento)
    category_text = _format_category_text(categoria)

    if current_description:
        first_sentence = _normalize_sentence(current_description)
        second_sentence = _normalize_sentence(_format_proposal_sentence(event_details, category_text))
        suggestion = f"{first_sentence} {second_sentence}"
    else:
        first_sentence = _normalize_sentence(
            f"O {titulo} é uma iniciativa social{category_text} voltada a aproximar a comunidade de ações de cuidado, orientação e apoio"
        )
        second_sentence = _normalize_sentence(_format_activity_sentence(event_details))
        third_sentence = _normalize_sentence(
            "Participe e contribua para fortalecer uma rede de cuidado, prevenção e apoio social"
        )
        suggestion = f"{first_sentence} {second_sentence} {third_sentence}"

    suggestion = _finalize_description_text(suggestion)

    if _looks_truncated(suggestion):
        raise AIEmptyResponseError("Fallback local gerou uma sugestão incompleta.")

    return suggestion


def _get_api_key():
    api_key = (
        getattr(settings, "GEMINI_API_KEY", "")
        or os.environ.get("GEMINI_API_KEY", "")
    ).strip()

    if not api_key:
        raise AIConfigurationError("GEMINI_API_KEY ausente ou vazia.")

    return api_key


def _get_model_name():
    return (
        getattr(settings, "GEMINI_MODEL", "")
        or os.environ.get("GEMINI_MODEL", "")
        or "gemini-2.5-flash"
    ).strip()


def _generate_content(prompt, *, system_instruction=None, max_output_tokens=450, temperature=0.6):
    client = genai.Client(
        api_key=_get_api_key(),
        http_options=types.HttpOptions(timeout=30000),
    )

    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=temperature,
        max_output_tokens=max_output_tokens,
    )

    try:
        response = client.models.generate_content(
            model=_get_model_name(),
            contents=prompt,
            config=config,
        )
    except errors.APIError as exc:
        status_code = getattr(exc, "status_code", None) or getattr(exc, "status", None)

        if status_code == 404:
            raise AIConfigurationError(
                f"Modelo Gemini indisponível ou inválido: {_get_model_name()}."
            ) from exc

        if status_code in (401, 403, 429, 500, 503, 504, "UNAVAILABLE", "RESOURCE_EXHAUSTED", "PERMISSION_DENIED"):
            raise AIProviderUnavailableError(
                f"Gemini indisponível para esta chave ou quota. Status: {status_code}."
            ) from exc

        raise AIExternalServiceError(
            f"Falha externa do Gemini. Status: {status_code or 'desconhecido'}."
        ) from exc
    finally:
        client.close()

    return _extract_response_text(response)


def _clean_description_text(text):
    text = text.strip()
    text = re.sub(r"^```(?:\w+)?\s*|\s*```$", "", text).strip()
    text = re.sub(r"^(?:descri[cç][aã]o(?: final)?|sugest[aã]o)\s*:\s*", "", text, flags=re.IGNORECASE)
    text = text.strip(" \t\r\n\"'“”‘’")
    text = re.sub(r"[*_`#]+", "", text)
    text = re.sub(r"(?m)^\s*[-•]\s+", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    paragraphs = [
        " ".join(paragraph.split())
        for paragraph in re.split(r"\n\s*\n", text)
        if paragraph.strip()
    ]
    return "\n\n".join(paragraphs).strip()


def _looks_truncated(text):
    text = _clean_description_text(text)

    if not text:
        return True

    if text.endswith(("...", "…")):
        return True

    if text[-1] not in ".!?":
        return True

    words = re.findall(r"[A-Za-zÀ-ÿ]+", text.rstrip(".!?").lower())
    if words and words[-1] in TRAILING_DANGLING_TERMS:
        return True

    return False


def _finalize_description_text(text):
    text = _clean_description_text(text)

    if not text:
        raise AIEmptyResponseError("Resposta da IA vazia após limpeza.")

    if _looks_truncated(text):
        raise AIEmptyResponseError("Resposta da IA parece incompleta ou truncada.")

    return text


def _extract_response_text(response):
    try:
        text = getattr(response, "text", "")
    except Exception as exc:
        raise AIEmptyResponseError("Resposta da IA sem texto disponível.") from exc

    text = (text or "").strip()

    if not text:
        raise AIEmptyResponseError("Resposta da IA vazia ou bloqueada.")

    return text


def get_ai_response(user_message):
    try:
        system_instruction = (
            "Você é o assistente virtual do SIGEO-PS (Sistema de Gestão de Eventos Sociais). "
            "Seu tom é amigável, inspirador e prestativo. "
            "Responda de forma concisa e ajude os usuários a tirarem dúvidas sobre voluntariado, "
            "projetos sociais e como usar a plataforma."
        )
        
        return _generate_content(
            f"Usuário diz: {user_message}",
            system_instruction=system_instruction,
        )
    except Exception as exc:
        logger.warning(
            "Falha no chatbot de IA na etapa resposta: %s: %s",
            type(exc).__name__,
            exc,
        )
        return "Desculpe, minha conexão falhou por um instante. Pode repetir a mensagem?"


def get_event_description_suggestion(data):
    titulo = data.get('titulo') or 'Não informado'
    categoria = data.get('categoria') or 'Não informada'
    local = data.get('local') or 'Não informado'
    data_evento = data.get('data') or 'Não informada'
    descricao_atual = data.get('descricao_atual') or ''

    prompt = (
        "Você é um redator para uma plataforma de projetos sociais.\n\n"
        "Escreva uma descrição completa para o evento abaixo.\n\n"
        "Regras obrigatórias:\n"
        "- Escreva em português do Brasil.\n"
        "- Retorne apenas a descrição final.\n"
        "- Não use título.\n"
        "- Não use markdown.\n"
        "- Não use lista.\n"
        "- Não use aspas.\n"
        "- Não invente dados que não foram informados.\n"
        "- Não termine a resposta com frase incompleta.\n"
        "- O texto deve ter entre 2 e 4 frases completas.\n"
        "- O texto deve ter entre 300 e 600 caracteres.\n"
        "- Use tom humano, claro, acolhedor e profissional.\n"
        "- Se a descrição atual existir, melhore mantendo a intenção original.\n"
        "- Se não existir descrição atual, crie uma descrição usando apenas os dados disponíveis.\n"
        "- Não escreva em primeira pessoa e não use expressões como 'nosso', 'nossa' ou 'nossa equipe'.\n"
        "- Não cite especialistas, consultas, atendimentos, procedimentos, gratuidade, brindes ou serviços específicos se isso não estiver nos dados.\n"
        "- Quando o título indicar um tema, fale sobre o objetivo social de forma geral sem afirmar como o serviço será executado.\n\n"
        "Dados:\n"
        f"Título: {titulo}\n"
        f"Categoria: {categoria}\n"
        f"Local: {local}\n"
        f"Data: {data_evento}\n"
        f"Descrição atual: {descricao_atual or 'Não informada'}\n\n"
        "Antes de responder, revise se a última frase está completa. "
        "Se estiver cortada, reescreva de forma mais curta."
    )

    try:
        suggestion = _generate_content(prompt, max_output_tokens=500, temperature=0.5)

        if _looks_truncated(suggestion):
            suggestion = _generate_content(
                f"{prompt}\n\nReescreva a descrição em 2 frases completas, sem cortar a última frase.",
                max_output_tokens=500,
                temperature=0.4,
            )

        return {
            'sugestao': _finalize_description_text(suggestion),
            'fonte': 'gemini',
        }
    except (AIEmptyResponseError, AIProviderUnavailableError, AIExternalServiceError) as exc:
        logger.warning(
            "Fallback local usado na sugestão de descrição: %s: %s",
            type(exc).__name__,
            exc,
        )

        try:
            return {
                'sugestao': build_local_event_description_suggestion(data),
                'fonte': 'fallback',
            }
        except Exception as fallback_exc:
            raise AIEmptyResponseError("Não foi possível gerar sugestão local.") from fallback_exc
    except AIConfigurationError:
        raise
    except Exception as exc:
        raise AIExternalServiceError("Falha externa ao chamar Gemini.") from exc
