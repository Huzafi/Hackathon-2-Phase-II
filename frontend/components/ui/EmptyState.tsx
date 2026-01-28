'use client';

/**
 * Empty state component for when there are no items to display
 */

import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      {icon && (
        <div className="flex justify-center mb-4 text-zinc-400 dark:text-zinc-600">
          {icon}
        </div>
      )}
      {!icon && (
        <svg
          className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      )}
      <h3 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
