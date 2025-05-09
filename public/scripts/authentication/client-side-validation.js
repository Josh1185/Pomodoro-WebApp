
const regex = /<script.*?>.*?<\/script>/i;
const pwdRegexLetter = /[A-Za-z]/;
const pwdRegexNumber = /\d/;
const pwdRegexSpecial = /[!@#$%^&*(),.?":{}|_<>]/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

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
  } else if (!pwdRegexLetter.test(field)) {
    return `<p>Password must include at least one letter</p>`;
  } else if (!pwdRegexNumber.test(field)) {
    return `<p>Password must include at least one number</p>`;
  } else if (!pwdRegexSpecial.test(field)) {
    return `<p>Password must include at least one special character</p>`;
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

export function sanitizeInput(input) {
  return input
    .replace(/</g, "&lt;")   // Replace < with HTML entity
    .replace(/>/g, "&gt;")   // Replace > with HTML entity
    .replace(/"/g, "&quot;") // Replace " with entity
    .replace(/'/g, "&#x27;") // Replace ' with entity
    .replace(/\//g, "&#x2F;") // Replace / with entity
    .trim();                 // Remove leading/trailing whitespace
}
