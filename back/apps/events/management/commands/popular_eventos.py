import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.gis.geos import Point
from django.contrib.auth import get_user_model
from back.apps.events.models import EventoSocial

User = get_user_model()

class Command(BaseCommand):
    help = 'Popula o banco de dados com eventos sociais de teste em Maceió'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.WARNING('Limpando eventos e organizadores de teste antigos...'))
        EventoSocial.objects.all().delete()
        User.objects.filter(username='organizador_teste').delete()

        # 1. Criar um Organizador Fake
        organizador = User.objects.create_user(
            username='organizador_teste',
            email='teste@sigeo.com',
            password='senha_segura_123',
            role='organizador' # O campo que criamos no CustomUser!
        )
        self.stdout.write(self.style.SUCCESS('Organizador de teste criado!'))

        # 2. Lista de Eventos em Maceió (Point recebe LONGITUDE primeiro, depois LATITUDE)
        eventos_mock = [
            {
                'titulo': 'Mutirão de Limpeza na Praia',
                'descricao': 'Ação voluntária para recolher plásticos na areia de Pajuçara.',
                'categoria': 'meio_ambiente',
                'lon': -35.7153,
                'lat': -9.6738, 
            },
            {
                'titulo': 'Doação de Sangue - Hemoal',
                'descricao': 'Campanha de doação de sangue e cadastro de medula óssea no Centro.',
                'categoria': 'saude',
                'lon': -35.7351,
                'lat': -9.6652,
            },
            {
                'titulo': 'Feira de Saúde na UFAL',
                'descricao': 'Atendimento médico e odontológico gratuito para a comunidade.',
                'categoria': 'saude',
                'lon': -35.7761,
                'lat': -9.5532,
            },
            {
                'titulo': 'Distribuição de Cestas Básicas',
                'descricao': 'Apoio a famílias em situação de vulnerabilidade no Benedito Bentes.',
                'categoria': 'assistencia_social',
                'lon': -35.7330,
                'lat': -9.5600,
            },
            {
                'titulo': 'Aulão Solidário para o ENEM',
                'descricao': 'Aulas gratuitas de exatas e humanas. Entrada: 1kg de alimento.',
                'categoria': 'educacao',
                'lon': -35.7042,
                'lat': -9.6435, # Mangabeiras
            }
        ]

        # 3. Inserir no Banco de Dados
        agora = timezone.now()
        
        for i, dados in enumerate(eventos_mock):
            # Cria datas aleatórias entre amanhã e os próximos 15 dias
            data_evento = agora + timedelta(days=random.randint(1, 15))
            
            EventoSocial.objects.create(
                titulo=dados['titulo'],
                descricao=dados['descricao'],
                categoria=dados['categoria'],
                # O Point exige SRID 4326 (padrão GPS)
                localizacao=Point(dados['lon'], dados['lat'], srid=4326),
                data_hora=data_evento,
                organizador=organizador,
                vagas=random.randint(10, 100)
            )

        self.stdout.write(self.style.SUCCESS(f'{len(eventos_mock)} eventos criados com sucesso em Maceió! 🚀'))