import os
import django

# Configura o ambiente do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sigeo_core.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

# Altere para o seu nome de usuário do admin e a senha que você deseja colocar
USERNAME = 'Enio' 
NOVA_SENHA = 'Enio123'

try:
    user = User.objects.get(username=USERNAME)
    user.set_password(NOVA_SENHA)
    user.save()
    print(f"SUCESSO: A senha do usuario '{USERNAME}' foi resetada!")
except User.DoesNotExist:
    print(f"ERRO: O usuario '{USERNAME}' nao foi encontrado no banco.")