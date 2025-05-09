import { settingsCache, initSettings } from "./settingsFetch.js";
import { token } from "../dashboard/dashboardAuth.js";
import { apiBase } from "../tasks/taskStorage.js";
import { pomodoroMinsInput, shortBreakMinsInput, longBreakMinsInput, accentColorInput, darkModeToggle, lightModeToggle, settingsErrMsg } from "./settingsFormElements.js";
import { validateDuration, validateTheme } from "./settingsValidation.js";

export async function setSettings() {
  const pomodoro_duration = parseInt(pomodoroMinsInput.value, 10);
  const short_break_duration = parseInt(shortBreakMinsInput.value, 10);
  const long_break_duration = parseInt(longBreakMinsInput.value, 10);
  const accent_color = accentColorInput.value;
  const theme = document.querySelector('input[name="theme"]:checked').value;

  // VALIDATION GOES HERE (work in progress)
  if (
    validateDuration(pomodoro_duration) ||
    validateDuration(short_break_duration) ||
    validateDuration(long_break_duration) ||
    validateTheme(theme)
  ) {
    settingsErrMsg.innerHTML = 
      validateDuration(pomodoro_duration) ||
      validateDuration(short_break_duration) ||
      validateDuration(long_break_duration) ||
      validateTheme(theme);
    settingsErrMsg.style.display = 'block';
    return;
  }

  settingsErrMsg.style.display = 'none';

  try {
    // Make api post request
    const response = await fetch(`${apiBase}settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({
        pomodoro_duration,
        short_break_duration,
        long_break_duration,
        theme,
        accent_color
      })
    });

    // Check for an ok response
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update settings');
    }

    // Call initSettingsFunction
    initSettings();
  }
  catch(err) {
    console.log('Error updating settings: ', err);
  }
}