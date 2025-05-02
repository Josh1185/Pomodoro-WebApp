import { renderTasks } from "./taskRendering.js";
import { token } from "../dashboard/dashboardAuth.js";

export const apiBase = '/';
let tasks = [];

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
    tasks = tasksData;
    renderTasks(tasks);
  }
  catch (err) {
    console.log('Failed to fetch task data', err)
  }
}