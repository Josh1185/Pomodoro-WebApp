import { timerState, getMinutes, showCurrentTaskOnTimerPage } from "./timerState.js";
import { timerDisplay, startTimerBtn, pauseTimerBtn, skipTimerBtn, pomodoroStepBtn, shortBreakStepBtn, longBreakStepBtn, currentTimerStepMsg, progressBar, timerContainer, currentTaskCircleContainer } from "./timerElements.js";
import { deactivatePrevStepBtn } from "./timerEvents.js";
import { updatePomodoroProgress } from "./timerTaskProgress.js";
import { openTimerModal } from "../dashboard/dashboardModals.js";
import { getCurrentTask } from "../tasks/taskStorage.js";
import { logPomodoroSession, updateStats } from "../stats/statsUpdate.js";

let endTime;
let remainingTime = 0;
export let startingMins = getMinutes('pomo');
// let time = (startingMins * 60) - 1;
// let progressDegrees = 0;
const timerEndSound = new Audio('../../sounds/timerAlarm.mp3');
export let elapsedTime = 0;
timerEndSound.load();

export function initializeTimer(mins) {

  timerState.timerRunning = false;
  elapsedTime = 0;
  clearInterval(timerState.intervalId);
  startingMins = mins;

  remainingTime = 0;
  
  // time = (startingMins * 60) - 1;
  endTime = Date.now() + (startingMins * 60 * 1000);

  timerState.progressPercentage = 0;
  updateTimerDisplay();
  document.title = `${displayTimerStepInHeader()} (${startingMins}:00)`;
  progressBar.style.background = `
    conic-gradient(
      var(--accent-color) 360deg,
      var(--background-color-2) 0deg
    )
  `;
  startTimerBtn.style.display = 'flex';
  pauseTimerBtn.style.display = 'none';
  displayTimerStep();

  showCurrentTaskOnTimerPage();
}

function updateTimerDisplay() {
  if (startingMins < 10) {
    timerDisplay.textContent = `0${startingMins}:00`;
  } else {
    timerDisplay.textContent = `${startingMins}:00`;
  }
}

export function displayTimerStep() {
  switch (timerState.currentStep) {
    case "pomodoro":
      currentTimerStepMsg.textContent = `Time to focus #${timerState.pomodoroStepIndex}`;
      break;
    case "sb":
      currentTimerStepMsg.textContent = `Time for short break #${timerState.shortBreakStepIndex}`;
      break;
    case "lb":
      currentTimerStepMsg.textContent = `Time for a long break`;
      break;
  }
}

function displayTimerStepInHeader() {
  switch (timerState.currentStep) {
    case "pomodoro":
      return `Focus #${timerState.pomodoroStepIndex}`;
    case "sb":
      return `Short break #${timerState.shortBreakStepIndex}`;
    case "lb":
      return `Long break`;
  }
}

export function startTimer() {

  const now = Date.now();
  const timeLeft = Math.max(0, Math.floor((endTime - now) / 1000));

  let mins = Math.floor(timeLeft / 60);
  let secs = timeLeft % 60;

  // Adding preceding zero before value if it's less than 10
  secs = secs < 10 ? `0${secs}` : secs;
  mins = mins < 10 ? `0${mins}` : mins;
  // Add mins and secs to display
  timerDisplay.textContent = `${mins}:${secs}`;
  document.title = `${displayTimerStepInHeader()} (${mins}:${secs})`;

  // Progress bar logic
  const totalDuration = startingMins * 60;
  timerState.progressPercentage = ((totalDuration - timeLeft) / totalDuration) * 100;
  // Convert percentage to degrees (Pie chart)
  const progressDegrees = (timerState.progressPercentage / 100) * 360;
  // Update progress bar
  progressBar.style.background = `
    conic-gradient(
      var(--accent-color) ${360 - progressDegrees}deg,
      var(--background-color-2) 0deg
    )
  `;

  // update elapsed time
  elapsedTime++;

  if (timeLeft <= 0) {
    timerEnds();
  }
}

export async function timerEnds() {
  timerState.timerRunning = false;

  timerEndSound.play().catch(err => {
    alert("Failed to play timer chime:", err);
  });

  switch (timerState.currentStep) {
    // was a pomodoro timer
    case "pomodoro":
      // First 3 pomodoros are followed by short breaks
      if (timerState.pomodoroStepIndex <= 3) {
        // UPDATE POMODORO PROGRESS ON TASK (IF THERES A CURRENT TASK)
        if (getCurrentTask()) await updatePomodoroProgress();
        // Update stats
        updateStats(elapsedTime);
        // Log pomodoro session
        logPomodoroSession(elapsedTime);

        // Display modal
        openTimerModal(`Pomodoro #${timerState.pomodoroStepIndex} completed.`);

        // Increment pomoIndex and change step to short break
        timerState.pomodoroStepIndex++;
        timerState.currentStep = 'sb';
        shortBreakStepBtn.classList.add('active');

        // Initialize timer
        deactivatePrevStepBtn(timerState.currentStep);
        initializeTimer(getMinutes('sb'));
      }
      // After 3 pomodoros, switch to a long break
      else {
        // UPDATE POMODORO PROGRESS ON TASK (IF THERES A CURRENT TASK)
        if (getCurrentTask) await updatePomodoroProgress();
        // Update stats
        updateStats(elapsedTime);
        // Log pomodoro session
        logPomodoroSession(elapsedTime);

        // Display modal
        openTimerModal(`Pomodoro #${timerState.pomodoroStepIndex} completed.`);
        
        // Change step to long break and reset indexes for pomodoros and short breaks
        timerState.currentStep = 'lb';
        longBreakStepBtn.classList.add('active');
        timerState.pomodoroStepIndex = 1;
        timerState.shortBreakStepIndex = 1;

        // Initialize timer
        deactivatePrevStepBtn(timerState.currentStep);
        initializeTimer(getMinutes('lb'));
      }
      break;
    // was a short break timer
    case "sb":

      // Display modal
      openTimerModal(`Short break #${timerState.shortBreakStepIndex} completed.`);

      // Increment shortBreak Index and change timer back to a pomodoro
      timerState.shortBreakStepIndex++;
      timerState.currentStep = 'pomodoro';
      pomodoroStepBtn.classList.add('active');
      deactivatePrevStepBtn(timerState.currentStep);
      initializeTimer(getMinutes('pomo'));
      break;
    // was a long break timer
    case "lb":

      // Display modal
      openTimerModal(`Long break completed.`);

      // Change back to a pomodoro
      timerState.currentStep = 'pomodoro';
      pomodoroStepBtn.classList.add('active');
      deactivatePrevStepBtn(timerState.currentStep);
      initializeTimer(getMinutes('pomo'));
      break;
  }
}

export function startTimerBtnEvent() {
  const now = Date.now();

  // If resuming from pause, use remainingTime
  if (remainingTime > 0) {
    endTime = now + remainingTime;
    remainingTime = 0;
  } else {
    endTime = now + (startingMins * 60 * 1000) + 1000;
  }
  
  timerState.intervalId = setInterval(startTimer, 1000);
  timerState.timerRunning = true;

  startTimerBtn.style.display = 'none';
  pauseTimerBtn.style.display = 'flex';
}

export function pauseTimerBtnEvent() {
  clearInterval(timerState.intervalId);
  timerState.timerRunning = false;

  // Save how much time is left
  remainingTime = endTime - Date.now();

  startTimerBtn.style.display = 'flex';
  pauseTimerBtn.style.display = 'none';
}