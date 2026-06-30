from django.urls import path
from apps.events import views

urlpatterns = [
    path('', views.EventoSocialListCreateView.as_view(), name='evento-list-create'),
    path('<int:pk>/', views.EventoSocialDetailView.as_view(), name='evento-detail'),
    path('inscricoes/', views.InscreverEventoView.as_view(), name='inscrever-evento'),
    path('minhas-inscricoes/', views.MinhasInscricoesView.as_view(), name='minhas-inscricoes'),
    path('inscricoes-recebidas/', views.InscricoesRecebidasView.as_view(), name='inscricoes-recebidas'),
    path('<int:evento_id>/cancelar-inscricao/', views.CancelarInscricaoView.as_view(), name='cancelar-inscricao'),
]
