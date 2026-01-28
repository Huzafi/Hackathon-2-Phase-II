'use client';

/**
 * Task list component - displays a list of tasks
 */

import { Task } from '@/types/entities';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTasksChange: () => void;
}

export function TaskList({ tasks, onTasksChange }: TaskListProps) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onTaskChange={onTasksChange} />
      ))}
    </div>
  );
}
