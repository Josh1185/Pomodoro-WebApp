import { validatePwd, sanitizeInput } from "./client-side-validation.js";
import { errorDisplay } from "./user-auth-elements.js";

// Redirect if user is already logged in
if (localStorage.getItem('token')) {
  window.location.href = '/dashboard';
}

// Get token from URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

document.getElementById('reset-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    // Access email value
    const newPassword = sanitizeInput(document.querySelector('.new-password-input').value);

    const newPasswordValidationErrMsg = validatePwd(newPassword);
    if (newPasswordValidationErrMsg) {
      errorDisplay.style.display = 'block';
      errorDisplay.innerHTML = newPasswordValidationErrMsg;
      return;
    }
    errorDisplay.style.display = 'none';

    const res = await fetch('/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword })
    });
    const data = await res.json();
    document.querySelector('.reset-message').textContent = data.message || data.error;
  }
  catch (err) {
    document.querySelector('.reset-message').textContent = "Network error. Please try again.";
  }
});