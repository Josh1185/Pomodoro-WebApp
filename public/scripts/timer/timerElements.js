
let timerContainer, timerDisplay, progressBar, currentTimerStepMsg, startTimerBtn, pauseTimerBtn, skipTimerBtn, pomodoroStepBtn, shortBreakStepBtn, longBreakStepBtn;

  timerContainer = document.querySelector('.timer-container');
  timerDisplay = document.querySelector('.timer');
  progressBar = document.querySelector('.circle-bar');
  currentTimerStepMsg = document.querySelector('.current-timer-step-msg');
  startTimerBtn = document.querySelector('.start-timer-btn');
  pauseTimerBtn = document.querySelector('.pause-timer-btn');
  skipTimerBtn = document.querySelector('.skip-timer-btn');
  pomodoroStepBtn = document.querySelector('.pomo-btn');
  shortBreakStepBtn = document.querySelector('.short-break-btn');
  longBreakStepBtn = document.querySelector('.long-break-btn');

export {
  timerContainer,
  timerDisplay,
  progressBar,
  currentTimerStepMsg,
  startTimerBtn,
  pauseTimerBtn,
  skipTimerBtn,
  pomodoroStepBtn,
  shortBreakStepBtn,
  longBreakStepBtn
};