const regex = /<script.*?>.*?<\/script>/i;

export function validateEmail(field) {

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
  
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