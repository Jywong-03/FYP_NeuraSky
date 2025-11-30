import { API_BASE_URL } from '../app/config';

// Helper to get tokens
const getTokens = () => ({
  access: localStorage.getItem('authToken'),
  refresh: localStorage.getItem('refreshToken'),
});

// Helper to set tokens
const setTokens = (access, refresh) => {
  if (access) localStorage.setItem('authToken', access);
  if (refresh) localStorage.setItem('refreshToken', refresh);
};

// Helper to clear tokens
const clearTokens = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
};

// The core fetch wrapper
const fetchWithAuth = async (endpoint, options = {}) => {
  const { access, refresh } = getTokens();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (access) {
    headers['Authorization'] = `Bearer ${access}`;
  }

  const config = {
    ...options,
    headers,
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle 401 (Unauthorized) - Try to refresh token
  if (response.status === 401 && refresh) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setTokens(data.access, data.refresh); // Update tokens (some backends rotate refresh tokens too)
        
        // Retry original request with new token
        config.headers['Authorization'] = `Bearer ${data.access}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      } else {
        // Refresh failed - logout
        clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    } catch (error) {
      clearTokens();
      window.location.href = '/login';
      throw error;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || 'API request failed');
  }

  // Return null for 204 No Content, otherwise JSON
  if (response.status === 204) return null;
  return response.json();
};

export const api = {
  get: (endpoint) => fetchWithAuth(endpoint, { method: 'GET' }),
  post: (endpoint, body) => fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => fetchWithAuth(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint, body) => fetchWithAuth(endpoint, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    
    const data = await response.json();
    setTokens(data.access, data.refresh);
    return data;
  },
  logout: async () => {
    const { refresh } = getTokens();
    if (refresh) {
      try {
        await fetchWithAuth('/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refresh }),
        });
      } catch (e) {
        console.error('Logout API call failed', e);
      }
    }
    clearTokens();
    window.location.href = '/login';
  }
};
