import { addTask } from "./taskActions.js";
import { renderTasks } from "./taskRendering.js";
import { allTasks, fetchTasks, completedTasks, incompletedTasks } from "./taskStorage.js";

// Task List Elements
export const tasksContainer = document.querySelector('.task-list');

// Tasks filter buttons
export const showIncompletedTasksBtn = document.querySelector('.incompleted-tasks-filter-btn');
export const showCompletedTasksBtn = document.querySelector('.completed-tasks-filter-btn');

// Task list option buttons
export const taskListOptions = document.querySelector('.task-list-options');
export const addNewTaskBtn = document.querySelector('.add-new-task-btn');
export const clearAllTasksBtn = document.querySelector('.clear-all-tasks-btn');

// Add task form elements
export const toggleAddTaskForm = document.querySelector('.add-task-form-wrapper');
export const addTaskForm = document.querySelector('.add-task-form');
export const addTaskTitleInput = document.querySelector('.add-task-title-input');
export const addTaskDescInput = document.querySelector('.add-task-desc-input');
export const addTaskEstPomosInput = document.querySelector('.add-task-est-pomos-input');
export const submitAddTaskBtn = document.querySelector('.submit-add-task-btn');
export const cancelAddTaskBtn = document.querySelector('.cancel-add-task-btn');

// Edit task form elements
export const toggleEditTaskForm = document.querySelector('.edit-task-form-wrapper');
export const editTaskForm = document.querySelector('.edit-task-form');
export const editTaskTitleInput = document.querySelector('.edit-task-title-input');
export const editTaskDescInput = document.querySelector('.edit-task-desc-input');
export const editTaskEstPomosInput = document.querySelector('.edit-task-est-pomos-input');
export const submitEditTaskBtn = document.querySelector('.submit-edit-task-btn');
export const cancelEditTaskBtn = document.querySelector('.cancel-edit-task-btn');

// Error element for forms
export const errorDisplay = document.querySelector('.error-display');
export const addErrorDisplay = document.querySelector('.add-error-display');

document.addEventListener('DOMContentLoaded', () => {

  // Prevent default form behavior
  addTaskForm.addEventListener('submit', e => {
    e.preventDefault();
  });

  editTaskForm.addEventListener('submit', e => {
    e.preventDefault();
  });

  // Add task buttons
  addNewTaskBtn.addEventListener('click', () => {
    toggleAddTaskForm.style.display = 'block';
  });

  cancelAddTaskBtn.addEventListener('click', () => {
    toggleAddTaskForm.style.display = 'none';
    addTaskTitleInput.value = '';
    addTaskDescInput.value = '';
    addTaskEstPomosInput.value = '';
    addErrorDisplay.style.display = 'none';
  });

  submitAddTaskBtn.addEventListener('click', addTask);

  // Filtering logic
  showIncompletedTasksBtn.addEventListener('click', () => {
    showCompletedTasksBtn.classList.remove('active');
    showIncompletedTasksBtn.classList.add('active');
    taskListOptions.style.display = 'flex';

    // Filter incomplete tasks
    renderTasks(incompletedTasks);
  });

  showCompletedTasksBtn.addEventListener('click', () => {
    showCompletedTasksBtn.classList.add('active');
    showIncompletedTasksBtn.classList.remove('active');
    taskListOptions.style.display = 'none';

    // Filter incomplete tasks
    renderTasks(completedTasks);
  });
});


