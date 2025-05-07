import { getCurrentTask, apiBase, fetchTasks } from "../tasks/taskStorage.js";
import { token } from "../dashboard/dashboardAuth.js";

export async function updatePomodoroProgress() {
  const currentTask = getCurrentTask();
  const { id, completed_pomodoros } = currentTask;

  try {
    // Make api request
    const response = await fetch(`${apiBase}tasks/pomos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        completed_pomodoros: completed_pomodoros + 1
      })
    });

    // Check for an ok response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to edit task')
    }

    // Call function to get and render tasks
    fetchTasks();
  }
  catch (err) {
    console.log('Error updating completed_pomodoros: ', err);
  }
}