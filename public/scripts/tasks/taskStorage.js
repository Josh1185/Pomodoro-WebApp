import { renderTasks } from "./taskRendering.js";
import { token } from "../dashboard/dashboardAuth.js";
import { showCompletedTasksBtn, showIncompletedTasksBtn } from "./taskElements.js";

export const apiBase = '/';
export let allTasks = [];
export let completedTasks = [];
export let incompletedTasks = [];

export async function fetchTasks() {
  try {
    const response = await fetch(apiBase + 'tasks', {
      headers: { 'Authorization': token }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch task data');
    }
    const tasksData = await response.json();
    allTasks = tasksData;

    // Filtering
    completedTasks = allTasks.filter(task => task.is_completed);
    incompletedTasks = allTasks.filter(task => !task.is_completed);

    if (showCompletedTasksBtn.classList.contains('active')) {
      renderTasks(completedTasks);
    }
    else if (showIncompletedTasksBtn.classList.contains('active')) {
      renderTasks(incompletedTasks);
    }
  }
  catch (err) {
    console.log('Failed to fetch task data', err)
  }
}