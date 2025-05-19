import { logoutUser } from "../authentication/user-logout.js";
import { fetchStats } from "../stats/statsFetch.js";
import { apiBase, fetchTasks } from "../tasks/taskStorage.js";
import { initializeTimer } from "../timer/timerLogic.js";
import { showCurrentTaskOnTimerPage } from "../timer/timerState.js";
import { updateChart } from "../stats/statsGraph.js";
import { accountModalWrapper, accountModalEmail, accountModalUsername, dismissAccountModalBtn } from "./dashboardModals.js";
import { token } from "./dashboardAuth.js";

// Logout functionality
const logoutBtn = document.querySelector('.logout-btn');
logoutBtn.addEventListener('click', () => {
  accountModalWrapper.style.display = 'none';
  logoutUser();
});

// Account btn functionality
const accountBtn = document.querySelector('.account-btn');
accountBtn.addEventListener('click', () => {
  openAccountModal();
});

dismissAccountModalBtn.addEventListener('click', () => {
  accountModalWrapper.style.display = 'none';
});

async function openAccountModal() {
  const data = await fetchUsernameAndEmail();
  accountModalWrapper.style.display = 'block';
  accountModalUsername.textContent = data.username;
  accountModalEmail.textContent = data.email;
}

async function fetchUsernameAndEmail() {
  try {
    // make an api request
    const response = await fetch(`${apiBase}stats/credentials`, {
      headers: { 'Authorization': token }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch username and email');
    }

    const data = response.json();
    return data;
  }
  catch (err) {
    console.log('Failed to fetch username and email', err);
  }
}

// Tab functionality
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.timer-tab').click();
});

const timerTab = document.querySelector('.tab-btn.timer-tab');
const tasksTab = document.querySelector('.tab-btn.tasks-tab');
const statsTab = document.querySelector('.tab-btn.stats-tab');
const settingsTab = document.querySelector('.tab-btn.settings-tab');
const timerWrapper = document.querySelector('.timer-wrapper');
const tasksWrapper = document.querySelector('.tasks-wrapper');
const statsWrapper = document.querySelector('.stats-wrapper');
const settingsWrapper = document.querySelector('.settings-wrapper');

timerTab.addEventListener('click', () => {
  changeTab('timer');
});
tasksTab.addEventListener('click', () => {
  changeTab('tasks');
});
statsTab.addEventListener('click', () => {
  changeTab('stats');
});
settingsTab.addEventListener('click', () => {
  changeTab('settings');
});

function changeTab(tab) {
  
  if (tab === 'timer') {
    timerTab.classList.add('active');
    tasksTab.classList.remove('active');
    statsTab.classList.remove('active');
    settingsTab.classList.remove('active');
    renderTimerPage();
  }
  else if (tab === 'tasks') {
    tasksTab.classList.add('active');
    timerTab.classList.remove('active');
    statsTab.classList.remove('active');
    settingsTab.classList.remove('active');
    renderTasksPage();
  }
  else if (tab === 'stats') {
    statsTab.classList.add('active');
    tasksTab.classList.remove('active');
    timerTab.classList.remove('active');
    settingsTab.classList.remove('active');
    renderStatsPage();
  }
  else if (tab === 'settings') {
    settingsTab.classList.add('active');
    tasksTab.classList.remove('active');
    statsTab.classList.remove('active');
    timerTab.classList.remove('active');
    renderSettingsPage();
  }
}

function renderTimerPage() {
  showCurrentTaskOnTimerPage();
  timerWrapper.style.display = "flex";
  tasksWrapper.style.display = "none";
  statsWrapper.style.display = "none";
  settingsWrapper.style.display = "none";
}

async function renderTasksPage() {
  await fetchTasks();
  timerWrapper.style.display = "none";
  tasksWrapper.style.display = "flex";
  statsWrapper.style.display = "none";
  settingsWrapper.style.display = "none";
}

async function renderStatsPage() {
  await fetchStats();
  await updateChart('daily');
  timerWrapper.style.display = "none";
  tasksWrapper.style.display = "none";
  statsWrapper.style.display = "flex";
  settingsWrapper.style.display = "none";
}

function renderSettingsPage() {
  timerWrapper.style.display = "none";
  tasksWrapper.style.display = "none";
  statsWrapper.style.display = "none";
  settingsWrapper.style.display = "flex";
}

// Header responsive logic
const dropdownBtn = document.querySelector('.dropdown-btn');
const navDropdown = document.querySelector('.header-middle');
const logoutBtnDropdown = document.querySelector('.header-right');
const topHeader = document.querySelector('.header-left');

function menuSlideDown() {
  navDropdown.style.animation = 'menuSlideDown 1s ease-in-out forwards';
  logoutBtnDropdown.style.animation = 'menuSlideDown 1s ease-in-out forwards';
}

function menuSlideUp() {
  navDropdown.style.animation = 'menuSlideUp 1s ease-in-out forwards';
  logoutBtnDropdown.style.animation = 'menuSlideUp 1s ease-in-out forwards';
}

function toggleDropdown() {
  if ( // Slide up
    navDropdown.style.display === 'flex' &&
    logoutBtnDropdown.style.display === 'flex'
  ) {

    menuSlideUp();
    setTimeout(() => {
      navDropdown.style.display = 'none';
      logoutBtnDropdown.style.display = 'none';
    }, 1000);
  } else { // Slide down
    
    navDropdown.style.display = 'flex';
    logoutBtnDropdown.style.display = 'flex';
    menuSlideDown();
  }
  
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    navDropdown.style.display = 'flex';
    logoutBtnDropdown.style.display = 'flex';
    navDropdown.style.animation = 'none';
    logoutBtnDropdown.style.animation = 'none';
  } else {
    navDropdown.style.display = 'none';
    logoutBtnDropdown.style.display = 'none';
  }
});

dropdownBtn.addEventListener('click', () => {
  toggleDropdown();
});