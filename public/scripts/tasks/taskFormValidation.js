const regex = /<script.*?>.*?<\/script>/i;

export function validateTitle(field) {
  if (!field) {
    return `<p>Please enter a title</p>`;
  } 
  else if (field.length > 100) {
    return `<p>Title must be under 100 characters</p>`;
  }
  else if (regex.test(field)) {
    return `<p>Invalid characters in title</p>`;
  }
  else {
    return "";
  }
}

export function validateDescription(field) {
  if (!field) {
    return `<p>Please enter a description</p>`;
  } 
  else if (field.length > 300) {
    return `<p>Description must be under 300 characters</p>`;
  }
  else if (regex.test(field)) {
    return `<p>Invalid characters in description</p>`;
  } 
  else {
    return "";
  }
}

export function validateEstimatedPomodoros(field) {
  const num = Number(field);
  if (!field) {
    return `<p>Estimated pomodoros is required</p>`;
  }
  else if (
    isNaN(num) ||
    num < 1 ||
    !Number.isInteger(num)
  ) {
    return `<p>Estimated pomodoros must be a positive integer</p>`;
  }
  else if (field >= 100) {
    return `<p>Estimated pomodoros must be under 100</p>`;
  }
  else {
    return "";
  }
}