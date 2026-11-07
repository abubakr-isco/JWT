// Общие функции для работы с токенами — подключается на обеих страницах.

const API_URL = 'https://dummyjson.com';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function saveTokens({ accessToken, refreshToken }) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Выход: удаляем токены и уходим на страницу входа.
// replace — чтобы кнопка «Назад» не возвращала на защищённую страницу.
function logout() {
  clearTokens();
  location.replace('login.html');
}

// Считаем ошибку «ошибкой авторизации», если сервер не принял токен.
// Обычно это 401. Но dummyjson на испорченный токен часто отвечает 500:
//   - испорчена подпись  → 500 { message: "invalid signature" }
//   - испорчен payload   → 500 { message: "Bad control character in string literal..." }
// Единственное, что мы передаём в /auth/me, — это токен, поэтому 500 тоже
// значит «токен не годится». Нет ответа вовсе (нет сети) — это не ошибка авторизации.
function isAuthError(error) {
  const status = error && error.response && error.response.status;
  return status === 401 || status === 403 || status === 500;
}
