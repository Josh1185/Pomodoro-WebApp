import { fetchTasks, apiBase } from "./taskStorage.js";
import { addTaskForm, addTaskTitleInput, addTaskDescInput, addTaskEstPomosInput, toggleAddTaskForm, editTaskDescInput, editTaskEstPomosInput, editTaskForm, editTaskTitleInput, toggleEditTaskForm, submitEditTaskBtn, cancelEditTaskBtn, errorDisplay, addErrorDisplay } from "./taskElements.js";
import { validateDescription, validateEstimatedPomodoros, validateTitle } from "./taskFormValidation.js";
import { token } from "../dashboard/dashboardAuth.js";
import { deleteTaskModalTitle, deleteTaskModalWrapper, confirmDeleteTaskBtn, cancelDeleteTaskBtn, closeModal, openModal, completeTaskModalTitle, completeTaskModalWrapper, confirmCompleteTaskBtn, cancelCompleteTaskBtn, pincurrentTaskModalTitle, pincurrentTaskModalWrapper, confirmPincurrentTaskBtn, cancelPincurrentTaskBtn, unpincurrentTaskModalTitle, unpincurrentTaskModalWrapper, confirmUnpincurrentTaskBtn, cancelUnpincurrentTaskBtn } from "../dashboard/dashboardModals.js";

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

export async function deleteTask(id, title) {

  openModal(deleteTaskModalWrapper);
  deleteTaskModalTitle.textContent = `Are you sure you want to delete ${title}?`;
  confirmDeleteTaskBtn.addEventListener('click', confirmDeleteTask);
  cancelDeleteTaskBtn.addEventListener('click', closeFunction);

  function closeFunction() {
    closeModal(deleteTaskModalWrapper, confirmDeleteTaskBtn, cancelDeleteTaskBtn, confirmDeleteTask, closeFunction);
  }

  async function confirmDeleteTask() {
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
    finally {
      closeFunction();
    }
  } 
}

export async function markTaskComplete(id, title) {

  openModal(completeTaskModalWrapper);
  completeTaskModalTitle.textContent = `Are you sure you would like to mark ${title} as complete?`;
  confirmCompleteTaskBtn.addEventListener('click', confirmCompleteTask);
  cancelCompleteTaskBtn.addEventListener('click', closeFunction);

  function closeFunction() {
    closeModal(completeTaskModalWrapper, confirmCompleteTaskBtn, cancelCompleteTaskBtn, confirmCompleteTask, closeFunction);
  }

  async function confirmCompleteTask() {
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
    finally {
      closeFunction();
    }
  }
}

export async function pinTaskAsCurrent(id, title) {

  openModal(pincurrentTaskModalWrapper);
  pincurrentTaskModalTitle.textContent = `Are you sure you would like to pin ${title} as your current task?`;
  confirmPincurrentTaskBtn.addEventListener('click', confirmPinCurrent);
  cancelPincurrentTaskBtn.addEventListener('click', closeFunction);

  function closeFunction() {
    closeModal(pincurrentTaskModalWrapper, confirmPincurrentTaskBtn, cancelPincurrentTaskBtn, confirmPinCurrent, closeFunction);
  }

  async function confirmPinCurrent() {
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
    finally {
      closeFunction();
    }
  }
}

export async function unpinCurrentTask(id, title) {

  openModal(unpincurrentTaskModalWrapper);
  unpincurrentTaskModalTitle.textContent = `Are you sure you would like to unpin ${title} from your current task slot?`;
  confirmUnpincurrentTaskBtn.addEventListener('click', confirmUnpinCurrent);
  cancelUnpincurrentTaskBtn.addEventListener('click', closeFunction);

  function closeFunction() {
    closeModal(unpincurrentTaskModalWrapper, confirmUnpincurrentTaskBtn, cancelUnpincurrentTaskBtn, confirmUnpinCurrent, closeFunction);
  }

  async function confirmUnpinCurrent() {
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
    finally {
      closeFunction();
    }
  }
}