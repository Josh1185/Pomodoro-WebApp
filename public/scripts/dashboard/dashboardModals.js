// Delete task modal
export const deleteTaskModalWrapper = document.querySelector('.delete-task-modal-wrapper');
export const deleteTaskModalTitle = document.querySelector('.delete-task-modal-title');
export const confirmDeleteTaskBtn = document.querySelector('.confirm-delete-task-btn');
export const cancelDeleteTaskBtn = document.querySelector('.cancel-delete-task-btn');

// Complete task modal
export const completeTaskModalWrapper = document.querySelector('.complete-task-modal-wrapper');
export const completeTaskModalTitle = document.querySelector('.complete-task-modal-title');
export const confirmCompleteTaskBtn = document.querySelector('.confirm-complete-task-btn');
export const cancelCompleteTaskBtn = document.querySelector('.cancel-complete-task-btn');

// Pin task current modal
export const pincurrentTaskModalWrapper = document.querySelector('.pincurrent-task-modal-wrapper');
export const pincurrentTaskModalTitle = document.querySelector('.pincurrent-task-modal-title');
export const confirmPincurrentTaskBtn = document.querySelector('.confirm-pincurrent-task-btn');
export const cancelPincurrentTaskBtn = document.querySelector('.cancel-pincurrent-task-btn');

// Unpin current task modal
export const unpincurrentTaskModalWrapper = document.querySelector('.unpincurrent-task-modal-wrapper');
export const unpincurrentTaskModalTitle = document.querySelector('.unpincurrent-task-modal-title');
export const confirmUnpincurrentTaskBtn = document.querySelector('.confirm-unpincurrent-task-btn');
export const cancelUnpincurrentTaskBtn = document.querySelector('.cancel-unpincurrent-task-btn');

// Clear tasks modal
export const clearTasksModalWrapper = document.querySelector('.clear-tasks-modal-wrapper');
export const clearTasksModalTitle = document.querySelector('.clear-tasks-modal-title');
export const confirmClearTasksBtn = document.querySelector('.confirm-clear-tasks-btn');
export const cancelClearTasksBtn = document.querySelector('.cancel-clear-tasks-btn');

// Reusable functions to close/open a modal and remove event listeners
export function closeModal(modal, confirmBtn, cancelBtn, confirmFunction, cancelFunction) {
  modal.style.display = 'none';
  confirmBtn.removeEventListener('click', confirmFunction);
  cancelBtn.removeEventListener('click', cancelFunction);
}

export function openModal(modal) {
  modal.style.display = 'block';
}

// Timer modal
export const timerModalWrapper = document.querySelector('.timer-modal-wrapper');
export const timerModalTitle = document.querySelector('.timer-modal-title');
export const dismissTimerModalBtn = document.querySelector('.dismiss-timer-modal-btn');

export function openTimerModal(title) {
  timerModalTitle.textContent = title;
  timerModalWrapper.style.display = 'flex';
  dismissTimerModalBtn.addEventListener('click', () => {
    timerModalWrapper.style.display = 'none';
  }, { once: true });
}

// Account modal
export const accountModalWrapper = document.querySelector('.account-info-popup-wrapper');
export const accountModalUsername = document.querySelector('.info-popup-username');
export const accountModalEmail = document.querySelector('.info-popup-email');
export const dismissAccountModalBtn = document.querySelector('.dismiss-account-info-popup');