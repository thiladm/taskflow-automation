import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ListModal = ({ list, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: '#007bff',
  });

  const colors = [
    '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
    '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
  ];

  useEffect(() => {
    if (list) {
      setFormData({
        title: list.title || '',
        description: list.description || '',
        color: list.color || '#007bff',
      });
    }
  }, [list]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="list-modal-overlay">
      <div className="modal" onClick={(e) => e.stopPropagation()} data-testid="list-modal">
        <div className="modal-header" data-testid="list-modal-header">
          <h2 className="modal-title" data-testid="list-modal-title">
            {list ? 'Edit List' : 'Create New List'}
          </h2>
          <button onClick={onClose} className="close-btn" data-testid="list-modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} data-testid="list-modal-form">
          <div className="form-group">
            <label htmlFor="title" data-testid="list-title-label">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter list title"
              maxLength="100"
              data-testid="list-title-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description" data-testid="list-description-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter list description (optional)"
              rows="3"
              maxLength="500"
              data-testid="list-description-input"
              style={{
                padding: '12px',
                border: '2px solid #e1e1e1',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div className="form-group">
            <label data-testid="list-color-label">Color</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px',
              marginTop: '8px'
            }} data-testid="color-picker">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: formData.color === color ? '3px solid #333' : '2px solid #ddd',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  title={color}
                  data-testid={`color-option-${color.replace('#', '')}`}
                />
              ))}
            </div>
          </div>

          <div className="form-actions" data-testid="list-modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary" data-testid="list-modal-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" data-testid="list-modal-save-btn">
              {list ? 'Update List' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ListModal;
