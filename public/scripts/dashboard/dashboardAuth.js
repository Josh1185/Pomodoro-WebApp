import { jwtDecode } from "https://cdn.skypack.dev/jwt-decode";
import { fetchTasks } from "../tasks/taskStorage.js";
import { initializeTimer } from "../timer/timerLogic.js";
import { getMinutes } from "../timer/timerState.js";
import { initSettings, settingsCache } from "../settings/settingsFetch.js";

function isTokenExpired(token) {
  try {
    const { exp } = jwtDecode(token);
    return Date.now() >= exp * 1000;
  }
  catch {
    return true; // Expired or invalid token
  }
}

export const token = localStorage.getItem('token');

window.addEventListener('DOMContentLoaded', () => {
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    window.location.href = '/';
    return;
  }

  // If there's a valid token
  document.body.style.display = 'block';
  // Render data for that user
  async function fetchUserData() {
    try {
      if (!settingsCache) {
        await initSettings();
      }
      await fetchTasks();
      initializeTimer(getMinutes('pomo'));
    }
    catch (err) {
      console.error('Error loading user data:', err);
    }
  }
  
  fetchUserData();
});