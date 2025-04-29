export function logoutUser(redirectPath = '/login') {
  localStorage.removeItem('token');
  window.location.href = redirectPath;
}