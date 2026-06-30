import os
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))

def get_ai_response(user_message):
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        system_instruction = (
            "Você é o assistente virtual do SIGEO-PS (Sistema de Gestão de Eventos Sociais). "
            "Seu tom é amigável, inspirador e prestativo. "
            "Responda de forma concisa e ajude os usuários a tirarem dúvidas sobre voluntariado, "
            "projetos sociais e como usar a plataforma."
        )
        
        response = model.generate_content(f"{system_instruction}\n\nUsuário diz: {user_message}")
        
        return response.text
    except Exception:
        return "Desculpe, minha conexão falhou por um instante. Pode repetir a mensagem?"
