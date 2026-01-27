/**
 * API request and response types
 */

import { User, Task } from './entities';

/**
 * Authentication API types
 */
export interface SignupRequest {
  email: string;        // Valid email format
  password: string;     // Min 8 characters
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;  // JWT token
  token_type: string;    // "bearer"
  user: User;            // User details
}

/**
 * Task API types
 */
export interface CreateTaskRequest {
  title: string;           // Required, 1-200 chars
  description?: string;    // Optional, max 1000 chars
}

export interface UpdateTaskRequest {
  title?: string;          // Optional, 1-200 chars
  description?: string;    // Optional, max 1000 chars
  completed?: boolean;     // Optional
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

/**
 * Type guard for AuthResponse
 */
export function isAuthResponse(obj: any): obj is AuthResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.access_token === 'string' &&
    typeof obj.token_type === 'string' &&
    typeof obj.user === 'object'
  );
}
