import json
from datetime import timedelta
from urllib.error import URLError
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.contrib.gis.geos import Point
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.events.models import AvaliacaoEvento, EventoSocial, Inscricao


User = get_user_model()


class FakeUrlOpenResponse:
    def __init__(self, payload):
        self.payload = payload

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def read(self):
        return json.dumps(self.payload).encode("utf-8")


class BackendAPITestCase(APITestCase):
    def setUp(self):
        self.organizador = User.objects.create_user(
            username="organizador_teste",
            email="org@teste.com",
            password="senha",
            role="organizador",
        )
        self.outro_organizador = User.objects.create_user(
            username="outro_organizador",
            email="outro-org@teste.com",
            password="senha",
            role="organizador",
        )
        self.participante = User.objects.create_user(
            username="participante_teste",
            email="part@teste.com",
            password="senha",
            role="comum",
        )
        self.outro_participante = User.objects.create_user(
            username="outro_participante",
            email="outro-part@teste.com",
            password="senha",
            role="comum",
        )

    def criar_evento(self, **overrides):
        data_hora = overrides.pop("data_hora", timezone.now() + timedelta(days=5))
        return EventoSocial.objects.create(
            titulo=overrides.pop("titulo", "Mutirao de Teste"),
            descricao=overrides.pop("descricao", "Projeto para testar a API."),
            categoria=overrides.pop("categoria", "meio_ambiente"),
            localizacao=overrides.pop("localizacao", Point(-35.7153, -9.6738, srid=4326)),
            endereco=overrides.pop("endereco", "Maceio, AL"),
            endereco_texto=overrides.pop("endereco_texto", "Maceio, AL"),
            data_hora=data_hora,
            organizador=overrides.pop("organizador", self.organizador),
            vagas=overrides.pop("vagas", 50),
            link_comprovacao=overrides.pop("link_comprovacao", ""),
            **overrides,
        )

    def evento_payload(self, **overrides):
        payload = {
            "titulo": "Mutirao de Saude",
            "descricao": "Atendimento e orientacao para a comunidade.",
            "categoria": "saude",
            "vagas": 30,
            "data_hora": (timezone.now() + timedelta(days=10)).isoformat(),
            "endereco_texto": "Maceio, AL",
            "latitude": -9.6738,
            "longitude": -35.7153,
            "link_comprovacao": "https://www.instagram.com/saude.smc/",
        }
        payload.update(overrides)
        return payload


