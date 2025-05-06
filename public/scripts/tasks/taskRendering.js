import { editTask, deleteTask, markTaskComplete, pinTaskAsCurrent, unpinCurrentTask } from "./taskActions.js";
import { tasksContainer } from "./taskElements.js";

export function renderTasks(tasks) {

  // Ensure that the current task is always at the top
  tasks.sort((a, b) => {
    // Incomplete before complete
    if (!a.is_completed && b.is_completed) return -1;
    if (a.is_completed && !b.is_completed) return 1;

    // Sort completed tasks by date: oldest at the bottom
    if (a.is_completed && b.is_completed) {
      const completedA = new Date(a.completed_at);
      const completedB = new Date(b.completed_at);
      return completedA - completedB; // Sorts in ascending order
    }

    // Current comes first 
    if (a.is_current && !b.is_current) return -1;
    if (!a.is_current && b.is_current) return 1;

    return 0;
  });

  let taskListHTML = '';
  let showingIncompleteTasks = false;
  tasks.forEach((task, taskIndex) => {
    const taskId = task.id;

    if (!task.is_completed) {
      showingIncompleteTasks = true;
      const isCurrentClass = task.is_current ? 'current' : '';

      taskListHTML += `
        <div class="task ${isCurrentClass}" data-id="${taskId}">
          <div class="task-top-section" data-id="${taskId}">
            <div class="task-progress-bar" style="
              background: conic-gradient(
                var(--accent-color) ${(task.completed_pomodoros / task.estimated_pomodoros) * 360}deg,
                var(--background-color-2) 0deg
              );
            ">
              <span class="task-progress">${task.completed_pomodoros}/${task.estimated_pomodoros}</span>
            </div>
            <div class="task-info">
              <h4 class="task-title">${task.title}</h4>
              <p class="task-desc">${task.description}</p>
            </div>
          </div>
          <div class="task-bottom-section">
            <button class="edit-task-btn" data-id="${taskId}">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
              Edit
            </button>
            <button class="delete-task-btn" data-id="${taskId}">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
              Delete
            </button>
            <button class="mark-task-complete-btn" data-id="${taskId}">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"><path d="m438-240 226-226-58-58-169 169-84-84-57 57 142 142ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>
              Complete
            </button>
            
            <input class="task-title-${taskId}" value="${task.title}" style="display: none;">
            <input class="task-desc-${taskId}" value="${task.description}" style="display: none;">
            <input class="task-pomos-${taskId}" value="${task.estimated_pomodoros}" style="display: none;">
            <input class="task-is-current-${taskId}" value="${task.is_current}" style="display: none;">
          </div>
        </div>
      `;
    } else {
      showingIncompleteTasks = false;

      const createdAt = task.created_at ? new Date(task.created_at) : null;
      const completedAt = task.completed_at ? new Date(task.completed_at) : null;

      function formatDate(date) {
        return date.toLocaleDateString("en-US", {
          year: "2-digit",
          month: "2-digit",
          day: "2-digit"
        });
      }

      const formattedCreatedAt = createdAt ? formatDate(createdAt) : "N/A";
      const formattedCompletedAt = completedAt ? formatDate(completedAt) : "N/A";
      
      taskListHTML += `
        <div class="completed-task" data-id="${taskId}">
          <div class="completed-task-top-section">
            <div class="completed-task-circle" style="
              background: conic-gradient(
                var(--accent-color) 360deg,
                var(--background-color-2) 0deg
              );
            ">
              <span class="completed-task-pomos">${task.completed_pomodoros}</span>
            </div>
            <div class="completed-task-info">
              <h4 class="completed-task-title">${task.title}</h4>
              <p class="completed-task-desc">${task.description}</p>
            </div>
          </div>
          <div class="completed-task-bottom-section">
            <p class="completion-date">Completed: <span>${formattedCompletedAt}</span></p>
            <p class="creation-date">Created: <span>${formattedCreatedAt}</span></p>
          </div>
        </div>
      `;
    }
    
  });
  tasksContainer.innerHTML = taskListHTML;

  if (showingIncompleteTasks) {
    // edit task buttons
    document.querySelectorAll('.edit-task-btn').forEach((editTaskBtn) => {
      const taskId = editTaskBtn.dataset.id;

      editTaskBtn.addEventListener('click', () => {
        const title = document.querySelector(`.task-title-${taskId}`).value;
        const desc = document.querySelector(`.task-desc-${taskId}`).value;
        const estPomos = document.querySelector(`.task-pomos-${taskId}`).value;
        editTask(taskId, title, desc, estPomos);
      });
    });

    // delete task buttons
    document.querySelectorAll('.delete-task-btn').forEach((deleteTaskBtn) => {
      const taskId = deleteTaskBtn.dataset.id;

      deleteTaskBtn.addEventListener('click', () => {
        const title = document.querySelector(`.task-title-${taskId}`).value;
        deleteTask(taskId, title);
      });
    });

    // complete task buttons
    document.querySelectorAll('.mark-task-complete-btn').forEach((markCompleteBtn) => {
      const taskId = markCompleteBtn.dataset.id;

      markCompleteBtn.addEventListener('click', () => {
        const title = document.querySelector(`.task-title-${taskId}`).value;
        markTaskComplete(taskId, title);
      });
    });

    // pin task as current
    document.querySelectorAll('.task-top-section').forEach((section) => {
      const taskId = section.dataset.id;

      section.addEventListener('click', () => {
        const isCurrent = document.querySelector(`.task-is-current-${taskId}`).value;
        const title = document.querySelector(`.task-title-${taskId}`).value;
        if (isCurrent === 'true') {
          unpinCurrentTask(taskId, title);
        }
        else {
          pinTaskAsCurrent(taskId, title);
        }
      });
    });
  }
}