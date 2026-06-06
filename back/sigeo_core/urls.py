from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.contrib.auth import get_user_model

# 2. Cole a função direto aqui, antes das rotas
def criar_admin_emergencia(request):
    User = get_user_model()
    if not User.objects.filter(username='admin_salvador').exists():
        User.objects.create_superuser('admin_salvador', 'admin@email.com', 'SenhaSalva123')
        return HttpResponse("<h1>SUCESSO! 🎉</h1> <p>Pode ir no painel /admin e logar com:</p> <p><b>Usuário:</b> admin_salvador</p> <p><b>Senha:</b> SenhaSalva123</p>")
    
    return HttpResponse("O admin_salvador já foi criado! Vá fazer o login.")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/eventos/', include('apps.events.urls')),
    path('salvacao/', criar_admin_emergencia),
]