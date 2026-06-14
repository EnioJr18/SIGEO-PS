const API_BASE = 'https://sigeops.onrender.com/api';

function getAuthToken() {
  return (
    localStorage.getItem('accessToken') ||
    localStorage.getItem('access') ||
    localStorage.getItem('token') ||
    ''
  );
}

async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const details = await readErrorDetails(response)
    throw new Error(normalizeErrorMessage(details, response))
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function formatHttpError(response) {
  if (response.status === 400) {
    return 'Requisição inválida. Verifique os campos enviados.';
  }

  if (response.status === 401) {
    return 'Você precisa entrar para continuar.';
  }

  if (response.status === 403) {
    return 'Você não tem permissão para realizar esta ação.';
  }

  if (response.status === 404) {
    return 'O recurso solicitado não foi encontrado.';
  }

  if (response.status === 502 || response.status === 504) {
    return 'Servidor indisponível. Verifique se o backend Django e o banco PostgreSQL estão rodando.';
  }

  if (response.status === 500) {
    return 'Erro interno no servidor. Tente novamente em instantes.';
  }

  return 'Erro ao processar requisição.';
}

async function readErrorDetails(response) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    try {
      const data = await response.json()
      const formatted = formatApiError(data)
      if (formatted) {
        return formatted
      }
    } catch {
      return formatHttpError(response)
    }
  }

  try {
    const text = await response.text()
    if (text.trim()) {
      return text.trim()
    }
  } catch {
    return formatHttpError(response)
  }

  return formatHttpError(response)
}

function normalizeErrorMessage(message, response) {
  const normalized = String(message || '').trim()

  if (!normalized || normalized === 'Bad Request') {
    return formatHttpError(response)
  }

  return normalized
}

function formatApiError(data) {
  if (!data || typeof data !== 'object') {
    return '';
  }

  if (data.detail) {
    return String(data.detail)
  }

  return Object.entries(data)
    .map(([field, messages]) => {
      const text = Array.isArray(messages) ? messages.join(' ') : String(messages);
      return `${field}: ${text}`;
    })
    .join(' ')
}

export async function listEventos({ search = '', categoria = '' } = {}) {
  const params = new URLSearchParams();

  if (search.trim()) {
    params.set('search', search.trim());
  }

  if (categoria.trim()) {
    params.set('categoria', categoria.trim());
  }

  const query = params.toString();
  return request(`/eventos/${query ? `?${query}` : ''}`);
}

export async function inscreverEvento(eventoId) {
  return request('/eventos/inscricoes/', {
    method: 'POST',
    body: JSON.stringify({ evento: eventoId }),
  });
}

export async function createEvento(payload) {
  return request('/eventos/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function registerUser(payload) {
  return request('/users/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload) {
  return request('/users/login/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getProfile() {
  return request('/users/me/');
}

export async function getInscricoesRecebidas() {
  return request('/eventos/inscricoes-recebidas/');
}

// Adicione isso junto com as outras funções do api.js
export const cancelarInscricao = async (eventoId) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token')

  const response = await fetch(`${API_BASE}/eventos/${eventoId}/cancelar-inscricao/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Falha ao cancelar inscrição')
  }

  return true
}

export async function getMinhasInscricoes() {
  return request('/eventos/minhas-inscricoes/');
}

// Função para o Organizador deletar seu próprio evento
export const deleteEvento = async (eventoId) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  const response = await fetch(`${API_BASE}/eventos/${eventoId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok && response.status !== 204) {
    throw new Error('Falha ao excluir o projeto. Verifique suas permissões.');
  }

  return true;
};

// Função para o Organizador editar um projeto existente
export const updateEvento = async (eventoId, payload) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}/eventos/${eventoId}/`, {
    method: 'PATCH', // Usamos PATCH para atualizar apenas os campos enviados
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Falha ao atualizar o projeto. Verifique os dados.');
  }

  return response.json();
};

// Função para buscar um único evento pelo ID (para edição)
export const getEvento = async (eventoId) => {
  const response = await fetch(`${API_BASE}/eventos/${eventoId}/`);
  if (!response.ok) {
    throw new Error('Falha ao carregar os dados do projeto.');
  }
  return response.json();
};