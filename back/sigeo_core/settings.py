import os
import sys
from pathlib import Path
import environ
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, False), 
    SECRET_KEY=(str, 'dev-insecure-secret-key-change-me'),
    DATABASE_URL=(
        str,
        'postgres://postgres:postgres@127.0.0.1:5432/sigeo_ps?sslmode=disable',
    ),
)
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')
GEMINI_API_KEY = env('GEMINI_API_KEY', default='')
GEMINI_MODEL = env('GEMINI_MODEL', default='gemini-2.5-flash')
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'django.contrib.gis',
    'django_filters',
    'apps.users',
    'apps.events',
    'apps.impact',
    'apps.ai_integration',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sigeo_core.urls'
WSGI_APPLICATION = 'sigeo_core.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

DATABASES = {
    'default': env.db('DATABASE_URL')
}

DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Maceio'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


if os.name == 'nt':
    candidate_dirs = [Path(r'C:\OSGeo4W\bin')]
    candidate_dirs.extend(Path(r'C:\Program Files').glob('QGIS*\bin'))
    candidate_dirs.extend(Path(r'C:\Program Files').glob(r'QGIS*\apps\qgis\bin'))

    existing_dirs = [path for path in candidate_dirs if path.exists()]

    if existing_dirs and sys.version_info >= (3, 8):
        for path in existing_dirs:
            os.add_dll_directory(str(path))

    gdal_dll = next(
        (
            dll
            for path in existing_dirs
            for dll in path.glob('gdal*.dll')
            if dll.exists()
        ),
        None,
    )

    geos_dll = next(
        (
            dll
            for path in existing_dirs
            for dll in [path / 'geos_c.dll']
            if dll.exists()
        ),
        None,
    )

    if gdal_dll:
        GDAL_LIBRARY_PATH = str(gdal_dll)

    if geos_dll:
        GEOS_LIBRARY_PATH = str(geos_dll)

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend']
}

AUTH_USER_MODEL = 'users.CustomUser'

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
}

# Libera o acesso para qualquer origem (ideal para o MVP não dar dor de cabeça)
# CORS_ALLOW_ALL_ORIGINS = True

# Se quiser ser mais seguro e restrito (opcional), use esta configuração ao invés da de cima:
CORS_ALLOWED_ORIGINS = [
     "https://sigeo-ps.vercel.app",  
     "http://localhost:5173",
 ]

# Permite que o front-end envie cookies ou tokens de autenticação
CORS_ALLOW_CREDENTIALS = True


# Configuração do GeoDjango para a nuvem (Railway/Deploy)
# Só sobrescreve se a variável de ambiente realmente existir na nuvem
_env_gdal = os.environ.get('GDAL_LIBRARY_PATH')
_env_geos = os.environ.get('GEOS_LIBRARY_PATH')

if _env_gdal:
    GDAL_LIBRARY_PATH = _env_gdal
if _env_geos:
    GEOS_LIBRARY_PATH = _env_geos
