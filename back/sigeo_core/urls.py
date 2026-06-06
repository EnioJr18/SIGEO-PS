from django.contrib import admin
from django.urls import path, include
from seu_app.views import criar_admin_emergencia

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/eventos/', include('apps.events.urls')),
    path('salvacao/', criar_admin_emergencia),
]