/**
 * UI state types for frontend components
 */

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Generic form state management
 */
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

/**
 * Task form data
 */
export interface TaskFormData {
  title: string;
  description: string;
}

/**
 * Auth form data
 */
export interface AuthFormData {
  email: string;
  password: string;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Confirmation dialog state
 */
export interface ConfirmDialogState extends ModalState {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}
