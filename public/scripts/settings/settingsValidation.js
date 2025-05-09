export function validateDuration(value) {
  const num = Number(value);
  if (!value) {
    return `<p>This field is required.</p>`;
  } else if (isNaN(num) || !Number.isInteger(num)) {
    return `<p>Must be a whole number.</p>`;
  } else if (num < 1 || num > 60) {
    return `<p>Must be between 1 and 60.</p>`;
  }
  return "";
}

export function validateTheme(value) {
  if (value !== "light" && value !== "dark") {
    return `<p>Theme must be 'light' or 'dark'.</p>`;
  }
  return "";
}