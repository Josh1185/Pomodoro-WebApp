import { token } from "../dashboard/dashboardAuth.js";
import { apiBase } from "../tasks/taskStorage.js";
import { usernameStatDisplay, personalStatsContainer, streakDisplay, totalStudyMinsDisplay, totalPomosDisplay, completedTasksDisplay, leaderboardContainer, leaderboardEntries } from "./statsElements.js";

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

export async function fetchLeaderboardData() {
  try {
    // make api request
    const response = await fetch(`${apiBase}stats/leaderboards`, {
      headers: { 'Authorization': token }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch leaderboard data');
    }
    const leaderboardData = await response.json();

    renderLeaderboard(leaderboardData);
  }
  catch (err) {
    console.log('Failed to fetch leaderboard data', err);
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
function renderStats(data) {
  personalStatsContainer.innerHTML = `
    <h4 class="username-stat-display">${data.username.username}'s stats</h4>

    <div class="stat-widgets">
      <div class="stat-widget streak-widget">
        <p>Daily Streak</p>
        <h5 class="streak-display">
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M240-400q0 52 21 98.5t60 81.5q-1-5-1-9v-9q0-32 12-60t35-51l113-111 113 111q23 23 35 51t12 60v9q0 4-1 9 39-35 60-81.5t21-98.5q0-50-18.5-94.5T648-574q-20 13-42 19.5t-45 6.5q-62 0-107.5-41T401-690q-39 33-69 68.5t-50.5 72Q261-513 250.5-475T240-400Zm240 52-57 56q-11 11-17 25t-6 29q0 32 23.5 55t56.5 23q33 0 56.5-23t23.5-55q0-16-6-29.5T537-292l-57-56Zm0-492v132q0 34 23.5 57t57.5 23q18 0 33.5-7.5T622-658l18-22q74 42 117 117t43 163q0 134-93 227T480-80q-134 0-227-93t-93-227q0-129 86.5-245T480-840Z"/></svg>
          ${data.stats.consecutive_days_streak}
        </h5>
      </div>
      <div class="stat-widget">
        <p>Total Study Mins</p>
        <h5 class="total-study-mins-display">${data.stats.total_pomodoro_time}</h5>
      </div>
      <div class="stat-widget">
        <p>Completed Pomodoros</p>
        <h5 class="total-pomos-display">${data.stats.total_pomodoros_completed}</h5>
      </div>
      <div class="stat-widget">
        <p>Completed Tasks</p>
        <h5 class="completed-tasks-display">${data.stats.total_tasks_completed}</h5>
      </div>
    </div>
  `;
}

function renderLeaderboard(data) {
  let leaderboardHTML = '';

  data.forEach((entry) => {
    leaderboardHTML += `
      <div class="leaderboard-entry">
        <div class="rank-username-col">
          <p class="rank">${entry.rank}</p>
          <p class="user">${entry.username}</p>
        </div>
        <div class="minutes-col">
          <p class="mins">${entry.weekly_minutes}</p>
        </div>
      </div>
    `;
  });

  leaderboardEntries.innerHTML = leaderboardHTML ? leaderboardHTML : `<p>No leaderboard data</p>`;
}