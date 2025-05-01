import { tasksContainer } from "./taskElements.js";

export function renderTasks(tasks) {
  let taskListHTML = '';
  tasks.forEach((task, taskIndex) => {
    taskIndex = task.id;
    taskListHTML += `
      <div class="task" data-id="${taskIndex}">
        <div class="task-top-section">
          <div class="task-progress-bar">
            <span class="task-progress">${task.completed_pomodoros}/${task.estimated_pomodoros}</span>
          </div>
          <div class="task-info">
            <h4 class="task-title">${task.title}</h4>
            <p class="task-desc">${task.description}</p>
          </div>
        </div>
        <div class="task-bottom-section">
          <button class="edit-task-btn" data-id="${taskIndex}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
            Edit
          </button>
          <button class="delete-task-btn" data-id="${taskIndex}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
            Delete
          </button>
          <button class="mark-task-complete-btn" data-id="${taskIndex}">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="m438-240 226-226-58-58-169 169-84-84-57 57 142 142ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>
            Complete
          </button>
        </div>
      </div>
    `;
  });
  tasksContainer.innerHTML = taskListHTML;
}