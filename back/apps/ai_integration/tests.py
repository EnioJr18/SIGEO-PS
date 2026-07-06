from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.ai_integration.services import AIProviderUnavailableError, get_event_description_suggestion


User = get_user_model()


class EventDescriptionSuggestionAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="organizador_ia",
            email="ia@teste.com",
            password="senha",
            role="organizador",
        )
        self.payload = {
            "titulo": "Mutirao de Saude",
            "categoria": "Saude",
            "local": "Maceio, AL",
            "data": "2026-07-20",
            "descricao_atual": "Atendimento gratuito para comunidade.",
        }

    @patch("apps.ai_integration.views.get_event_description_suggestion")
    def test_endpoint_retorna_sugestao_do_service(self, mocked_service):
        mocked_service.return_value = {"sugestao": "Descricao completa gerada pela IA.", "fonte": "gemini"}
        self.client.force_authenticate(user=self.user)

        response = self.client.post(reverse("sugerir-descricao-evento"), self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["sugestao"], "Descricao completa gerada pela IA.")
        self.assertNotIn("GEMINI_API_KEY", str(response.data))

    @patch("apps.ai_integration.views.get_event_description_suggestion")
    def test_endpoint_informa_fallback_sem_tratar_como_erro(self, mocked_service):
        mocked_service.return_value = {
            "sugestao": "Sugestao local em frases completas.",
            "fonte": "fallback",
        }
        self.client.force_authenticate(user=self.user)

        response = self.client.post(reverse("sugerir-descricao-evento"), self.payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["fonte"], "fallback")
        self.assertNotIn("GEMINI_API_KEY", str(response.data))

    def test_payload_invalido_retorna_400(self):
        self.client.force_authenticate(user=self.user)
        payload = {"descricao_atual": "x" * 1501}

        response = self.client.post(reverse("sugerir-descricao-evento"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("detail", response.data)
        self.assertNotIn("GEMINI_API_KEY", str(response.data))

    @patch("apps.ai_integration.services._generate_content", side_effect=AIProviderUnavailableError("quota"))
    def test_service_usa_fallback_local_quando_gemini_falha(self, mocked_generate):
        result = get_event_description_suggestion(self.payload)

        self.assertEqual(result["fonte"], "fallback")
        self.assertIn("sugestao", result)
        self.assertTrue(result["sugestao"].endswith((".", "!", "?")))
        self.assertNotIn("GEMINI_API_KEY", str(result))

    @patch("apps.ai_integration.views.get_event_description_suggestion")
    def test_descricao_atual_e_opcional(self, mocked_service):
        mocked_service.return_value = {"sugestao": "Descricao sugerida sem texto inicial.", "fonte": "gemini"}
        self.client.force_authenticate(user=self.user)
        payload = dict(self.payload)
        payload["descricao_atual"] = ""

        response = self.client.post(reverse("sugerir-descricao-evento"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        mocked_service.assert_called_once()
