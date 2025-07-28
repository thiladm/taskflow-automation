import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, List } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { listsService, tasksService } from '../../services/api';
import Header from '../Layout/Header';
import ListModal from '../Lists/ListModal';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [lists, setLists] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [listTasks, setListTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const [listsData, tasksData] = await Promise.all([
        listsService.getAllLists(),
        tasksService.getAllTasks()
      ]);

      setLists(listsData);

      // Calculate task counts and organize tasks by list
      const counts = {};
      const tasksByList = {};

      tasksData.forEach(task => {
        const listId = task.list_id || task.list?.id || task.list;
        counts[listId] = (counts[listId] || 0) + 1;

        if (!tasksByList[listId]) {
          tasksByList[listId] = [];
        }
        tasksByList[listId].push(task);
      });

      // Sort tasks by priority and due date, then take top 3
      Object.keys(tasksByList).forEach(listId => {
        tasksByList[listId] = tasksByList[listId]
          .sort((a, b) => {
            // Sort by completed status first (incomplete tasks first)
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }

            // Then by priority (high > medium > low)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
            if (priorityDiff !== 0) return priorityDiff;

            // Then by due date (sooner dates first)
            if (a.dueDate && b.dueDate) {
              return new Date(a.dueDate) - new Date(b.dueDate);
            }
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;

            return 0;
          })
          .slice(0, 3); // Take top 3 tasks
      });

      setTaskCounts(counts);
      setListTasks(tasksByList);
    } catch (error) {
      toast.error('Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (listData) => {
    try {
      await listsService.createList(listData);
      toast.success('List created successfully!');
      fetchLists();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to create list');
    }
  };

  const handleUpdateList = async (listData) => {
    try {
      await listsService.updateList(editingList.id, listData);
      toast.success('List updated successfully!');
      fetchLists();
      setShowModal(false);
      setEditingList(null);
    } catch (error) {
      toast.error('Failed to update list');
    }
  };

  const handleDeleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list? All tasks in this list will also be deleted.')) {
      try {
        await listsService.deleteList(listId);
        toast.success('List deleted successfully!');
        fetchLists();
      } catch (error) {
        toast.error('Failed to delete list');
      }
    }
  };

  const openEditModal = (list) => {
    setEditingList(list);
    setShowModal(true);
  };

  const openCreateModal = () => {
    setEditingList(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingList(null);
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    if (diffDays < 7) return `${diffDays} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div data-testid="dashboard-loading">
        <Header />
        <div className="loading-center">
          <div className="spinner" data-testid="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="dashboard">
      <Header />
      <div className="container" data-testid="dashboard-container">
        <div className="lists-grid" data-testid="lists-grid">
          {/* Create List Card */}
          <div
            className="list-card create-list-card"
            onClick={openCreateModal}
            style={{ cursor: 'pointer' }}
            data-testid="create-list-card"
          >
            <div className="create-list-content">
              <Plus size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--primary)', margin: 0 }}>Create New List</h3>
              <p style={{ color: 'var(--gray-600)', margin: '0.5rem 0 0 0', fontSize: '14px' }}>
                Start organizing your tasks
              </p>
            </div>
          </div>

          {/* Existing Lists */}
          {lists.map((list) => (
            <div
              key={list.id}
              className="list-card"
              onClick={() => navigate(`/lists/${list.id}`)}
              style={{
                cursor: 'pointer',
                '--list-color': list.color
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = list.color;
                e.currentTarget.style.boxShadow = `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px ${list.color}30`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--gray-200)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              data-testid={`list-card-${list.id}`}
            >
              <div className="list-header">
                <h3
                  className="list-title"
                  style={{ color: list.color }}
                  data-testid={`list-title-${list.id}`}
                >
                  {list.title}
                </h3>
                <div className="list-actions" data-testid={`list-actions-${list.id}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(list);
                    }}
                    className="icon-btn"
                    title="Edit list"
                    data-testid={`edit-list-btn-${list.id}`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                    className="icon-btn"
                    title="Delete list"
                    data-testid={`delete-list-btn-${list.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {list.description && (
                <p className="list-description" data-testid={`list-description-${list.id}`}>{list.description}</p>
              )}

              {/* Top Tasks Preview */}
              {listTasks[list.id] && listTasks[list.id].length > 0 && (
                <div className="task-preview" data-testid={`task-preview-${list.id}`}>
                  {listTasks[list.id].map((task, index) => (
                    <div key={task.id} className="preview-task" data-testid={`preview-task-${task.id}`}>
                      <div className="preview-task-content">
                        <span className={`preview-task-title ${task.completed ? 'completed' : ''}`}>
                          {task.title}
                        </span>
                        {task.dueDate && (
                          <span className={`preview-due-date ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}>
                            {formatDueDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {taskCounts[list.id] > 3 && (
                    <div className="more-tasks">
                      +{taskCounts[list.id] - 3} more tasks
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="task-count" data-testid={`task-count-${list.id}`}>
                  {taskCounts[list.id] || 0} task{taskCounts[list.id] !== 1 ? 's' : ''}
                </span>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: list.color,
                  }}
                  data-testid={`list-color-indicator-${list.id}`}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <ListModal
            list={editingList}
            onSave={editingList ? handleUpdateList : handleCreateList}
            onClose={closeModal}
            data-testid="list-modal"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
