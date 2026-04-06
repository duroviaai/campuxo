export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateUsername = (username) => {
  return username.trim().length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
};

export const validateForm = (form) => {
  const errors = {};

  if (!validateUsername(form.username)) {
    errors.username = 'Username must be at least 3 characters (letters, numbers, underscore only)';
  }

  if (!validateEmail(form.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!validatePassword(form.password)) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};