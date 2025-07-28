import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header" data-testid="header">
      <div className="header-content" data-testid="header-content">
        <div
          className="logo"
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer' }}
          data-testid="app-logo"
        >
          TaskFlow
        </div>

        <div className="user-info" data-testid="user-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} data-testid="user-welcome">
            <User size={16} />
            <span data-testid="username-display">Welcome, {user?.username}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" data-testid="logout-btn">
            <LogOut size={16} style={{ marginRight: '8px' }} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
