from django.contrib.gis.geos import Point
from rest_framework import serializers
from .models import EventoSocial, Inscricao

class EventoSocialSerializer(serializers.ModelSerializer):
    latitude = serializers.FloatField(write_only=True, required=False)
    longitude = serializers.FloatField(write_only=True, required=False)
    organizador = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = EventoSocial
        fields = [
            'id',
            'titulo',
            'descricao',
            'categoria',
            'vagas',
            'data_hora',
            'localizacao',
            'criado_em',
            'organizador',
            'latitude',
            'longitude',
        ]
        read_only_fields = ['id', 'criado_em']

    def create(self, validated_data):
        latitude = validated_data.pop('latitude', None)
        longitude = validated_data.pop('longitude', None)

        if latitude is not None and longitude is not None:
                        validated_data['localizacao'] = Point(float(longitude), float(latitude), srid=4326)

        return super().create(validated_data)

class InscricaoSerializer(serializers.ModelSerializer):
    participante = serializers.HiddenField(
        default=serializers.CurrentUserDefault()
    )

    class Meta:
        model = Inscricao
        fields = ['id', 'evento', 'participante', 'status', 'data_inscricao']
        read_only_fields = ['status', 'data_inscricao']
        
        validators = []

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