/**
 * Loading state for tasks page
 */

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <LoadingSpinner size="lg" />
    </div>
  );
}
