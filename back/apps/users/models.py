from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Opções de perfis no sistema
    ROLE_CHOICES = (
        ('comum', 'Usuário Comum'),
        ('organizador', 'Organizador de Eventos'),
        ('admin', 'Administrador'),
    )
    
    # O campo que o serializer do Guilherme estava procurando
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES, 
        default='comum'
    )