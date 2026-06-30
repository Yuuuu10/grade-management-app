import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navigation.css';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🀄 麻雀マッチング
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/" className="navbar-link">ダッシュボード</Link>
          </li>
          {user.role !== 'admin' && (
            <>
              <li>
                <Link to="/directory" className="navbar-link">相手を探す</Link>
              </li>
              <li>
                <Link to="/offers" className="navbar-link">オファー管理</Link>
              </li>
            </>
          )}
          {user.role === 'admin' && (
            <li>
              <Link to="/admin" className="navbar-link">管理画面</Link>
            </li>
          )}
        </ul>
        <div className="navbar-user">
          <span className="user-name">{user.name} ({user.role})</span>
          <button onClick={handleLogout} className="btn-logout">
            ログアウト
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
