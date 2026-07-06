# SIGEO-PS - Sistema de Informação Geográfica de Projetos Sociais

![Python](https://img.shields.io/badge/Python-3.14+-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-API-red)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL%2FPostGIS-Geospatial-4169E1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black)
![IA](https://img.shields.io/badge/IA-Gemini-8E75B2)

O **SIGEO-PS** é uma plataforma web para conectar organizadores, participantes e projetos sociais usando geolocalização, inscrições, avaliação de eventos e apoio de IA. O sistema permite cadastrar iniciativas sociais, visualizá-las em mapa, participar de projetos, acompanhar inscrições e medir indicadores reais de impacto social.

Este repositório reúne **backend Django/DRF** e **frontend React/Tailwind CSS** no mesmo projeto. A aplicação foi desenvolvida como projeto acadêmico/portfólio, com funcionalidades principais implementadas e espaço claro para evolução técnica.

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias utilizadas](#tecnologias-utilizadas)
- [Arquitetura geral](#arquitetura-geral)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Como rodar o backend](#como-rodar-o-backend)
- [Como rodar o frontend](#como-rodar-o-frontend)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Rotas principais da API](#rotas-principais-da-api)
- [Avaliação de eventos](#avaliação-de-eventos)
- [Impacto Social](#impacto-social)
- [IA e Chatbot](#ia-e-chatbot)
- [Interface e UX](#interface-e-ux)
- [Validações úteis](#validações-úteis)
- [Status do projeto](#status-do-projeto)
- [Próximas melhorias](#próximas-melhorias)
- [Autor](#autor)

## Sobre o projeto

Projetos sociais muitas vezes enfrentam dificuldades para divulgar ações, alcançar participantes próximos e centralizar informações de inscrição, localização e acompanhamento. Ao mesmo tempo, pessoas interessadas em voluntariado nem sempre encontram facilmente iniciativas ativas perto de onde vivem.

O SIGEO-PS propõe uma solução web para:

- cadastrar e divulgar projetos sociais;
- localizar iniciativas em mapa interativo;
- permitir inscrição e cancelamento por participantes;
- oferecer painéis separados para organizadores e participantes;
- registrar avaliações de eventos;
- exibir métricas reais de impacto social;
- apoiar o usuário com um chatbot integrado à IA.

## Funcionalidades

### Participante

- Criar conta e fazer login.
- Visualizar projetos sociais disponíveis.
- Buscar projetos por texto e filtrar por categoria.
- Explorar projetos em mapa com geolocalização.
- Inscrever-se em projetos.
- Cancelar inscrição.
- Acompanhar agenda e histórico no painel do participante.
- Avaliar eventos realizados com nota e comentário opcional.
- Editar dados básicos do perfil.
- Usar o chatbot/IA para tirar dúvidas sobre voluntariado e uso da plataforma.

### Organizador

- Criar projetos sociais.
- Editar e excluir projetos cadastrados.
- Visualizar painel de gestão.
- Acompanhar quantidade de inscritos.
- Ver lista de participantes inscritos por projeto.

### Sistema

- Autenticação com JWT.
- API REST com Django REST Framework.
- Banco PostgreSQL com suporte geográfico via PostGIS.
- Dashboard de Impacto Social com dados reais.
- Integração com Gemini via backend.
- Componentes visuais reutilizáveis no frontend.
- Modais visuais para confirmação de ações críticas, substituindo `alert()`/`confirm()` nativos.

## Tecnologias utilizadas

### Backend

- Python
- Django
- Django REST Framework
- Django Filter
- Simple JWT
- PostgreSQL
- PostGIS / GeoDjango
- django-environ
- django-cors-headers
- WhiteNoise

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Leaflet / React Leaflet
- lucide-react

### IA

- Gemini
- Pacote `google.generativeai`
- Endpoint próprio no backend: `POST /api/ai/chat/`
- Configuração por variável de ambiente: `GEMINI_API_KEY`

## Arquitetura geral

O frontend React consome a API REST do backend Django. O backend concentra as regras de usuários, projetos sociais, inscrições, avaliações, impacto social e integração com IA. O PostgreSQL/PostGIS armazena os dados relacionais e geográficos, incluindo a localização dos projetos no mapa.

Fluxo simplificado:

```txt
Usuário
  -> Frontend React + Tailwind
  -> API REST Django/DRF
  -> PostgreSQL/PostGIS
  -> Gemini API, quando o chatbot é usado
```

## Estrutura de pastas

Estrutura resumida do repositório:

```txt
sigeo_backend/
├── back/
│   ├── apps/
│   │   ├── ai_integration/
│   │   │   ├── serializers.py
│   │   │   ├── services.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── events/
│   │   │   ├── migrations/
│   │   │   ├── models.py
│   │   │   ├── serializers.py
│   │   │   ├── urls.py
│   │   │   └── views.py
│   │   ├── impact/
│   │   └── users/
│   │       ├── models.py
│   │       ├── serializers.py
│   │       ├── urls.py
│   │       └── views.py
│   ├── sigeo_core/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── manage.py
│   └── requirements.txt
├── front_end/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── events/
│   │   │   │   └── EventCard.jsx
│   │   │   └── ui/
│   │   │       ├── Button.jsx
│   │   │       ├── ConfirmDialog.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── Input.jsx
│   │   │       └── LoadingState.jsx
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── Chatbot.jsx
│   │   └── EventMap.jsx
│   ├── package.json
│   └── vite.config.js
├── README.md
└── LICENSE
```

## Como rodar o backend

Comandos para Windows/PowerShell:

```powershell
cd back
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Por padrão, o backend ficará disponível em:

```txt
http://127.0.0.1:8000
```

Observação: se o `DATABASE_URL` apontar para um banco remoto, como Neon, confirme o ambiente antes de executar `migrate`.

## Como rodar o frontend

Comandos para Windows/PowerShell:

```powershell
cd front_end
npm install
npm run dev
```

Por padrão, o Vite disponibiliza o frontend em:

```txt
http://localhost:5173
```

Atualmente, o frontend usa a constante `API_BASE` em `front_end/src/api.js`, apontando para:

```js
http://localhost:8000/api
```

## Variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `back/` para configurar o backend.

Exemplo sem valores reais:

```env
SECRET_KEY=sua_chave_secreta_django
DEBUG=True
DATABASE_URL=postgres://usuario:senha@host:5432/banco?sslmode=require
GEMINI_API_KEY=sua_chave_gemini_aqui
```

Variáveis relevantes:

- `SECRET_KEY`: chave secreta do Django.
- `DEBUG`: controla o modo de depuração.
- `DATABASE_URL`: conexão com PostgreSQL/PostGIS.
- `GEMINI_API_KEY`: chave usada pela integração com Gemini.
- `GDAL_LIBRARY_PATH` e `GEOS_LIBRARY_PATH`: opcionais, úteis em ambientes que exigem configuração manual do GeoDjango.

Configurações como `ALLOWED_HOSTS` e `CORS_ALLOWED_ORIGINS` estão em `back/sigeo_core/settings.py` e devem ser revisadas conforme o ambiente de deploy.

## Rotas principais da API

Base local:

```txt
http://localhost:8000/api
```

### Usuários e autenticação

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/api/users/register/` | Cadastro de usuário | Público |
| `POST` | `/api/users/login/` | Login com JWT | Público |
| `POST` | `/api/users/token/refresh/` | Renovação de token JWT | Público |
| `GET` | `/api/users/perfil/` | Dados do usuário autenticado | Protegido |
| `PATCH` | `/api/users/perfil/` | Atualização do perfil | Protegido |
| `DELETE` | `/api/users/perfil/` | Exclusão da conta | Protegido |

### Projetos sociais

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `GET` | `/api/eventos/` | Lista projetos sociais | Público |
| `POST` | `/api/eventos/` | Cria projeto social | Protegido |
| `GET` | `/api/eventos/<id>/` | Detalha um projeto | Público |
| `PATCH` | `/api/eventos/<id>/` | Atualiza projeto | Protegido |
| `DELETE` | `/api/eventos/<id>/` | Exclui projeto | Protegido |

### Inscrições

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/api/eventos/inscricoes/` | Inscreve participante em projeto | Protegido |
| `GET` | `/api/eventos/minhas-inscricoes/` | Lista inscrições do participante autenticado | Protegido |
| `GET` | `/api/eventos/inscricoes-recebidas/` | Lista inscrições recebidas pelo organizador | Protegido |
| `DELETE` | `/api/eventos/<evento_id>/cancelar-inscricao/` | Cancela inscrição do usuário no projeto | Protegido |

### Avaliações e impacto social

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/api/eventos/<evento_id>/avaliar/` | Cria ou atualiza avaliação do participante | Protegido |
| `GET` | `/api/eventos/impacto-social/` | Retorna métricas reais de impacto social | Público |

### IA

| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| `POST` | `/api/ai/chat/` | Envia mensagem para o chatbot com Gemini | Público |

## Avaliação de eventos

O sistema possui avaliação de eventos sociais por participantes. A avaliação é vinculada ao usuário autenticado e ao projeto avaliado.

Regras implementadas:

- nota obrigatória de 1 a 5;
- comentário opcional;
- participante obtido a partir do token JWT, não do payload;
- uma avaliação por participante/evento;
- se a avaliação já existir, o endpoint atualiza o registro;
- apenas usuários com inscrição confirmada no projeto podem avaliar.

Endpoint:

```txt
POST /api/eventos/<evento_id>/avaliar/
```

Exemplo de corpo:

```json
{
  "nota": 5,
  "comentario": "Projeto muito bem organizado."
}
```

## Impacto Social

O módulo de Impacto Social usa dados reais do backend para gerar indicadores do sistema.

Endpoint:

```txt
GET /api/eventos/impacto-social/
```

Dados exibidos no frontend:

- total de projetos sociais;
- total de inscrições confirmadas;
- participantes únicos;
- total e média de avaliações;
- distribuição de projetos por categoria;
- próximos projetos cadastrados.

O endpoint foi implementado para lidar com banco vazio, categorias inexistentes e média de avaliação nula sem quebrar a interface.

## IA e Chatbot

O SIGEO-PS possui um chatbot conectado ao backend por meio do endpoint:

```txt
POST /api/ai/chat/
```

A integração usa Gemini, configurado pela variável de ambiente:

```env
GEMINI_API_KEY=sua_chave_aqui
```

Objetivo do chatbot:

- tirar dúvidas sobre voluntariado;
- orientar o usuário sobre como usar a plataforma;
- apoiar a descoberta de projetos sociais;
- responder de forma breve e amigável dentro do contexto do SIGEO-PS.

## Interface e UX

O frontend foi refinado com foco em usabilidade, responsividade e consistência visual.

Pontos implementados:

- dark theme com azul/esmeralda;
- cards modernos;
- gradientes suaves;
- ícones com `lucide-react`;
- componentes reutilizáveis:
  - `Button`;
  - `Input`;
  - `LoadingState`;
  - `EmptyState`;
  - `EventCard`;
  - `ConfirmDialog`;
- botão de mostrar/ocultar senha em Login e Cadastro;
- modal visual para ações críticas;
- estados de carregamento, vazio e erro;
- responsividade para mobile, tablet e desktop;
- acessibilidade básica com labels, aria-labels, foco visível e semântica de modal.

## Validações úteis

Frontend:

```powershell
cd front_end
npm run lint
npm run build
```

Backend:

```powershell
cd back
.\.venv\Scripts\activate
python manage.py check
```

Migrações:

```powershell
cd back
.\.venv\Scripts\activate
python manage.py makemigrations
python manage.py migrate
```

Antes de rodar `migrate`, confira se o banco configurado é o ambiente correto.

## Status do projeto

O SIGEO-PS é um projeto funcional em evolução, desenvolvido para fins acadêmicos e de portfólio. As principais funcionalidades de autenticação, projetos sociais, inscrições, geolocalização, avaliação, impacto social e IA já estão implementadas.

O sistema ainda não deve ser tratado como uma solução final 100% pronta para produção. Para uso real em produção, recomenda-se reforçar testes, observabilidade, segurança, deploy, documentação de API e revisão de regras de autorização.

## Próximas melhorias

Possíveis evoluções:

- testes automatizados mais completos;
- documentação Swagger/OpenAPI;
- deploy completo e documentado;
- variáveis de ambiente no frontend para configurar a URL da API;
- gráficos mais avançados no módulo de Impacto Social;
- filtros avançados no mapa;
- recomendações mais inteligentes com IA;
- notificações para participantes e organizadores;
- painel administrativo mais completo;
- otimização de performance e code splitting no frontend.

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests focados na melhoria da arquitetura REST ou otimização de consultas geográficas.

## 👨‍💻 Autores
O ecossistema SIGEO-PS está sendo construído em conjunto pelas equipes de Backend e Frontend:

- Backend e Frontend final (GeoDjango, Inscrições e Infraestrutura): **Enio Jr**
Link GitHub(**EnioJr**): https://github.com/EnioJr18
- Backend (Autenticação e Perfis JWT): **Guilherme Pontes**
Link GitHub(**Guilherme Pontes**): https://github.com/guilhermedopp
- Frontend (Integração de APIs e UI/UX): **Jean Marcos** e **Kelven Eduardo**
Link GitHub(**Jean Marcos**): https://github.com/jeanmcorreia
Link GitHub(**Kelven Eduardo**): https://github.com/Kel3214
- Engenheiro de Qualidade — **Matheus Henrique**
Link GitHub(**Matheus Henrique**): https://github.com/mhfp1913
- Tester (QA funcional) — **Entony Richard**
Link GitHub(**Entony Richard**): https://github.com/entonyifal
- Gerente de Projeto — **Victor Galvão**
Link GitHub(**Victor Galvão**): https://github.com/vgalvaoc