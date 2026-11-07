// Уже вошли — сразу на профиль (выполняется в <head>, до отрисовки формы).
if (getAccessToken()) {
  location.replace('profile.html');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const usernameError = document.getElementById('username-error');
  const passwordError = document.getElementById('password-error');
  const formError = document.getElementById('form-error');
  const submitButton = document.getElementById('submit-button');

  function setFieldError(input, errorEl, message) {
    errorEl.textContent = message;
    input.classList.toggle('input--invalid', Boolean(message));
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function setFormError(message) {
    formError.textContent = message;
    formError.hidden = !message;
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? 'Вход...' : 'Войти';
  }

  // Ошибка поля исчезает, как только пользователь начинает печатать
  usernameInput.addEventListener('input', () => setFieldError(usernameInput, usernameError, ''));
  passwordInput.addEventListener('input', () => setFieldError(passwordInput, passwordError, ''));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    setFormError('');

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Валидация: пустые поля — ошибка под полем, запрос не отправляем
    let isValid = true;
    if (!username) {
      setFieldError(usernameInput, usernameError, 'Введите логин');
      isValid = false;
    }
    if (!password.trim()) {
      setFieldError(passwordInput, passwordError, 'Введите пароль');
      isValid = false;
    }
    if (!isValid) {
      (username ? passwordInput : usernameInput).focus();
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(API_URL + '/auth/login', { username, password });
      saveTokens(data);
      location.replace('profile.html');
    } catch (error) {
      const status = error.response && error.response.status;
      if (status === 400 || status === 401) {
        setFormError('Неверный логин или пароль');
      } else {
        setFormError('Не удалось связаться с сервером. Попробуйте ещё раз.');
      }
      setLoading(false);
    }
  });
});
