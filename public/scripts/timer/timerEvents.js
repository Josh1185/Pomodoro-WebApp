import { timerState, getMinutes } from "./timerState.js";
import { startTimerBtn, pauseTimerBtn, skipTimerBtn, pomodoroStepBtn, longBreakStepBtn, shortBreakStepBtn } from "./timerElements.js";
import { elapsedTime, initializeTimer, startTimer, timerEnds, startTimerBtnEvent, pauseTimerBtnEvent } from "./timerLogic.js";
  
  pomodoroStepBtn.addEventListener('click', () => {
    timerState.currentStep = "pomodoro";
    initializeTimer(getMinutes('pomo'));
    pomodoroStepBtn.classList.add('active');
    deactivatePrevStepBtn(timerState.currentStep);
  });
  
  shortBreakStepBtn.addEventListener('click', () => {
    timerState.currentStep = 'sb';
    initializeTimer(getMinutes('sb'));
    shortBreakStepBtn.classList.add('active');
    deactivatePrevStepBtn(timerState.currentStep);
  });
  
  longBreakStepBtn.addEventListener('click', () => {
    timerState.currentStep = 'lb';
    initializeTimer(getMinutes('lb'));
    longBreakStepBtn.classList.add('active');
    deactivatePrevStepBtn(timerState.currentStep);
  });
  
  startTimerBtn.addEventListener('click', () => {
    startTimerBtnEvent();
  });
  
  pauseTimerBtn.addEventListener('click', () => {
    pauseTimerBtnEvent();
  });
  
  skipTimerBtn.addEventListener('click', () => {
    timerEnds(elapsedTime);
  });


export function deactivatePrevStepBtn(currStep) {
  switch (currStep) {
    case "pomodoro":
      shortBreakStepBtn.classList.remove('active');
      longBreakStepBtn.classList.remove('active');
      break;
    case "sb":
      pomodoroStepBtn.classList.remove('active');
      longBreakStepBtn.classList.remove('active');
      break;
    case "lb":
      pomodoroStepBtn.classList.remove('active');
      shortBreakStepBtn.classList.remove('active');
      break;
  }
}

