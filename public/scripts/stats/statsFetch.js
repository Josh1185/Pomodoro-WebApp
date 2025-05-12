import { token } from "../dashboard/dashboardAuth.js";
import { apiBase } from "../tasks/taskStorage.js";

export async function fetchStats() {
  try {
    // Make api request
    const response = await fetch(`${apiBase}stats`, {
      headers: { 'Authorization': token }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch stats data');
    }
    const statsData = await response.json();
    displayStats(statsData);
  }
  catch (err) {
    console.log('Failed to fetch stats data', err);
  }
}

function displayStats(stats) {
  console.log(stats);
}