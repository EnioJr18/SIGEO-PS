from rest_framework import generics, filters, generics,status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import EventoSocial, Inscricao
from .serializers import EventoSocialSerializer, InscricaoSerializer
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from django.http import HttpResponse
from django.contrib.auth import get_user_model


class EventoSocialListCreateView(generics.ListCreateAPIView):
    queryset = EventoSocial.objects.all()
    serializer_class = EventoSocialSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria']
    search_fields = ['titulo', 'descricao']
    ordering_fields = ['data_hora', 'criado_em']

    def get_queryset(self):
        queryset = super().get_queryset()

        lat = self.request.query_params.get('lat')
        lon = self.request.query_params.get('lon')
        raio = self.request.query_params.get('raio')

        if lat and lon and raio:
            ponto_usuario = Point(float(lon), float(lat), srid=4326)
            queryset = queryset.filter(
                localizacao__distance_lte=(ponto_usuario, D(km=float(raio)))
            )

        return queryset
        


class EventoSocialDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EventoSocial.objects.all()
    serializer_class = EventoSocialSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class InscreverEventoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Tenta pegar o ID do evento que o React enviou no pacote (suporta 'evento' ou 'evento_id')
        evento_id = request.data.get('evento') or request.data.get('evento_id')
        
        if not evento_id:
            return Response({"error": "ID do evento não fornecido no corpo da requisição."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Pega o evento no banco de dados
        evento = get_object_or_404(EventoSocial, id=evento_id)

        if evento.organizador == request.user:
            return Response({"error": "Você não pode se inscrever no seu próprio evento."},status=status.HTTP_400_BAD_REQUEST)
        
        # Verifica se o banco de dados JÁ TEM essa inscrição salva
        if Inscricao.objects.filter(participante=request.user, evento=evento).exists():
            return Response({"error": "Você já está inscrito neste evento."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Se chegou até aqui, cria a inscrição tranquilamente com o usuário logado
        Inscricao.objects.create(participante=request.user, evento=evento)
        
        return Response({"mensagem": "Inscrição confirmada com sucesso!"}, status=status.HTTP_201_CREATED)

class MinhasInscricoesView(generics.ListAPIView):
    serializer_class = InscricaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Inscricao.objects.filter(participante=self.request.user)
    

class CancelarInscricaoView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, evento_id):
        # Busca a inscrição específica deste usuário para este evento
        inscricao = get_object_or_404(Inscricao, evento_id=evento_id, participante=request.user)

        # Deleta a inscrição do banco de dados (libera a vaga e permite nova inscrição futura)
        inscricao.delete()

        return Response({"mensagem": "Inscrição cancelada com sucesso!"},status=status.HTTP_200_OK)
    

class InscricoesRecebidasView(generics.ListAPIView):
    serializer_class = InscricaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Inscricao.objects.filter(evento__organizador=self.request.user)
    

def criar_admin_emergencia(request):
    User = get_user_model()
    # Verifica se o usuário já existe para não dar erro
    if not User.objects.filter(username='admin_salvador').exists():
        # Cria um superusuário novo
        User.objects.create_superuser('admin_salvador', 'admin@email.com', 'SenhaSalva123')
        return HttpResponse("<h1>SUCESSO! 🎉</h1> <p>Pode ir no painel /admin e logar com:</p> <p><b>Usuário:</b> admin_salvador</p> <p><b>Senha:</b> SenhaSalva123</p>")
    
    return HttpResponse("O admin_salvador já foi criado! Vá fazer o login.")