import { addTask } from "./taskActions.js";

// Task List Elements
export const tasksContainer = document.querySelector('.task-list');

// Tasks filter buttons
export const showIncompletedTasksBtn = document.querySelector('.incompleted-tasks-filter-btn');
export const showCompletedTasksBtn = document.querySelector('.completed-tasks-filter-btn');

// Task list option buttons
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

addTaskForm.addEventListener('submit', e => {
  e.preventDefault();
});

addNewTaskBtn.addEventListener('click', () => {
  toggleAddTaskForm.style.display = 'block';
});

cancelAddTaskBtn.addEventListener('click', () => {
  toggleAddTaskForm.style.display = 'none';
});

submitAddTaskBtn.addEventListener('click', addTask);