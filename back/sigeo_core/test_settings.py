import os
from urllib.parse import urlparse

from .settings import *  # noqa: F403


def _is_local_database_url(database_url):
    parsed = urlparse(database_url)
    hostname = parsed.hostname or ""
    return hostname in {"", "localhost", "127.0.0.1", "::1"}


TEST_DATABASE_URL = os.environ.get(
    "SIGEO_TEST_DATABASE_URL",
    "postgis://postgres:postgres@127.0.0.1:5432/sigeo_ps_test",
)

if not _is_local_database_url(TEST_DATABASE_URL):
    raise RuntimeError(
        "SIGEO_TEST_DATABASE_URL precisa apontar para um banco local. "
        "Os testes nao devem criar banco em Neon/remoto."
    )

DATABASES = {
    "default": env.db_url_config(TEST_DATABASE_URL)  # noqa: F405
}
DATABASES["default"]["ENGINE"] = "django.contrib.gis.db.backends.postgis"
DATABASES["default"]["TEST"] = {
    "NAME": os.environ.get("SIGEO_TEST_DATABASE_NAME", "test_sigeo_ps"),
}

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
