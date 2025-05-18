import { signUpContent, signUpBtn, signUpEmailInput, signUpPwdInput, errorDisplay, signUpConfirmPwdInput } from "./user-auth-elements.js";
import { validateEmail, validatePwd, pwdsMatch, sanitizeInput } from './client-side-validation.js';

// Redirect if user is already logged in
if (localStorage.getItem('token')) {
  window.location.href = '/dashboard';
}

let token = localStorage.getItem('token');
const apiBase = '/';

export async function registerNewUser() {
  // Access email and pwd values
  const emailVal = sanitizeInput(signUpEmailInput.value);
  const pwdVal = sanitizeInput(signUpPwdInput.value);
  const confirmPwdVal = sanitizeInput(signUpConfirmPwdInput.value);

  // Client side validation
  const emailValidationErrMsg = validateEmail(emailVal);
  const pwdValidationErrMsg = validatePwd(pwdVal);
  const confirmPwdValidationErrMsg = pwdsMatch(confirmPwdVal, pwdVal);

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

  if (confirmPwdValidationErrMsg) {
    errorDisplay.style.display = 'block';
    errorDisplay.innerHTML = confirmPwdValidationErrMsg;
    return;
  }

  errorDisplay.style.display = 'none';
  signUpBtn.innerText = 'Authenticating...';

  // Registration logic
  const index = emailVal.indexOf('@');
  const username = emailVal.slice(0, index);

  try {
    let data;
    const response = await fetch(apiBase + 'auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username, email: emailVal, password: pwdVal })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw Error(errorData.error || 'Registration failed. Try again');
    }

    data = await response.json();

    token = data.token;
    localStorage.setItem('token', token);
    signUpBtn.innerText = 'Loading...';
    
    // Redirect
    window.location.href = '/dashboard';

  } catch (err) {
    errorDisplay.innerText = err.message;
    errorDisplay.style.display = 'block';
  } finally {
    signUpBtn.innerText = 'Sign Up';
  }
}

signUpContent.addEventListener('submit', e => {
  e.preventDefault();
});
signUpBtn.addEventListener('click', registerNewUser);
