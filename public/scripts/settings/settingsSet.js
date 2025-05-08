import { settingsCache, initSettings } from "./settingsFetch.js";
import { token } from "../dashboard/dashboardAuth.js";
import { apiBase } from "../tasks/taskStorage.js";
import { pomodoroMinsInput, shortBreakMinsInput, longBreakMinsInput, accentColorInput, darkModeToggle, lightModeToggle } from "./settingsFormElements.js";

export async function setSettings() {
  const pomodoro_duration = pomodoroMinsInput.value;
  const short_break_duration = shortBreakMinsInput.value;
  const long_break_duration = longBreakMinsInput.value;
  const accent_color = accentColorInput.value;
  const theme = document.querySelector('input[name="theme"]:checked').value;

  // VALIDATION GOES HERE (work in progress)

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