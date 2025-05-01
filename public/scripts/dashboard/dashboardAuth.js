import { fetchTasks } from "../tasks/taskStorage.js";

export const token = localStorage.getItem('token');

window.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = '/';
    return;
  }

  // If there's a valid token
  document.body.style.display = 'block';
  // Render tasks for that user
  async function fetchUserData() {
    await fetchTasks();
  }
  
  fetchUserData();
});
