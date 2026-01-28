/**
 * Core entity types representing domain models
 */

/**
 * User entity representing an authenticated user
 */
export interface User {
  id: string;           // UUID from backend
  email: string;        // User's email address
  created_at: string;   // ISO 8601 timestamp
}

/**
 * Task entity representing a todo item
 */
export interface Task {
  id: string;              // Integer ID from backend (converted to string)
  title: string;           // Task title (required, max 200 chars)
  description: string;     // Task description (optional, max 1000 chars, defaults to empty string)
  completed: boolean;      // Completion status (maps to is_completed in backend)
  user_id: string;         // Integer user ID from backend (converted to string)
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
}

/**
 * Type guards for runtime type checking
 */
export function isUser(obj: any): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.created_at === 'string'
  );
}

export function isTask(obj: any): obj is Task {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.completed === 'boolean' &&
    typeof obj.user_id === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}
