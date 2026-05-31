from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from django.utils import timezone
from datetime import timedelta
from .models import EventoSocial, Inscricao

User = get_user_model()

class InscricaoAPITests(APITestCase):
    
    def setUp(self):
        # 1. Criar um organizador e um participante de teste
        self.organizador = User.objects.create_user(
            username='organizador_teste', email='org@teste.com', password='senha', role='organizador'
        )
        self.participante = User.objects.create_user(
            username='participante_teste', email='part@teste.com', password='senha', role='comum'
        )
        
        # 2. Criar um evento mock para os testes (usando Point para o GeoDjango)
        self.evento = EventoSocial.objects.create(
            titulo="Mutirão de Teste",
            descricao="Testando a API",
            categoria="meio_ambiente",
            localizacao=Point(-35.7153, -9.6738, srid=4326), # Coordenadas de Maceió
            data_hora=timezone.now() + timedelta(days=5),
            organizador=self.organizador,
            vagas=50
        )

    def test_participante_pode_se_inscrever(self):
        """Testa se a rota de inscrição (POST) funciona e salva no banco"""
        self.client.force_authenticate(user=self.participante)
        url = reverse('inscrever-evento') # O 'name' que colocamos no urls.py
        data = {'evento': self.evento.id}
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Inscricao.objects.count(), 1)
        self.assertEqual(Inscricao.objects.get().participante, self.participante)

    def test_participante_pode_listar_suas_inscricoes(self):
        """Testa se o participante vê apenas as próprias inscrições"""
        # Inscreve o participante primeiro
        Inscricao.objects.create(participante=self.participante, evento=self.evento)
        
        self.client.force_authenticate(user=self.participante)
        url = reverse('minhas-inscricoes')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) # A lista não deve vir vazia

    def test_participante_pode_cancelar_inscricao(self):
        """Testa se a rota PATCH muda o status para cancelada"""
        inscricao = Inscricao.objects.create(participante=self.participante, evento=self.evento)
        
        self.client.force_authenticate(user=self.participante)
        url = reverse('cancelar-inscricao', kwargs={'pk': inscricao.id})
        
        response = self.client.patch(url)
        inscricao.refresh_from_db() # Puxa o dado atualizado do banco
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(inscricao.status, 'cancelada')

    def test_organizador_ve_inscricoes_no_seu_evento(self):
        """Testa o isolamento de dados do Dashboard do Organizador"""
        Inscricao.objects.create(participante=self.participante, evento=self.evento)
        
        # Logando como o Organizador!
        self.client.force_authenticate(user=self.organizador)
        url = reverse('inscricoes-recebidas')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) # Ele deve ver a inscrição do participante