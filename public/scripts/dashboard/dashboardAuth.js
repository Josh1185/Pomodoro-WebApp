import { fetchTasks } from "../tasks/taskStorage.js";
import { initializeTimer } from "../timer/timerLogic.js";
import { getMinutes } from "../timer/timerState.js";

export const token = localStorage.getItem('token');

window.addEventListener('DOMContentLoaded', () => {
  if (!token) {
    window.location.href = '/';
    return;
  }

  // If there's a valid token
  document.body.style.display = 'block';
  // Render data for that user
  async function fetchUserData() {
    await fetchTasks();
    initializeTimer(getMinutes('pomo'));
  }
  
  fetchUserData();
});