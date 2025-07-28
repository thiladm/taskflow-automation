import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Trash2, CheckCircle, Circle } from 'lucide-react';
import { listsService, tasksService } from '../../services/api';
import Header from '../Layout/Header';
import TaskModal from '../Tasks/TaskModal';
import toast from 'react-hot-toast';

const ListView = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [list, setList] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    fetchListAndTasks();
  }, [listId]);

  const fetchListAndTasks = async () => {
    try {
      const [listData, tasksData] = await Promise.all([
        listsService.getList(listId),
        tasksService.getTasksForList(listId)
      ]);

      setList(listData);
      setTasks(tasksData);
    } catch (error) {
      toast.error('Failed to fetch list data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await tasksService.createTask({ ...taskData, listId });
      toast.success('Task created successfully!');
      fetchListAndTasks();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await tasksService.updateTask(editingTask.id, taskData);
      toast.success('Task updated successfully!');
      fetchListAndTasks();
      setShowModal(false);
      setEditingTask(null);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await tasksService.updateTask(task.id, {
        completed: !task.completed
      });
      fetchListAndTasks();
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await tasksService.deleteTask(taskId);
        toast.success('Task deleted successfully!');
        fetchListAndTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  if (loading) {
    return (
      <div data-testid="listview-loading">
        <Header />
        <div className="loading-center">
          <div className="spinner" data-testid="listview-loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="listview">
      <Header />
      <div className="container" data-testid="listview-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} data-testid="list-header">
            <button
              onClick={() => navigate('/dashboard')}
              className="icon-btn"
              style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'var(--gray-100)',
                border: '1px solid var(--gray-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              data-testid="back-to-dashboard-btn"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ color: list?.color, marginBottom: '4px', margin: 0 }} data-testid="list-title">
                {list?.title}
              </h1>
              {list?.description && (
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }} data-testid="list-description">
                  {list.description}
                </p>
              )}
            </div>
          </div>
          <button onClick={openCreateModal} className="add-btn" data-testid="add-task-btn">
            <Plus size={20} />
            Add Task
          </button>
        </div>

        <div className="tasks-container" data-testid="tasks-container">
          {tasks.length === 0 ? (
            <div className="empty-state" data-testid="tasks-empty-state">
              <CheckCircle size={64} style={{ color: '#ccc', marginBottom: '20px' }} data-testid="tasks-empty-icon" />
              <h3 data-testid="tasks-empty-title">No tasks yet</h3>
              <p data-testid="tasks-empty-description">Add your first task to get started!</p>
              <button onClick={openCreateModal} className="btn btn-primary" style={{ marginTop: '20px' }} data-testid="add-first-task-btn">
                <Plus size={16} style={{ marginRight: '8px' }} />
                Add Your First Task
              </button>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="task-item" data-testid={`task-item-${task.id}`}>
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="task-checkbox"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: task.completed ? '#28a745' : '#ccc'
                  }}
                  data-testid={`task-checkbox-${task.id}`}
                >
                  {task.completed ? <CheckCircle size={18} /> : <Circle size={18} />}
                </button>

                <div className="task-content" data-testid={`task-content-${task.id}`}>
                  <h4 className={`task-title ${task.completed ? 'completed' : ''}`} data-testid={`task-title-${task.id}`}>
                    {task.title}
                  </h4>
                  <p
                    className={`task-description ${!task.description ? 'placeholder' : ''}`}
                    data-testid={`task-description-${task.id}`}
                  >
                    {task.description || 'No description'}
                  </p>
                  <div className="task-meta" data-testid={`task-meta-${task.id}`}>
                    <span className={`priority-badge ${getPriorityClass(task.priority)}`} data-testid={`task-priority-${task.id}`}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="due-date" data-testid={`task-due-date-${task.id}`}>
                        Due: {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="task-actions" data-testid={`task-actions-${task.id}`}>
                  <button
                    onClick={() => openEditModal(task)}
                    className="icon-btn"
                    title="Edit task"
                    data-testid={`edit-task-btn-${task.id}`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="icon-btn"
                    data-testid={`delete-task-btn-${task.id}`}
                    title="Delete task"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && (
          <TaskModal
            task={editingTask}
            onSave={editingTask ? handleUpdateTask : handleCreateTask}
            onClose={closeModal}
            data-testid="task-modal"
          />
        )}
      </div>
    </div>
  );
};

export default ListView;
