'use client';

/**
 * Error boundary for tasks page
 */

import { useEffect } from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Tasks page error:', error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto">
      <ErrorMessage>
        <div>
          <p className="font-semibold mb-2">Something went wrong!</p>
          <p className="text-sm">{error.message || 'Failed to load tasks'}</p>
        </div>
      </ErrorMessage>
      <div className="mt-4 text-center">
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
