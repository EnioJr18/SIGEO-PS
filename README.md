# SIGEO-PS - Sistema de Informação Geográfica de Projetos Sociais

![Python](https://img.shields.io/badge/Python-3.14+-3776AB?logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST_Framework-API-red)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL%2FPostGIS-Geospatial-4169E1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-black)
![IA](https://img.shields.io/badge/IA-Gemini-8E75B2)

O **SIGEO-PS** é uma plataforma web para conectar organizadores, participantes e projetos sociais usando geolocalização, inscrições, avaliação de eventos, dashboard de impacto social e recursos de inteligência artificial.

O sistema permite cadastrar projetos/eventos sociais, localizar iniciativas em mapa, usar autocomplete de endereço com geocoding gratuito via OpenStreetMap/Nominatim, participar de projetos, acompanhar inscrições, avaliar eventos realizados e visualizar indicadores reais de impacto social. A IA está presente no chatbot e também no cadastro de evento, ajudando o organizador a sugerir ou melhorar a descrição do projeto.

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
- [Geocoding e mapa](#geocoding-e-mapa)
- [Avaliação de eventos](#avaliação-de-eventos)
- [Impacto Social](#impacto-social)
- [IA e Chatbot](#ia-e-chatbot)
- [Interface e UX](#interface-e-ux)
- [Validações úteis](#validações-úteis)
- [Status do projeto](#status-do-projeto)
- [Próximas melhorias](#próximas-melhorias)
- [Licença](#licença)
- [Contribuição](#-contribuição)
- [Autores](#-autores)

## Sobre o projeto

Projetos sociais muitas vezes enfrentam dificuldades para divulgar ações, alcançar participantes próximos e centralizar informações de inscrição, localização e acompanhamento. Ao mesmo tempo, pessoas interessadas em voluntariado nem sempre encontram facilmente iniciativas ativas perto de onde vivem.

O SIGEO-PS propõe uma solução web para:

- cadastrar e divulgar projetos sociais;
- localizar iniciativas em mapa interativo;
- permitir inscrição e cancelamento por participantes;
- exibir detalhes do projeto, incluindo link de comprovação quando informado;
- oferecer painéis separados para organizadores e participantes;
- registrar avaliações de eventos;
- exibir métricas reais de impacto social;
- apoiar usuários e organizadores com IA;
- facilitar o cadastro de local usando geocoding gratuito com Nominatim/OpenStreetMap.

## Funcionalidades

### Participante

- Criar conta e fazer login.
- Visualizar projetos sociais disponíveis.
- Buscar projetos por texto e filtrar por categoria.
- Explorar projetos em mapa com geolocalização.
- Ver detalhes de cada projeto.
- Acessar link de comprovação quando o organizador informar esse dado.
- Inscrever-se em projetos.
- Cancelar inscrição.
- Acompanhar agenda e histórico no painel do participante.
- Avaliar eventos com nota e comentário opcional.
- Editar dados básicos do perfil.
- Usar o chatbot/IA para tirar dúvidas sobre voluntariado e uso da plataforma.

### Organizador

- Criar projetos sociais.
- Usar IA para sugerir ou melhorar a descrição do projeto no cadastro.
- Cadastrar o local do projeto com autocomplete/geocoding, sem digitar coordenadas manualmente.
- Editar projetos cadastrados.
- Excluir projetos cadastrados.
- Visualizar painel de gestão.
- Acompanhar eventos criados.
- Ver lista de participantes inscritos por projeto.

### Sistema

- Autenticação com JWT.
- API REST com Django REST Framework.
- Banco PostgreSQL com suporte geográfico via PostGIS.
- Mapa interativo com Leaflet/React Leaflet.
- Geocoding via backend usando Nominatim/OpenStreetMap.
- Dashboard de Impacto Social com dados reais.
- Avaliações de eventos.
- Integração com Gemini usando `google-genai`.
- Fallback local para sugestão de descrição quando a IA externa estiver sem quota, indisponível ou retornar resposta inválida.
- Componentes visuais reutilizáveis no frontend.
- Modais visuais de confirmação para ações críticas, substituindo `alert()`/`confirm()` nativos.
- Tratamento amigável de erros e estados de carregamento/vazio.

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
- google-genai

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Leaflet / React Leaflet
- lucide-react

### IA

- Gemini
- SDK `google-genai`
- Chatbot via `POST /api/ai/chat/`
- Sugestão de descrição via `POST /api/ai/sugerir-descricao-evento/`
- Configuração por variáveis de ambiente: `GEMINI_API_KEY` e `GEMINI_MODEL`
- Fallback local para manter a experiência quando o serviço externo estiver indisponível

## Arquitetura geral

O frontend React consome a API REST do backend Django. O backend concentra as regras de usuários, projetos sociais, inscrições, avaliações, impacto social, geocoding e integração com IA. O PostgreSQL/PostGIS armazena os dados relacionais e geográficos, incluindo a localização dos projetos no mapa.

Fluxo simplificado:

```txt
Usuário
  -> Frontend React + Tailwind
  -> API REST Django/DRF
  -> PostgreSQL/PostGIS
  -> Nominatim/OpenStreetMap, quando busca endereços
  -> Gemini, quando recursos de IA são usados
```

## Estrutura de pastas

Estrutura resumida do repositório:

```txt
sigeo_backend/
|-- back/
|   |-- apps/
|   |   |-- ai_integration/
|   |   |   |-- serializers.py
|   |   |   |-- services.py
|   |   |   |-- urls.py
|   |   |   `-- views.py
|   |   |-- events/
|   |   |   |-- migrations/
|   |   |   |-- models.py
|   |   |   |-- serializers.py
|   |   |   |-- urls.py
|   |   |   `-- views.py
|   |   |-- impact/
|   |   `-- users/
|   |       |-- models.py
|   |       |-- serializers.py
|   |       |-- urls.py
|   |       `-- views.py
|   |-- sigeo_core/
|   |   |-- settings.py
|   |   |-- urls.py
|   |   |-- asgi.py
|   |   `-- wsgi.py
|   |-- manage.py
|   `-- requirements.txt
|-- front_end/
|   |-- public/
|   |-- src/
|   |   |-- components/
|   |   |   |-- events/
|   |   |   |   `-- EventCard.jsx
|   |   |   `-- ui/
|   |   |       |-- Button.jsx
|   |   |       |-- ConfirmDialog.jsx
|   |   |       |-- EmptyState.jsx
|   |   |       |-- Input.jsx
|   |   |       `-- LoadingState.jsx
|   |   |-- pages/
|   |   |-- utils/
|   |   |-- api.js
|   |   |-- App.jsx
|   |   |-- Chatbot.jsx
|   |   `-- EventMap.jsx
|   |-- package.json
|   `-- vite.config.js
|-- README.md
`-- LICENSE
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

Não há uso de `VITE_API_URL` no frontend atual. Essa variável pode ser uma melhoria futura para facilitar deploys em ambientes diferentes.

## Variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `back/` para configurar o backend.

Exemplo sem valores reais:

```env
SECRET_KEY=sua_chave_secreta_django
DEBUG=True
DATABASE_URL=postgres://usuario:senha@host:5432/banco?sslmode=require
GEMINI_API_KEY=sua_chave_gemini_aqui
GEMINI_MODEL=gemini-2.5-flash
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

Variáveis relevantes:

- `SECRET_KEY`: chave secreta do Django.
- `DEBUG`: controla o modo de depuração.
- `DATABASE_URL`: conexão com PostgreSQL/PostGIS.
- `GEMINI_API_KEY`: chave usada pela integração com Gemini.
- `GEMINI_MODEL`: modelo Gemini usado pelo serviço de IA. O projeto usa `gemini-2.5-flash` como padrão quando não houver outro valor configurado.
- `ALLOWED_HOSTS`: hosts permitidos para o Django. No código atual está liberado de forma ampla para facilitar o MVP, mas deve ser restringido em produção.
- `CORS_ALLOWED_ORIGINS`: origens permitidas para o frontend consumir a API.
- `GDAL_LIBRARY_PATH` e `GEOS_LIBRARY_PATH`: opcionais, úteis em ambientes que exigem configuração manual do GeoDjango.

Importante: não versionar valores reais de `.env`, chaves Gemini, credenciais de banco ou segredos de produção.

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
| `GET` | `/api/eventos/geocodificar/?q=<texto>` | Busca sugestões de endereço/local | Público |

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
| `POST` | `/api/ai/sugerir-descricao-evento/` | Sugere ou melhora a descrição de um projeto social | Protegido |

## Geocoding e mapa

O cadastro de projeto possui autocomplete de endereço/local. O usuário informa um texto como cidade, bairro, rua ou local conhecido, e o backend consulta o Nominatim/OpenStreetMap:

```txt
GET /api/eventos/geocodificar/?q=<texto>
```

O usuário não precisa digitar latitude e longitude manualmente. Quando uma sugestão é selecionada, o frontend envia os dados do local e o backend armazena a localização geográfica internamente.

Como o Nominatim depende dos dados disponíveis no OpenStreetMap, locais muito específicos podem não aparecer. Nesses casos, o usuário pode buscar por cidade, bairro, rua próxima ou um ponto de referência mais conhecido.

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
- próximos projetos cadastrados;
- gráficos simples criados com Tailwind/CSS, sem dependência extra de biblioteca de gráficos.

O endpoint foi implementado para lidar com banco vazio, categorias inexistentes e média de avaliação nula sem quebrar a interface.

## IA e Chatbot

O SIGEO-PS possui dois usos principais de IA no backend.

### Chatbot

Endpoint:

```txt
POST /api/ai/chat/
```

Objetivo do chatbot:

- tirar dúvidas sobre voluntariado;
- orientar o usuário sobre como usar a plataforma;
- apoiar a descoberta de projetos sociais;
- responder de forma breve e amigável dentro do contexto do SIGEO-PS.

### Sugestão de descrição de projeto

Endpoint:

```txt
POST /api/ai/sugerir-descricao-evento/
```

Uso no frontend:

- aparece no formulário de criação/edição de projeto;
- permite sugerir uma descrição quando o campo está vazio;
- permite melhorar a descrição quando já existe texto;
- mostra a sugestão em um card;
- o organizador pode usar ou descartar a sugestão;
- o cadastro do projeto continua funcionando mesmo se a IA falhar.

Configuração:

```env
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash
```

A IA externa não deve ser tratada como sempre disponível. Quando o Gemini estiver sem quota, indisponível ou retornar uma resposta vazia/inválida, o backend tenta entregar uma sugestão básica local para preservar a experiência do usuário.

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
- link de comprovação exibido nos modais quando informado;
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

Testes automatizados:

```powershell
cd back
.\.venv\Scripts\activate
python manage.py test
```

Os testes devem ser ampliados conforme o projeto evoluir. Antes de rodar `migrate`, confira se o banco configurado é o ambiente correto.

## Status do projeto

O SIGEO-PS é um projeto funcional em evolução, desenvolvido para fins acadêmicos e de portfólio. As principais funcionalidades de autenticação, projetos sociais, inscrições, geolocalização, avaliação, impacto social e IA já estão implementadas.

O sistema ainda não deve ser tratado como uma solução final 100% pronta para produção. Para uso real em produção, recomenda-se reforçar testes, observabilidade, segurança, deploy, documentação de API e revisão de regras de autorização.

## Próximas melhorias

Possíveis evoluções:

- testes automatizados mais amplos;
- documentação Swagger/OpenAPI;
- deploy final e monitoramento;
- variável de ambiente no frontend para configurar a URL da API;
- gráficos mais avançados no módulo de Impacto Social;
- cache e melhorias de performance;
- melhorias adicionais de acessibilidade;
- filtros avançados no mapa;
- recomendações mais inteligentes com IA;
- notificações para participantes e organizadores;
- painel administrativo mais completo;
- otimização de performance e code splitting para reduzir o chunk principal do Vite.

## Licença

Este projeto está sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests focados na melhoria da arquitetura REST ou otimização de consultas geográficas.

## 👨‍💻 Autores
O ecossistema SIGEO-PS está sendo construído em conjunto pelas equipes de Backend e Frontend:

- Backend e Frontend final (GeoDjango, Inscrições e Infraestrutura): **Enio Jr** <br>
Link GitHub(**EnioJr**): https://github.com/EnioJr18 <br>
- Backend (Autenticação e Perfis JWT): **Guilherme Pontes** <br>
Link GitHub(**Guilherme Pontes**): https://github.com/guilhermedopp <br>
- Frontend (Integração de APIs e UI/UX): **Jean Marcos** e **Kelven Eduardo** <br>
Link GitHub(**Jean Marcos**): https://github.com/jeanmcorreia <br>
Link GitHub(**Kelven Eduardo**): https://github.com/Kel3214 <br>
- Engenheiro de Qualidade — **Matheus Henrique** <br>
Link GitHub(**Matheus Henrique**): https://github.com/mhfp1913 <br>
- Tester (QA funcional) — **Entony Richard** <br>
Link GitHub(**Entony Richard**): https://github.com/entonyifal <br>
- Gerente de Projeto — **Victor Galvão** <br>
Link GitHub(**Victor Galvão**): https://github.com/vgalvaoc <br>
