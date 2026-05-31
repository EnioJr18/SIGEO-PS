const API_BASE = '/api';

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
    let details = 'Erro ao processar requisicao.';

    try {
      const data = await response.json();
      details = formatApiError(data);
    } catch {
      details = formatHttpError(response);
    }

    throw new Error(details);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function formatHttpError(response) {
  if (response.status === 502 || response.status === 504) {
    return 'Servidor indisponivel. Verifique se o backend Django e o banco PostgreSQL estao rodando.';
  }

  return response.statusText || 'Erro ao processar requisicao.';
}

function formatApiError(data) {
  if (!data || typeof data !== 'object') {
    return 'Erro ao processar requisicao.';
  }

  if (data.detail) {
    return String(data.detail);
  }

  return Object.entries(data)
    .map(([field, messages]) => {
      const text = Array.isArray(messages) ? messages.join(' ') : String(messages);
      return `${field}: ${text}`;
    })
    .join(' ');
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
