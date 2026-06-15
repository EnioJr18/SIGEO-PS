from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, PerfilView, UserProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # 👇 ATUALIZAMOS AQUI PARA A VIEW NOVA (A Mágica do DRF)
    path('perfil/', UserProfileView.as_view(), name='perfil'),
]