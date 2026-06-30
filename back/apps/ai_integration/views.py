from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny # Deixa o chat aberto para visitantes
from .serializers import ChatMessageSerializer
from .services import get_ai_response

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