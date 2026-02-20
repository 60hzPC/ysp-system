// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation (min 6 characters, at least one number and letter)
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Strong password validation
export const isStrongPassword = (password: string): boolean => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};

// Name validation (at least 2 characters)
export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

// Form validation errors
export interface ValidationErrors {
  [key: string]: string;
}

export const validateLoginForm = (email: string, password: string): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!email) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address";
  }
  
  if (!password) {
    errors.password = "Password is required";
  }
  
  return errors;
};

export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
  chapter: string
): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  if (!name) {
    errors.name = "Name is required";
  } else if (!isValidName(name)) {
    errors.name = "Name must be at least 2 characters";
  }
  
  if (!email) {
    errors.email = "Email is required";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address";
  }
  
  if (!password) {
    errors.password = "Password is required";
  } else if (!isValidPassword(password)) {
    errors.password = "Password must be at least 6 characters";
  }
  
  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  
  if (!chapter) {
    errors.chapter = "Please select a chapter";
  }
  
  return errors;
};

// Check if form has errors
export const hasErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};
