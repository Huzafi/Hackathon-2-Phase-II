/**
 * Validation functions for form inputs
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email format
 */
export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  return null;
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
}

/**
 * Validate task title
 */
export function validateTaskTitle(title: string): string | null {
  if (!title || title.trim().length === 0) return 'Title is required';
  if (title.length > 200) return 'Title must be 200 characters or less';
  return null;
}

/**
 * Validate task description
 */
export function validateTaskDescription(description: string): string | null {
  if (description && description.length > 1000) {
    return 'Description must be 1000 characters or less';
  }
  return null;
}

/**
 * Validate form data and return errors
 */
export function validateForm<T extends Record<string, any>>(
  data: T,
  validators: Partial<Record<keyof T, (value: any) => string | null>>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const field in validators) {
    const validator = validators[field];
    if (validator) {
      const error = validator(data[field]);
      if (error) {
        errors[field] = error;
      }
    }
  }

  return errors;
}
