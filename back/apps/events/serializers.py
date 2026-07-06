import json
from urllib.error import URLError, HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

from django.contrib.gis.geos import Point
from rest_framework import serializers
from .models import AvaliacaoEvento, EventoSocial, Inscricao


def geocode_endereco(endereco):
    query = quote(endereco.strip())
    if not query:
        raise serializers.ValidationError({'endereco': 'Informe um endereço válido.'})

    url = (
        'https://nominatim.openstreetmap.org/search'
        f'?format=jsonv2&addressdetails=1&limit=1&q={query}'
    )
    request = Request(
        url,
        headers={
            'Accept-Language': 'pt-BR',
            'User-Agent': 'SIGEO-PS/1.0',
        },
    )

    try:
        with urlopen(request, timeout=10) as response:
            payload = json.loads(response.read().decode('utf-8'))
    except (URLError, HTTPError, TimeoutError, ValueError):
        raise serializers.ValidationError({
            'endereco': 'Não foi possível consultar o mapa agora. Tente novamente em instantes.',
        })

    if not payload:
        raise serializers.ValidationError({
            'endereco': 'Não encontramos esse endereço. Confira os dados e tente novamente.',
        })

    first_result = payload[0]

    try:
        longitude = float(first_result['lon'])
        latitude = float(first_result['lat'])
    except (KeyError, TypeError, ValueError):
        raise serializers.ValidationError({
            'endereco': 'O mapa retornou uma localização inválida. Tente outro endereço.',
        })

    endereco_normalizado = first_result.get('display_name') or endereco.strip()
    return endereco_normalizado, Point(longitude, latitude, srid=4326)

class EventoSocialSerializer(serializers.ModelSerializer):
    endereco = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.FloatField(write_only=True, required=False)
    longitude = serializers.FloatField(write_only=True, required=False)
    organizador = serializers.HiddenField(default=serializers.CurrentUserDefault())
    inscritos = serializers.SerializerMethodField()

    class Meta:
        model = EventoSocial
        fields = [
            'id',
            'titulo',
            'descricao',
            'endereco',
            'categoria',
            'vagas',
            'inscritos',
            'data_hora',
            'localizacao',
            'endereco_texto',
            'criado_em',
            'organizador',
            'latitude',
            'longitude',
        ]
        read_only_fields = ['id', 'criado_em']
        extra_kwargs = {
            'localizacao': {'read_only': True},
        }

    def create(self, validated_data):
        endereco = validated_data.pop('endereco', '').strip()
        latitude = validated_data.pop('latitude', None)
        longitude = validated_data.pop('longitude', None)

        if endereco:
            endereco_normalizado, localizacao = geocode_endereco(endereco)
            validated_data['endereco'] = endereco_normalizado
            validated_data['localizacao'] = localizacao
        elif latitude is not None and longitude is not None:
            validated_data['endereco'] = ''
            validated_data['localizacao'] = Point(float(longitude), float(latitude), srid=4326)
        else:
            raise serializers.ValidationError({
                'endereco': 'Informe um endereço para publicar o evento.',
            })

        return super().create(validated_data)

    def update(self, instance, validated_data):
        endereco = validated_data.pop('endereco', '').strip()
        latitude = validated_data.pop('latitude', None)
        longitude = validated_data.pop('longitude', None)

        if endereco:
            endereco_normalizado, localizacao = geocode_endereco(endereco)
            validated_data['endereco'] = endereco_normalizado
            validated_data['localizacao'] = localizacao
        elif latitude is not None and longitude is not None:
            validated_data['endereco'] = instance.endereco
            validated_data['localizacao'] = Point(float(longitude), float(latitude), srid=4326)

        return super().update(instance, validated_data)
    
    def get_inscritos(self, obj):
        return obj.inscricoes_do_evento.filter(status='confirmada').count()

class InscricaoSerializer(serializers.ModelSerializer):
    participante = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )
    # Trocamos para SerializerMethodField para termos controle total do que será enviado
    participante_nome = serializers.SerializerMethodField()
    participante_email = serializers.SerializerMethodField()

    evento_titulo = serializers.CharField(source='evento.titulo', read_only=True)
    evento_data = serializers.DateTimeField(source='evento.data_hora', read_only=True)

    class Meta:
        model = Inscricao
        fields = ['id', 'evento', 'evento_titulo', 'evento_data', 'participante', 'participante_nome', 'participante_email', 'status', 'data_inscricao']
        read_only_fields = ['status', 'data_inscricao']
        
        validators = []

    # Se o usuário não tiver first_name, tentamos pegar o username. Se não tiver, chamamos de Voluntário Anônimo.
    def get_participante_nome(self, obj):
        return obj.participante.first_name or getattr(obj.participante, 'username', 'Voluntário Anônimo')

    def get_participante_email(self, obj):
        return obj.participante.email or "E-mail não cadastrado"

    def create(self, validated_data):
        evento = validated_data['evento']
        participante = validated_data['participante']
        
        inscricoes_confirmadas = Inscricao.objects.filter(
            evento=evento, 
            status='confirmada'
        ).count()

        novo_status = 'pendente' if inscricoes_confirmadas >= evento.vagas else 'confirmada'

        inscricao_existente = Inscricao.objects.filter(evento=evento, participante=participante).first()

        if inscricao_existente:
            if inscricao_existente.status == 'cancelada':
                inscricao_existente.status = novo_status
                inscricao_existente.save()
                return inscricao_existente
            else:
                raise serializers.ValidationError({"detalhe": "Já estás inscrito neste evento."})

        validated_data['status'] = novo_status
        return super().create(validated_data)


class AvaliacaoEventoSerializer(serializers.ModelSerializer):
    participante = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = AvaliacaoEvento
        fields = ['id', 'evento', 'participante', 'nota', 'comentario', 'criado_em', 'atualizado_em']
        read_only_fields = ['id', 'evento', 'criado_em', 'atualizado_em']

    def validate_nota(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError('A nota deve estar entre 1 e 5.')
        return value
