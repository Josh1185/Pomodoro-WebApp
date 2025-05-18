import { token } from "../dashboard/dashboardAuth.js";
import { apiBase } from "../tasks/taskStorage.js";
import { usernameStatDisplay, personalStatsContainer, streakDisplay, totalStudyMinsDisplay, totalPomosDisplay, completedTasksDisplay } from "./statsElements.js";

export async function fetchStats() {
  try {
    // Make api request
    const response = await fetch(`${apiBase}stats`, {
      headers: { 'Authorization': token }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch stats data');
    }
    const statsData = await response.json();
    renderStats(statsData);
  }
  catch (err) {
    console.log('Failed to fetch stats data', err);
  }
}

export async function fetchPomodoroSessions() {
  try {
    // make api request
    const response = await fetch(`${apiBase}stats/pomodoro-history`, {
      headers: { 'Authorization': token }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch pomodoro session history');
    }

    const pomodoroHistory = await response.json();
    return pomodoroHistory;
  }
  catch (err) {
    console.log('Failed to fetch pomodoro session history', err);
  }
}

// Still a work in progress
function renderStats(stats) {
  personalStatsContainer.innerHTML = `
    <h4 class="username-stat-display">Username's stats</h4>

    <div class="stat-widgets">
      <div class="stat-widget">
        <p>Daily Streak</p>
        <h5 class="streak-display">${stats.consecutive_days_streak}</h5>
      </div>
      <div class="stat-widget">
        <p>Total Study Mins</p>
        <h5 class="total-study-mins-display">${stats.total_pomodoro_time}</h5>
      </div>
      <div class="stat-widget">
        <p>Completed Pomodoros</p>
        <h5 class="total-pomos-display">${stats.total_pomodoros_completed}</h5>
      </div>
      <div class="stat-widget">
        <p>Completed Tasks</p>
        <h5 class="completed-tasks-display">${stats.total_tasks_completed}</h5>
      </div>
    </div>
  `;
}