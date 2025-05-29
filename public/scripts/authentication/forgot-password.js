import { validateEmail, sanitizeInput } from "./client-side-validation.js";
import { errorDisplay } from "./user-auth-elements.js";

// Redirect if user is already logged in
if (localStorage.getItem('token')) {
  window.location.href = '/dashboard';
}

document.getElementById('forgot-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    // Access email value
    const email = sanitizeInput(document.querySelector('.forgot-email-input').value);

    const emailValidationErrMsg = validateEmail(email);
    if (emailValidationErrMsg) {
      errorDisplay.style.display = 'block';
      errorDisplay.innerHTML = emailValidationErrMsg;
      return;
    }
    errorDisplay.style.display = 'none';

    const res = await fetch('/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    document.querySelector('.forgot-message').textContent = data.message;
  }
  catch (err) {
    document.querySelector('.forgot-message').textContent = "Network error. Please try again.";
  }
});