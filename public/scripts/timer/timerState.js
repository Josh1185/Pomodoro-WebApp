import { getCurrentTask, fetchTasks } from "../tasks/taskStorage.js";
import { currentTaskCircleContainer } from "./timerElements.js";

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

export async function showCurrentTaskOnTimerPage() {
  await fetchTasks();
  // Display current task progress if there is one
  const currentTask = getCurrentTask();
  if (currentTask) {
    currentTaskCircleContainer.innerHTML = `
      <div class="task-progress-bar" style="
        background: conic-gradient(
          var(--accent-color) ${(currentTask.completed_pomodoros / currentTask.estimated_pomodoros) * 360}deg,
          var(--background-color-2) 0deg
        );
      ">
        <span class="task-progress">${currentTask.completed_pomodoros}/${currentTask.estimated_pomodoros}</span>
      </div>
    `;
  }
  else {
    currentTaskCircleContainer.innerHTML = '';
  }
}