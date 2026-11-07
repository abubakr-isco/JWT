// Нет токена — на страницу входа (выполняется в <head>, до отрисовки).
if (!getAccessToken()) {
  location.replace('login.html');
}

// GET /auth/me с access-токеном в заголовке Authorization
function requestMe() {
  return axios.get(API_URL + '/auth/me', {
    headers: { Authorization: 'Bearer ' + getAccessToken() },
  });
}

// POST /auth/refresh — получаем новую пару токенов по refresh-токену
async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('Нет refresh-токена');
  }
  const { data } = await axios.post(API_URL + '/auth/refresh', { refreshToken });
  saveTokens(data);
}

// Загружает профиль. При ошибке авторизации один раз пробует обновить токен
// и повторить запрос. Если не вышло — выход. Возвращает null, если был выход.
async function loadProfile() {
  try {
    const { data } = await requestMe();
    return data;
  } catch (error) {
    if (!isAuthError(error)) throw error;
  }

  try {
    await refreshTokens();
  } catch {
    logout();
    return null;
  }

  try {
    const { data } = await requestMe();
    return data;
  } catch (error) {
    if (isAuthError(error)) {
      logout();
      return null;
    }
    throw error;
  }
}

function renderProfile(user) {
  const fullName = `${user.firstName} ${user.lastName}`;

  const avatar = document.getElementById('avatar');
  avatar.src = user.image;
  avatar.alt = fullName;

  document.getElementById('full-name').textContent = fullName;
  document.getElementById('username').textContent = '@' + user.username;
  document.getElementById('email').textContent = user.email;
  document.getElementById('email').href = 'mailto:' + user.email;
  document.getElementById('age').textContent = user.age;
  document.getElementById('city').textContent = (user.address && user.address.city) || '—';
}

function showState(name) {
  for (const id of ['loading', 'profile', 'error']) {
    document.getElementById(id).hidden = id !== name;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!getAccessToken()) return; // редирект уже запущен — не шлём лишний запрос

  document.getElementById('logout-button').addEventListener('click', logout);
  document.getElementById('retry-button').addEventListener('click', start);

  async function start() {
    showState('loading');
    try {
      const user = await loadProfile();
      if (!user) return; // уже ушли на login.html
      renderProfile(user);
      showState('profile');
    } catch {
      showState('error');
    }
  }

  start();
});
