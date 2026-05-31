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


class InscreverEventoView(generics.CreateAPIView):
    queryset = Inscricao.objects.all()
    serializer_class = InscricaoSerializer
    permission_classes = [IsAuthenticated]

class MinhasInscricoesView(generics.ListAPIView):
    serializer_class = InscricaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Inscricao.objects.filter(participante=self.request.user)
    

class CancelarInscricaoView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        
        inscricao = get_object_or_404(Inscricao, id=pk, participante=self.request.user)

        inscricao.status = 'cancelada'
        inscricao.save()

        return Response({"mensagem": "Inscrição cancelada com sucesso!"}, status=status.HTTP_200_OK)
    

class InscricoesRecebidasView(generics.ListAPIView):
    serializer_class = InscricaoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Inscricao.objects.filter(evento__organizador=self.request.user)