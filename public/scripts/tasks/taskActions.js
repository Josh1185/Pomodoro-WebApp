import { fetchTasks, apiBase } from "./taskStorage.js";
import { addTaskForm, addTaskTitleInput, addTaskDescInput, addTaskEstPomosInput, toggleAddTaskForm, editTaskDescInput, editTaskEstPomosInput, editTaskForm, editTaskTitleInput, toggleEditTaskForm, submitEditTaskBtn, cancelEditTaskBtn, errorDisplay, addErrorDisplay } from "./taskElements.js";
import { validateDescription, validateEstimatedPomodoros, validateTitle } from "./taskFormValidation.js";
import { token } from "../dashboard/dashboardAuth.js";

export async function addTask() {
  const title = addTaskTitleInput.value;
  const description = addTaskDescInput.value;
  const estimated_pomodoros = addTaskEstPomosInput.value;

  // VALIDATION GOES HERE
  if (
    validateTitle(title) ||
    validateDescription(description) ||
    validateEstimatedPomodoros(estimated_pomodoros)
  ) {
    addErrorDisplay.innerHTML = validateTitle(title) || validateDescription(description) || validateEstimatedPomodoros(estimated_pomodoros);
    addErrorDisplay.style.display = 'block';
    return;
  }

  addErrorDisplay.style.display = 'none';

  try {
    // make api post request
    const response = await fetch(apiBase + 'tasks', {
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

    // Check for an ok response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add task')
    }

    // clear prev form values
    addTaskTitleInput.value = '';
    addTaskDescInput.value = '';
    addTaskEstPomosInput.value = '';

    // close the task form
    toggleAddTaskForm.style.display = 'none';

    // call function to get and render tasks
    fetchTasks();
  }
  catch (err) {
    console.log('Error adding task', err);
    addErrorDisplay.innerHTML = 'Failed to add task';
    addErrorDisplay.style.display = 'block';
  }
}

export async function editTask(id, title_, desc_, estPomos_) {
  // Toggle form
  toggleEditTaskForm.style.display = 'block';

  // Set inputs with task values
  editTaskTitleInput.value = title_;
  editTaskDescInput.value = desc_;
  editTaskEstPomosInput.value = estPomos_;

  async function confirmEditTask() {

    // Get new task values
    const title = editTaskTitleInput.value;
    const description = editTaskDescInput.value;
    const estimated_pomodoros = editTaskEstPomosInput.value;

    // VALIDATION GOES HERE
    if (
      validateTitle(title) ||
      validateDescription(description) ||
      validateEstimatedPomodoros(estimated_pomodoros)
    ) {
      errorDisplay.innerHTML = validateTitle(title) || validateDescription(description) || validateEstimatedPomodoros(estimated_pomodoros);
      errorDisplay.style.display = 'block';
      return;
    }
  
    errorDisplay.style.display = 'none';

    try {
      // Make api put request
      const response = await fetch(`${apiBase}tasks/edit/${id}`, {
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

      // Check for an ok response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to edit task')
      }

      // Clear prev form values
      editTaskTitleInput.value = '';
      editTaskDescInput.value = '';
      editTaskEstPomosInput.value = '';

      // close the task form
      toggleEditTaskForm.style.display = 'none';

      // Call function to get and render tasks
      fetchTasks();
    }
    catch (err) {
      console.log('Error editing task: ', err);
      errorDisplay.innerHTML = 'Failed to update task';
      errorDisplay.style.display = 'block';
    }
  }

  // Delete any prior onclicks
  submitEditTaskBtn.onclick = null;
  cancelEditTaskBtn.onclick = null;

  submitEditTaskBtn.onclick = confirmEditTask;
  cancelEditTaskBtn.onclick = () => {
    toggleEditTaskForm.style.display = 'none';
    editTaskTitleInput.value = '';
    editTaskDescInput.value = '';
    editTaskEstPomosInput.value = '';
  }
}

export async function deleteTask(id) {
  try {
    // Make api delete request
    const response = await fetch(`${apiBase}tasks/delete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    });

    // Check for an ok response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete task');
    }

    // Fetch tasks
    fetchTasks();
  }
  catch (err) {
    console.log('Error deleting task: ', err);
  }
}

export async function markTaskComplete(id) {
  try {
    // Make api put request
    const response = await fetch(`${apiBase}tasks/complete/${id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        is_completed: true,
        is_current: false
      })
    });

    // Check for an ok response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to mark task complete');
    }

    // Fetch tasks
    fetchTasks();
  }
  catch (err) {
    console.log('Error marking task complete: ', err);
  }
}

export async function pinTaskAsCurrent(id) {
  try {
    // Make api put request
    const response = await fetch(`${apiBase}tasks/current/pin/${id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        is_current: true
      })
    });

    // Check for an ok response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to pin task');
    }

    // Fetch tasks
    fetchTasks();
  }
  catch (err) {
    console.log('Error pinning task: ', err);
  }
}

export async function unpinCurrentTask(id) {
  try {
    // Make api put request
    const response = await fetch(`${apiBase}tasks/current/unpin/${id}`, {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        is_current: false
      })
    });

    // Check for an ok response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to unpin task');
    }

    // Fetch tasks
    fetchTasks();
  }
  catch (err) {
    console.log('Error unpinning task: ', err);
  }
}