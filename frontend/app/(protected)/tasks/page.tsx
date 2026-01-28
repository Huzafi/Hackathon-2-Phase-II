'use client';

/**
 * Tasks page - displays list of tasks for authenticated user with enhanced UI
 */

import { useState, useEffect } from 'react';
import { getTasks } from '@/lib/api/tasks';
import { Task } from '@/types/entities';
import { TaskList } from '@/components/tasks/TaskList';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/Button';
import { Plus, RefreshCw } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedTasks = await getTasks();
      setTasks(fetchedTasks);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleRefresh = () => {
    fetchTasks();
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleTaskCreated = () => {
    fetchTasks();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorMessage>{error}</ErrorMessage>
        <div className="mt-4 text-center">
          <Button onClick={handleRefresh}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} in your list
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="secondary"
              size="md"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={handleOpenCreateModal}
              size="md"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Tasks Content */}
      {tasks.length === 0 ? (
        <div className="animate-scale-in">
          <EmptyState
            title="No tasks yet"
            description="Get started by creating your first task and stay organized"
            action={
              <Button
                onClick={handleOpenCreateModal}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Task
              </Button>
            }
          />
        </div>
      ) : (
        <div className="animate-slide-up">
          <TaskList tasks={tasks} onTasksChange={fetchTasks} />
        </div>
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
