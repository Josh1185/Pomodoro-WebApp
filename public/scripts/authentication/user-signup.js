import { signUpContent, signUpBtn, signUpEmailInput, signUpPwdInput, errorDisplay } from "./user-auth-elements.js";
import { validateEmail, validatePwd } from './client-side-validation.js';

let token = localStorage.getItem('token');
const apiBase = '/';

export async function registerNewUser() {
  // Access email and pwd values
  const emailVal = signUpEmailInput.value;
  const pwdVal = signUpPwdInput.value;

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
  signUpBtn.innerText = 'Authenticating...';

  // Registration logic
  try {
    let data;
    const response = await fetch(apiBase + 'auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: emailVal, password: pwdVal })
    });
    data = await response.json();

    
    if (data.token) {
      token = data.token;
      localStorage.setItem('token', token);
      signUpBtn.innerText = 'Loading...';
    } else {
      throw Error('Failed to authenticate...');
    }
    
  } catch (err) {
    console.log(err.message);
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
