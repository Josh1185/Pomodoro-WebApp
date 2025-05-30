
import { fetchTasks } from "../tasks/taskStorage.js";
import { initializeTimer } from "../timer/timerLogic.js";
import { getMinutes } from "../timer/timerState.js";
import { initSettings, settingsCache } from "../settings/settingsFetch.js";
import { fetchLeaderboardData, fetchStats, checkStreak } from '../stats/statsFetch.js';
import { createPomodoroChart, updateChart, updateChartAccentColor } from "../stats/statsGraph.js";

function isTokenExpired(token) {
  try {
    const { exp } = jwt_decode(token);
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
      createPomodoroChart();
      await initSettings();
      updateChartAccentColor();
      await checkStreak();
      await fetchStats();
      await fetchTasks();
      await updateChart('daily');
      initializeTimer(getMinutes('pomo'));
    }
    catch (err) {
      console.error('Error loading user data:', err);
    }
  }
  
  fetchUserData();
});