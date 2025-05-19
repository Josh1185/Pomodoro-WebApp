import { updateChart } from './statsGraph.js';
import { fetchLeaderboardData } from './statsFetch.js';

export const statsContainer = document.querySelector('.stats-container');
export const barGraphContainer = document.querySelector('.bar-graph-container');
export const personalStatsContainer = document.querySelector('.personal-stats-container');
export const usernameStatDisplay = document.querySelector('.username-stat-display');
export const leaderboardContainer = document.querySelector('.leaderboard-container');
export const leaderboardEntries = document.querySelector('.leaderboard-entries');

export const statsFilterBtn = document.querySelector('.stats-filter-btn');
export const leaderboardFilterBtn = document.querySelector('.leaderboard-filter-btn');

// Stat displays
export const streakDisplay = document.querySelector('.streak-display');
export const totalStudyMinsDisplay = document.querySelector('.total-study-mins-display');
export const totalPomosDisplay = document.querySelector('.total-pomos-display');
export const completedTasksDisplay = document.querySelector('.completed-tasks-display');

// Bar graph btns
const dailyRangeBtn = document.querySelector('.daily-range-btn');
const weeklyRangeBtn = document.querySelector('.weekly-range-btn');
const monthlyRangeBtn = document.querySelector('.monthly-range-btn');

// Bar graph btn event listeners
dailyRangeBtn.addEventListener('click', () => {
  const graphRange = 'daily';
  deactivatePrevRangeBtn(graphRange);
  updateChart(graphRange);
});

weeklyRangeBtn.addEventListener('click', () => {
  const graphRange = 'weekly';
  deactivatePrevRangeBtn(graphRange);
  updateChart(graphRange);
});

monthlyRangeBtn.addEventListener('click', () => {
  const graphRange = 'monthly';
  deactivatePrevRangeBtn(graphRange);
  updateChart(graphRange);
});

// Filter btns
statsFilterBtn.addEventListener('click', () => {
  personalStatsContainer.style.display = 'flex';
  barGraphContainer.style.display = 'flex';
  leaderboardContainer.style.display = 'none';
  statsFilterBtn.classList.add('active');
  leaderboardFilterBtn.classList.remove('active');
});

leaderboardFilterBtn.addEventListener('click', async () => {
  await fetchLeaderboardData();

  personalStatsContainer.style.display = 'none';
  barGraphContainer.style.display = 'none';
  leaderboardContainer.style.display = 'flex';
  statsFilterBtn.classList.remove('active');
  leaderboardFilterBtn.classList.add('active');
});

// function to deactivate prev range btns
function deactivatePrevRangeBtn(range) {
  switch (range) {
    case 'daily':
      dailyRangeBtn.classList.add('active');
      weeklyRangeBtn.classList.remove('active');
      monthlyRangeBtn.classList.remove('active');
      break;
    case 'weekly':
      dailyRangeBtn.classList.remove('active');
      weeklyRangeBtn.classList.add('active');
      monthlyRangeBtn.classList.remove('active');
      break;
    case 'monthly':
      dailyRangeBtn.classList.remove('active');
      weeklyRangeBtn.classList.remove('active');
      monthlyRangeBtn.classList.add('active');
      break;
  }
}