from django.urls import path
from .views import EventoSocialListCreateView, EventoSocialDetailView, InscreverEventoView
from apps.events import views

urlpatterns = [
    path('', EventoSocialListCreateView.as_view(), name='evento-list-create'),
    path('<int:pk>/', EventoSocialDetailView.as_view(), name='evento-detail'),
    path('inscricoes/', views.InscreverEventoView.as_view(), name='inscrever-evento'),
    path('minhas-inscricoes/', views.MinhasInscricoesView.as_view(), name='minhas-inscricoes'),
    path('inscricoes/<int:pk>/cancelar/', views.CancelarInscricaoView.as_view(), name='cancelar-inscricao'),
    path('inscricoes-recebidas/', views.InscricoesRecebidasView.as_view(), name='inscricoes-recebidas')
]