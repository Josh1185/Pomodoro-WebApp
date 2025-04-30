import { logoutUser } from "../authentication/user-logout.js";

// Logout functionality
const logoutBtn = document.querySelector('.logout-btn');
logoutBtn.addEventListener('click', () => {
  logoutUser();
});

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