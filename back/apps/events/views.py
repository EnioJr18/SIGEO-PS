from django.contrib.auth import get_user_model
from django.db.models import Avg, Count
from django.utils import timezone
from rest_framework import generics, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import AvaliacaoEvento, EventoSocial, Inscricao
from .serializers import AvaliacaoEventoSerializer, EventoSocialSerializer, InscricaoSerializer
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView


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


class AvaliarEventoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, evento_id):
        evento = get_object_or_404(EventoSocial, id=evento_id)

        participou = Inscricao.objects.filter(
            evento=evento,
            participante=request.user,
            status='confirmada',
        ).exists()

        if not participou:
            return Response(
                {"detail": "Você precisa ter uma inscrição confirmada para avaliar este projeto."},
                status=status.HTTP_403_FORBIDDEN,
            )

        avaliacao = AvaliacaoEvento.objects.filter(
            evento=evento,
            participante=request.user,
        ).first()

        serializer = AvaliacaoEventoSerializer(
            avaliacao,
            data={**request.data, 'evento': evento.id},
            context={'request': request},
            partial=bool(avaliacao),
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(evento=evento, participante=request.user)

        response_status = status.HTTP_200_OK if avaliacao else status.HTTP_201_CREATED
        return Response(serializer.data, status=response_status)


class ImpactoSocialView(APIView):
    permission_classes = []

    def get(self, request):
        hoje = timezone.now()
        eventos = EventoSocial.objects.all()
        inscricoes_confirmadas = Inscricao.objects.filter(status='confirmada')
        avaliacoes = AvaliacaoEvento.objects.all()
        User = get_user_model()

        categorias = list(
            eventos.values('categoria')
            .annotate(total=Count('id'))
            .order_by('-total', 'categoria')
        )
        total_por_categoria = max([item['total'] for item in categorias], default=0)

        proximos_eventos = list(
            eventos.filter(data_hora__gte=hoje, cancelado=False)
            .order_by('data_hora')
            .values('id', 'titulo', 'categoria', 'data_hora', 'endereco_texto')[:5]
        )

        media_avaliacao = avaliacoes.aggregate(media=Avg('nota'))['media']

        return Response({
            'total_projetos': eventos.count(),
            'total_inscricoes_confirmadas': inscricoes_confirmadas.count(),
            'participantes_unicos': inscricoes_confirmadas.values('participante').distinct().count(),
            'total_organizadores': User.objects.filter(role='organizador').count(),
            'eventos_realizados': eventos.filter(data_hora__lt=hoje).count(),
            'proximos_eventos': proximos_eventos,
            'categorias': [
                {
                    'categoria': item['categoria'] or 'outro',
                    'total': item['total'],
                    'percentual': round((item['total'] / total_por_categoria) * 100) if total_por_categoria else 0,
                }
                for item in categorias
            ],
            'media_avaliacao': round(media_avaliacao, 1) if media_avaliacao is not None else None,
            'total_avaliacoes': avaliacoes.count(),
        })
    
