'use client';

/**
 * Create task modal component
 */

import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import { createTask } from '@/lib/api/tasks';
import { TaskFormData } from '@/types/ui';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

export function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const handleSubmit = async (data: TaskFormData) => {
    await createTask({
      title: data.title,
      description: data.description || undefined,
    });
    onTaskCreated();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task" size="md">
      <TaskForm onSubmit={handleSubmit} onCancel={onClose} submitLabel="Create Task" />
    </Modal>
  );
}
