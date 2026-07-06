import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import ChatMessageSerializer, EventDescriptionSuggestionSerializer
from .services import (
    AIConfigurationError,
    AIEmptyResponseError,
    AIExternalServiceError,
    AIProviderUnavailableError,
    get_ai_response,
    get_event_description_suggestion,
)

logger = logging.getLogger(__name__)

class ChatBotView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        serializer = ChatMessageSerializer(data=request.data)
        
        if serializer.is_valid():
            user_message = serializer.validated_data['message']
            
            # Chama o nosso arquivo services.py
            bot_response = get_ai_response(user_message)
            
            return Response({'response': bot_response}, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventDescriptionSuggestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = EventDescriptionSuggestionSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {
                    'detail': 'Dados inválidos para gerar a sugestão.',
                    'errors': serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            suggestion_result = get_event_description_suggestion(serializer.validated_data)
        except AIConfigurationError as exc:
            logger.warning(
                "IA indisponível na etapa configuracao: %s: %s",
                type(exc).__name__,
                exc,
            )
            return Response(
                {
                    'detail': (
                        'Serviço de IA indisponível no momento. '
                        'Verifique a configuração da chave Gemini.'
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except AIEmptyResponseError as exc:
            logger.warning(
                "IA indisponível na etapa resposta: %s: %s",
                type(exc).__name__,
                exc,
            )
            return Response(
                {
                    'detail': (
                        'A IA não retornou uma sugestão utilizável agora. '
                        'Você ainda pode preencher a descrição manualmente.'
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except AIProviderUnavailableError as exc:
            logger.exception(
                "IA indisponível na etapa provedor_gemini: %s: %s",
                type(exc).__name__,
                exc,
            )
            return Response(
                {
                    'detail': (
                        'Serviço de IA indisponível no momento. '
                        'Você ainda pode preencher a descrição manualmente.'
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except AIExternalServiceError as exc:
            logger.exception(
                "Erro ao gerar sugestão de descrição com IA na etapa chamada_gemini: %s: %s",
                type(exc).__name__,
                exc,
            )
            return Response(
                {'detail': 'Não foi possível gerar a sugestão agora. Tente novamente em instantes.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as exc:
            logger.exception(
                "Erro inesperado ao gerar sugestão de descrição com IA na etapa endpoint: %s: %s",
                type(exc).__name__,
                exc,
            )
            return Response(
                {
                    'detail': (
                        'Não foi possível gerar a sugestão agora. '
                        'Você ainda pode preencher a descrição manualmente.'
                    )
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        response_data = {'sugestao': suggestion_result['sugestao']}

        if suggestion_result.get('fonte') == 'fallback':
            response_data['fonte'] = 'fallback'

        return Response(response_data, status=status.HTTP_200_OK)
