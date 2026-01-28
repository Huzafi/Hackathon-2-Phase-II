'use client';

/**
 * Form input component with label and error display
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full px-3 py-2 border rounded-lg text-zinc-900 dark:text-zinc-50 bg-white dark:bg-zinc-900',
            'focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-zinc-300 dark:border-zinc-700',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className="mt-1 text-sm text-zinc-500 dark:text-zinc-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
