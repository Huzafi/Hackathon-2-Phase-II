/**
 * Central export for all TypeScript types
 */

// Core entities
export type { User, Task } from './entities';
export { isUser, isTask } from './entities';

// API types
export type {
  SignupRequest,
  SigninRequest,
  AuthResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskListResponse,
} from './api';
export { isAuthResponse } from './api';

// UI state types
export type {
  LoadingState,
  FormState,
  TaskFormData,
  AuthFormData,
  ModalState,
  ConfirmDialogState,
} from './ui';

// Error types
export type { ApiError, ValidationError } from './errors';
export { createApiError, isApiError } from './errors';

// Validation functions
export {
  validateEmail,
  validatePassword,
  validateTaskTitle,
  validateTaskDescription,
  validateForm,
} from './validation';
