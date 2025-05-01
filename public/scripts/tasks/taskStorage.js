import { renderTasks } from "./taskRendering.js";
import { token } from "../dashboard/dashboardAuth.js";

export const apiBase = '/';
let tasks = [];

export async function fetchTasks() {
  const response = await fetch(apiBase + 'tasks', {
    headers: { 'Authorization': token }
  });
  const tasksData = await response.json();
  tasks = tasksData;
  renderTasks(tasks);
}