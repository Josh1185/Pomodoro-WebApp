const regex = /<script.*?>.*?<\/script>/i;
const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(field) {

  if (!field) {
    return `<p>Please enter an email</p>`;
  } else if (!emailRegex.test(field)) {
    return `<p>Invalid email format</p>`;
  } else if (regex.test(field)) {
    return `<p>Invalid characters in email</p>`;
  } else {
    return "";
  }
}

export function validatePwd(field) {
  
  if (!field) {
    return `<p>Please enter a password</p>`;
  } else if (field.length < 8) {
    return `<p>Password must be at least 8 characters</p>`;
  } else if (!pwdRegex.test(field)) {
    return `<p>Password must include at least one letter and number</p>`;
  } else if (regex.test(field)) {
    return `<p>Invalid characters in password</p>`;
  } else {
    return "";
  }
}

export function pwdsMatch(confirmPwd, pwd) {
  if (confirmPwd !== pwd) {
    return `<p>Passwords do not match</p>`;
  }
  else if (!confirmPwd) {
    return `<p>Please confirm your password</p>`;
  }
  else {
    return "";
  }
}