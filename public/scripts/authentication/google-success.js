// Immediately run this when the page loads
    window.onload = function () {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (token) {
        localStorage.setItem('token', token);
        // Redirect to dashboard
        window.location.href = '/dashboard';
      } else {
        document.body.innerHTML = '<p>Login failed. No token received.</p>';
      }
    }