class EventoAPITests(BackendAPITestCase):
    def test_criar_evento_com_dados_validos_retorna_201(self):
        self.client.force_authenticate(user=self.organizador)

        response = self.client.post(
            reverse("evento-list-create"),
            self.evento_payload(),
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["titulo"], "Mutirao de Saude")
        self.assertEqual(response.data["categoria"], "saude")
        self.assertEqual(response.data["link_comprovacao"], "https://www.instagram.com/saude.smc/")
        self.assertEqual(EventoSocial.objects.count(), 1)
        self.assertIsNotNone(EventoSocial.objects.get().localizacao)

    def test_criar_evento_sem_campos_obrigatorios_retorna_400(self):
        self.client.force_authenticate(user=self.organizador)
        payload = self.evento_payload()
        for field in ["titulo", "descricao", "categoria", "data_hora"]:
            payload.pop(field)

        response = self.client.post(reverse("evento-list-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        for field in ["titulo", "descricao", "categoria", "data_hora"]:
            self.assertIn(field, response.data)

    def test_criar_evento_sem_localizacao_retorna_400(self):
        self.client.force_authenticate(user=self.organizador)
        payload = self.evento_payload(latitude=None, longitude=None)
        payload.pop("latitude")
        payload.pop("longitude")

        response = self.client.post(reverse("evento-list-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("endereco", response.data)

    def test_criar_evento_com_dados_invalidos_retorna_400(self):
        self.client.force_authenticate(user=self.organizador)
        invalid_payloads = [
            self.evento_payload(vagas=-1),
            self.evento_payload(vagas="texto"),
            self.evento_payload(categoria="categoria_invalida"),
            self.evento_payload(data_hora="data-invalida"),
            self.evento_payload(latitude="lat-invalida"),
            self.evento_payload(link_comprovacao="nao-e-url"),
        ]

        for payload in invalid_payloads:
            response = self.client.post(reverse("evento-list-create"), payload, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_link_comprovacao_e_opcional(self):
        self.client.force_authenticate(user=self.organizador)
        payload = self.evento_payload(link_comprovacao="")

        response = self.client.post(reverse("evento-list-create"), payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn(response.data.get("link_comprovacao"), ("", None))

    def test_listagem_e_detalhe_retornam_link_comprovacao(self):
        evento = self.criar_evento(link_comprovacao="https://example.com/comprovacao")

        list_response = self.client.get(reverse("evento-list-create"))
        detail_response = self.client.get(reverse("evento-detail", kwargs={"pk": evento.id}))

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data[0]["link_comprovacao"], "https://example.com/comprovacao")
        self.assertEqual(detail_response.data["link_comprovacao"], "https://example.com/comprovacao")


class InscricaoAPITests(BackendAPITestCase):
    def setUp(self):
        super().setUp()
        self.evento = self.criar_evento()

    def test_participante_autenticado_pode_se_inscrever(self):
        self.client.force_authenticate(user=self.participante)

        response = self.client.post(
            reverse("inscrever-evento"),
            {"evento": self.evento.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Inscricao.objects.count(), 1)
        self.assertEqual(Inscricao.objects.get().participante, self.participante)

    def test_usuario_nao_autenticado_nao_pode_se_inscrever(self):
        response = self.client.post(
            reverse("inscrever-evento"),
            {"evento": self.evento.id},
            format="json",
        )

        self.assertIn(response.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_inscricao_duplicada_retorna_400(self):
        Inscricao.objects.create(participante=self.participante, evento=self.evento)
        self.client.force_authenticate(user=self.participante)

        response = self.client.post(
            reverse("inscrever-evento"),
            {"evento": self.evento.id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cancelar_inscricao_funciona(self):
        inscricao = Inscricao.objects.create(participante=self.participante, evento=self.evento)
        self.client.force_authenticate(user=self.participante)

        response = self.client.delete(reverse("cancelar-inscricao", kwargs={"evento_id": self.evento.id}))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Inscricao.objects.filter(id=inscricao.id).exists())

    def test_usuario_nao_cancela_inscricao_de_outra_pessoa(self):
        Inscricao.objects.create(participante=self.outro_participante, evento=self.evento)
        self.client.force_authenticate(user=self.participante)

        response = self.client.delete(reverse("cancelar-inscricao", kwargs={"evento_id": self.evento.id}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_minhas_inscricoes_retorna_apenas_do_usuario_autenticado(self):
        outro_evento = self.criar_evento(titulo="Outro evento")
        Inscricao.objects.create(participante=self.participante, evento=self.evento)
        Inscricao.objects.create(participante=self.outro_participante, evento=outro_evento)
        self.client.force_authenticate(user=self.participante)

        response = self.client.get(reverse("minhas-inscricoes"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["evento"], self.evento.id)


class AvaliacaoAPITests(BackendAPITestCase):
    def setUp(self):
        super().setUp()
        self.evento = self.criar_evento()

    def test_usuario_com_inscricao_confirmada_consegue_avaliar(self):
        Inscricao.objects.create(participante=self.participante, evento=self.evento, status="confirmada")
        self.client.force_authenticate(user=self.participante)

        response = self.client.post(
            reverse("avaliar-evento", kwargs={"evento_id": self.evento.id}),
            {"nota": 5, "comentario": "Projeto bem organizado."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["nota"], 5)
        self.assertEqual(AvaliacaoEvento.objects.count(), 1)

    def test_comentario_opcional_funciona(self):
        Inscricao.objects.create(participante=self.participante, evento=self.evento, status="confirmada")
        self.client.force_authenticate(user=self.participante)

        response = self.client.post(
            reverse("avaliar-evento", kwargs={"evento_id": self.evento.id}),
            {"nota": 4},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["nota"], 4)

    def test_notas_fora_do_intervalo_retornam_400(self):
        Inscricao.objects.create(participante=self.participante, evento=self.evento, status="confirmada")
        self.client.force_authenticate(user=self.participante)

        for nota in (0, 6):
            response = self.client.post(
                reverse("avaliar-evento", kwargs={"evento_id": self.evento.id}),
                {"nota": nota},
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_usuario_sem_inscricao_confirmada_nao_avalia(self):
        self.client.force_authenticate(user=self.participante)

        response = self.client.post(
            reverse("avaliar-evento", kwargs={"evento_id": self.evento.id}),
            {"nota": 5},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_avaliacao_duplicada_atualiza_existente(self):
        Inscricao.objects.create(participante=self.participante, evento=self.evento, status="confirmada")
        AvaliacaoEvento.objects.create(
            participante=self.participante,
            evento=self.evento,
            nota=3,
            comentario="Primeira avaliacao.",
        )
        self.client.force_authenticate(user=self.participante)

        response = self.client.post(
            reverse("avaliar-evento", kwargs={"evento_id": self.evento.id}),
            {"nota": 5, "comentario": "Avaliacao atualizada."},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(AvaliacaoEvento.objects.count(), 1)
        self.assertEqual(AvaliacaoEvento.objects.get().nota, 5)


class ImpactoSocialAPITests(BackendAPITestCase):
    def test_endpoint_responde_com_banco_vazio(self):
        response = self.client.get(reverse("impacto-social"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_projetos"], 0)
        self.assertEqual(response.data["total_inscricoes_confirmadas"], 0)
        self.assertEqual(response.data["participantes_unicos"], 0)
        self.assertEqual(response.data["categorias"], [])
        self.assertIsNone(response.data["media_avaliacao"])

    def test_endpoint_calcula_metricas_reais(self):
        futuro = self.criar_evento(categoria="saude")
        passado = self.criar_evento(
            titulo="Evento realizado",
            categoria="educacao",
            data_hora=timezone.now() - timedelta(days=2),
        )
        Inscricao.objects.create(participante=self.participante, evento=futuro, status="confirmada")
        Inscricao.objects.create(participante=self.outro_participante, evento=passado, status="confirmada")
        AvaliacaoEvento.objects.create(participante=self.participante, evento=futuro, nota=5)
        AvaliacaoEvento.objects.create(participante=self.outro_participante, evento=passado, nota=3)

        response = self.client.get(reverse("impacto-social"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_projetos"], 2)
        self.assertEqual(response.data["total_inscricoes_confirmadas"], 2)
        self.assertEqual(response.data["participantes_unicos"], 2)
        self.assertEqual(response.data["total_avaliacoes"], 2)
        self.assertEqual(response.data["media_avaliacao"], 4.0)
        self.assertEqual(len(response.data["categorias"]), 2)
        self.assertEqual(len(response.data["proximos_eventos"]), 1)


class GeocodingAPITests(BackendAPITestCase):
    def test_query_curta_retorna_lista_vazia(self):
        response = self.client.get(reverse("geocodificar-endereco"), {"q": "ab"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    @patch("apps.events.views.urlopen")
    def test_resposta_valida_do_nominatim_retorna_sugestoes(self, mocked_urlopen):
        mocked_urlopen.return_value = FakeUrlOpenResponse([
            {"display_name": "Maceio, Alagoas, Brasil", "lat": "-9.6658", "lon": "-35.7353"}
        ])

        response = self.client.get(reverse("geocodificar-endereco"), {"q": "Maceio"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["label"], "Maceio, Alagoas, Brasil")
        self.assertEqual(response.data[0]["latitude"], -9.6658)
        self.assertEqual(response.data[0]["longitude"], -35.7353)

    @patch("apps.events.views.urlopen")
    def test_lat_lon_invalidos_sao_ignorados(self, mocked_urlopen):
        mocked_urlopen.return_value = FakeUrlOpenResponse([
            {"display_name": "Local invalido", "lat": "abc", "lon": "-35.7353"},
            {"display_name": "Maceio", "lat": "-9.6658", "lon": "-35.7353"},
        ])

        response = self.client.get(reverse("geocodificar-endereco"), {"q": "Maceio"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["label"], "Maceio")

    @patch("apps.events.views.urlopen", side_effect=URLError("offline"))
    def test_erro_externo_retorna_503_controlado(self, mocked_urlopen):
        response = self.client.get(reverse("geocodificar-endereco"), {"q": "Maceio"})

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn("detail", response.data)

    @patch("apps.events.views.urlopen")
    def test_sem_resultados_retorna_lista_vazia(self, mocked_urlopen):
        mocked_urlopen.return_value = FakeUrlOpenResponse([])

        response = self.client.get(reverse("geocodificar-endereco"), {"q": "Lugar inexistente"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])
