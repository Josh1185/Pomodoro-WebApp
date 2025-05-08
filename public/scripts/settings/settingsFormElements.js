import { settingsCache } from "./settingsFetch.js";
import { setSettings } from "./settingsSet.js";

export const settingsForm = document.querySelector('.settings-form');
export const pomodoroMinsInput = document.querySelector('.pomodoro-minutes-input');
export const shortBreakMinsInput = document.querySelector('.short-break-minutes-input');
export const longBreakMinsInput = document.querySelector('.long-break-minutes-input');
export const darkModeToggle = document.querySelector('.dark-mode-toggle');
export const lightModeToggle = document.querySelector('.light-mode-toggle');
export const accentColorInput = document.querySelector('.accent-color-input');
export const saveSettingsBtn = document.querySelector('.save-settings-btn');

settingsForm.addEventListener('submit', async () => {
  await setSettings();
});