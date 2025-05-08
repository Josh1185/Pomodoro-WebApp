import { getCurrentTask, fetchTasks } from "../tasks/taskStorage.js";
import { currentTaskCircleContainer } from "./timerElements.js";
import { initSettings, settingsCache } from "../settings/settingsFetch.js";

export const timerState = {
  currentStep: "pomodoro",
  pomodoroStepIndex: 1,
  shortBreakStepIndex: 1,
  timerRunning: false,
  progressPercentage: 0,
  intervalId: null
};

export function getMinutes(type) {
  if (!settingsCache) {
    switch (type) {
      case "pomo":
        return 25;
      case "sb":
        return 5;
      case "lb":
        return 15;
    }
  }
  else {
    switch (type) {
      case "pomo":
        return settingsCache.pomodoro_duration;
      case "sb":
        return settingsCache.short_break_duration;
      case "lb":
        return settingsCache.long_break_duration;
    }
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