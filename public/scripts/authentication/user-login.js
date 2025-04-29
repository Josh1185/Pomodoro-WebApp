import { loginContent, loginBtn, loginEmailInput, loginPwdInput, errorDisplay } from "./user-auth-elements.js";
import { validateEmail, validatePwd } from "./client-side-validation.js";

let token = localStorage.getItem('token');
const apiBase = '/';

export async function loginUser() {
  // Access email and pwd values
  const emailVal = loginEmailInput.value;
  const pwdVal = loginPwdInput.value;

  // Client side validation
  const emailValidationErrMsg = validateEmail(emailVal);
  const pwdValidationErrMsg = validatePwd(pwdVal);

  if (emailValidationErrMsg) {
    errorDisplay.style.display = 'block';
    errorDisplay.innerHTML = emailValidationErrMsg;
    return;
  }

  if (pwdValidationErrMsg) {
    errorDisplay.style.display = 'block';
    errorDisplay.innerHTML = pwdValidationErrMsg;
    return;
  }

  errorDisplay.style.display = 'none';
  loginBtn.innerText = 'Authenticating...';

  // Login Logic
  try {
    let data;
    const response = await fetch(apiBase + 'auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: emailVal, password: pwdVal })
    });
    data = await response.json();

    if (data.token) {
      token = data.token;
      localStorage.setItem('token', token);
      loginBtn.innerText = 'loading...';
    } else {
      throw Error('Failed to authenticate. Try again.');
    }

  } catch (err) {
    console.log(err.message);
    errorDisplay.innerText = err.message;
    errorDisplay.style.display = 'block';
  } finally {
    loginBtn.innerText = 'Login';
  }
}

loginBtn.addEventListener('click', loginUser);