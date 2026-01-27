'use client';

/**
 * Edit task modal component
 */

import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import { updateTask } from '@/lib/api/tasks';
import { Task } from '@/types/entities';
import { TaskFormData } from '@/types/ui';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: () => void;
  task: Task;
}

export function EditTaskModal({ isOpen, onClose, onTaskUpdated, task }: EditTaskModalProps) {
  const handleSubmit = async (data: TaskFormData) => {
    await updateTask(task.id, {
      title: data.title,
      description: data.description || undefined,
    });
    onTaskUpdated();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Task" size="md">
      <TaskForm
        initialData={{
          title: task.title,
          description: task.description,
        }}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Update Task"
      />
    </Modal>
  );
}
