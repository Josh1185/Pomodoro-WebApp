import { logoutUser } from "../authentication/user-logout.js";

// Logout functionality
const logoutBtn = document.querySelector('.logout-btn');
logoutBtn.addEventListener('click', () => {
  logoutUser();
});

// Tab functionality
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.tasks-tab').click();
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
  timerWrapper.style.display = "flex";
  tasksWrapper.style.display = "none";
  statsWrapper.style.display = "none";
  settingsWrapper.style.display = "none";
}

function renderTasksPage() {
  timerWrapper.style.display = "none";
  tasksWrapper.style.display = "flex";
  statsWrapper.style.display = "none";
  settingsWrapper.style.display = "none";
}

function renderStatsPage() {
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