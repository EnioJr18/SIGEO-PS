from rest_framework import serializers

class ChatMessageSerializer(serializers.Serializer):
    message = serializers.CharField(required=True, max_length=1000)


class EventDescriptionSuggestionSerializer(serializers.Serializer):
    titulo = serializers.CharField(required=False, allow_blank=True, max_length=200)
    categoria = serializers.CharField(required=False, allow_blank=True, max_length=80)
    local = serializers.CharField(required=False, allow_blank=True, max_length=255)
    data = serializers.CharField(required=False, allow_blank=True, max_length=80)
    descricao_atual = serializers.CharField(required=False, allow_blank=True, max_length=1500)
