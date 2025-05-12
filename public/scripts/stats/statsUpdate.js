import { token } from "../dashboard/dashboardAuth.js";
import { apiBase } from "../tasks/taskStorage.js";
import { fetchStats } from "./statsFetch.js";

export async function updateStats(elapsedTime) {
  try {
    // make api request
    const response = await fetch(`${apiBase}stats/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        pomodoroTime: elapsedTime
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