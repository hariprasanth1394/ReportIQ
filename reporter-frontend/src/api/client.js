import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export const api = axios.create({
  baseURL,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem('reporter_token', token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem('reporter_token');
  }
}

export function initAuthFromStorage() {
  const token = localStorage.getItem('reporter_token');
  if (token) setAuthToken(token);
  return token;
}
