import { token } from '../dashboard/dashboardAuth.js';
import { apiBase } from '../tasks/taskStorage.js';
import { lightModeToggle, darkModeToggle, pomodoroMinsInput, longBreakMinsInput, shortBreakMinsInput, accentColorInput } from './settingsFormElements.js';

async function fetchSettings() {
  try {
    // make api request
    const response = await fetch(`${apiBase}settings`, {
      headers: { 'Authorization': token }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch settings data');
    }
    const settingsData = await response.json();
    return settingsData;
  }
  catch (err) {
    console.log('Failed to fetch settings data', err);
  }
}

export let settingsCache = null;
const root = document.documentElement;

export async function initSettings() {
  settingsCache = await fetchSettings();

  if (!settingsCache) return;

  // Set the input values to be the values that are set
  pomodoroMinsInput.value = settingsCache.pomodoro_duration;
  shortBreakMinsInput.value = settingsCache.short_break_duration;
  longBreakMinsInput.value = settingsCache.long_break_duration;
  accentColorInput.value = settingsCache.accent_color;

  // Apply the accent color
  root.style.setProperty('--accent-color', settingsCache.accent_color);

  // Apply themes
  if (settingsCache.theme === 'dark') {
    darkModeToggle.checked = true;
    root.style.setProperty('--background-color-1', '#1a1a1a');
    root.style.setProperty('--background-color-2', '#252525');
    root.style.setProperty('--text-color', '#ffffff');
    root.style.setProperty('--font-color', '#ffffff');
  }
  else if (settingsCache.theme === 'light') {
    lightModeToggle.checked = true;
    root.style.setProperty('--background-color-1', '#ffffff');
    root.style.setProperty('--background-color-2', '#e2e2e2');
    root.style.setProperty('--text-color', '#000000');
    root.style.setProperty('--font-color', '#000000');
  }
}