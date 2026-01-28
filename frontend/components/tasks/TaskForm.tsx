'use client';

/**
 * Task form component for creating and editing tasks
 */

import { useState, FormEvent } from 'react';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { validateTaskTitle, validateTaskDescription } from '@/types/validation';
import { TaskFormData } from '@/types/ui';

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function TaskForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    // Validate form
    const newErrors: Record<string, string> = {};

    const titleError = validateTaskTitle(title);
    if (titleError) newErrors.title = titleError;

    const descriptionError = validateTaskDescription(description);
    if (descriptionError) newErrors.description = descriptionError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    setIsSubmitting(true);
    try {
      await onSubmit({ title, description });
    } catch (error: any) {
      setApiError(error.message || 'Failed to save task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {apiError && <ErrorMessage>{apiError}</ErrorMessage>}

      <FormInput
        label="Title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        placeholder="Enter task title"
        required
        maxLength={200}
      />

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter task description (optional)"
          rows={4}
          maxLength={1000}
          className="w-full px-3 py-2 border rounded-lg text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.description}
          </p>
        )}
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
          {description.length}/1000 characters
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
