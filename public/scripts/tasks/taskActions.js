import { fetchTasks, apiBase } from "./taskStorage.js";
import { addTaskForm, addTaskTitleInput, addTaskDescInput, addTaskEstPomosInput, toggleAddTaskForm } from "./taskElements.js";
import { token } from "../dashboard/dashboardAuth.js";

export async function addTask() {
  const title = addTaskTitleInput.value;
  const description = addTaskDescInput.value;
  const estimated_pomodoros = addTaskEstPomosInput.value;

  // VALIDATION GOES HERE

  // make api post request
  await fetch(apiBase + 'tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify({
      title,
      description,
      estimated_pomodoros
    })
  });

  // clear prev form values
  addTaskTitleInput.value = '';
  addTaskDescInput.value = '';
  addTaskEstPomosInput.value = '';

  // close the task form
  toggleAddTaskForm.style.display = 'none';

  // call function to get and render tasks
  fetchTasks();
}