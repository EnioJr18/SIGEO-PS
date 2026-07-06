from django.urls import path
from .views import ChatBotView, EventDescriptionSuggestionView

urlpatterns = [
    path('chat/', ChatBotView.as_view(), name='chatbot'),
    path('sugerir-descricao-evento/', EventDescriptionSuggestionView.as_view(), name='sugerir-descricao-evento'),
]
