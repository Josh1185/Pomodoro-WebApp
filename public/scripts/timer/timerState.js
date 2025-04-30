
export const timerState = {
  currentStep: "pomodoro",
  pomodoroStepIndex: 1,
  shortBreakStepIndex: 1,
  timerRunning: false,
  progressPercentage: 0,
  intervalId: null
};

const POMODORO_MINUTES = 25;
const SHORT_BREAK_MINUTES = 5;
const LONG_BREAK_MINUTES = 15;

export function getMinutes(type) {
  switch (type) {
    case "pomo":
      return POMODORO_MINUTES;
    case "sb":
      return SHORT_BREAK_MINUTES;
    case "lb":
      return LONG_BREAK_MINUTES;
  }
}

export function setMinutes(type, amt) {
  switch (type) {
    case "pomo":
      POMODORO_MINUTES = amt;
    case "sb":
      SHORT_BREAK_MINUTES = amt;
    case "lb":
      LONG_BREAK_MINUTES = amt;
  }
}