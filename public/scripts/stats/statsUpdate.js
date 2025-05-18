import { token } from "../dashboard/dashboardAuth.js";
import { apiBase, getCurrentTask } from "../tasks/taskStorage.js";
import { fetchStats } from "./statsFetch.js";

export async function updateStats(elapsedTime) {
  try {

    const elapsedMins = Math.floor(elapsedTime / 60);

    // make api request
    const response = await fetch(`${apiBase}stats/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        pomodoroTime: elapsedMins
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update stats data');
    }

    fetchStats();
  }
  catch (err) {
    console.log('Failed to update stats data', err);
  }
}

export async function logPomodoroSession(elapsedTime) {

  const currentTask = getCurrentTask();
  const elapsedMins = Math.floor(elapsedTime / 60);

  try {
    // make api request
    const response = await fetch(`${apiBase}stats/log-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        duration_minutes: elapsedMins,
        task_id: currentTask?.id || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to log pomodoro session');
    }
  }
  catch (err) {
    console.log('Failed to log pomodoro session', err);
  }
}