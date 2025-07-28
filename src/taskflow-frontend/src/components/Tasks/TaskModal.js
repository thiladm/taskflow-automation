import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TaskModal = ({ task, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Due date validation
    if (formData.dueDate) {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only

      if (selectedDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      dueDate: formData.dueDate || null,
    };
    onSave(submitData);
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="task-modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="task-modal">
        <div className="modal-header" data-testid="task-modal-header">
          <h2 className="modal-title" data-testid="task-modal-title">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="close-btn" data-testid="task-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} data-testid="task-modal-form">
          <div className="form-group">
            <label htmlFor="title" data-testid="task-title-label">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
              maxLength="200"
              className={errors.title ? 'error' : ''}
              data-testid="task-title-input"
            />
            {errors.title && (
              <span className="error-message" data-testid="task-title-error">
                {errors.title}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" data-testid="task-description-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description (optional)"
              rows="3"
              maxLength="1000"
              className={errors.description ? 'error' : ''}
              data-testid="task-description-input"
              style={{
                padding: '12px',
                border: `2px solid ${errors.description ? '#ef4444' : '#e1e1e1'}`,
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
            {errors.description && (
              <span className="error-message" data-testid="task-description-error">
                {errors.description}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="priority" data-testid="task-priority-label">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              data-testid="task-priority-select"
              style={{
                padding: '12px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="dueDate" data-testid="task-due-date-label">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={errors.dueDate ? 'error' : ''}
              data-testid="task-due-date-input"
              style={{
                padding: '12px',
                border: `2px solid ${errors.dueDate ? '#ef4444' : '#e1e1e1'}`,
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            {errors.dueDate && (
              <span className="error-message" data-testid="task-due-date-error">
                {errors.dueDate}
              </span>
            )}
          </div>

          <div className="form-actions" data-testid="task-modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" data-testid="task-modal-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" data-testid="task-modal-save-btn">
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
