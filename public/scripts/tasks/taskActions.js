import { fetchTasks, apiBase } from "./taskStorage.js";
import { addTaskForm, addTaskTitleInput, addTaskDescInput, addTaskEstPomosInput, toggleAddTaskForm, editTaskDescInput, editTaskEstPomosInput, editTaskForm, editTaskTitleInput, toggleEditTaskForm, submitEditTaskBtn, cancelEditTaskBtn } from "./taskElements.js";
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

export async function editTask(index, title_, desc_, estPomos_) {
  // Toggle form
  toggleEditTaskForm.style.display = 'block';

  // Set inputs with task values
  editTaskTitleInput.value = title_;
  editTaskDescInput.value = desc_;
  editTaskEstPomosInput.value = estPomos_;

  async function confirmEditTask() {

    // VALIDATION GOES HERE

    // Get new task values
    const title = editTaskTitleInput.value;
    const description = editTaskDescInput.value;
    const estimated_pomodoros = editTaskEstPomosInput.value;

    // Make api put request
    await fetch(`${apiBase}tasks/edit/${index}`, {
      method: 'PUT',
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

    // Clear prev form values
    editTaskTitleInput.value = '';
    editTaskDescInput.value = '';
    editTaskEstPomosInput.value = '';

    // close the task form
    toggleEditTaskForm.style.display = 'none';

    // Call function to get and render tasks
    fetchTasks();
  }

  submitEditTaskBtn.onclick = confirmEditTask;
  cancelEditTaskBtn.onclick = () => {
    toggleEditTaskForm.style.display = 'none';
    editTaskTitleInput.value = '';
    editTaskDescInput.value = '';
    editTaskEstPomosInput.value = '';
  }
}

export async function deleteTask() {

}

export async function markTaskComplete() {

}

export async function markTaskCurrent() {

}