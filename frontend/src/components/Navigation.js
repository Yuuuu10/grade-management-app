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
          🀄 麻雀成績管理
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link to="/" className="navbar-link">ダッシュボード</Link>
          </li>
          <li>
            <Link to="/games" className="navbar-link">成績一覧</Link>
          </li>
          <li>
            <Link to="/games/new" className="navbar-link">成績登録</Link>
          </li>
          <li>
            <Link to="/rules" className="navbar-link">ルール設定</Link>
          </li>
          <li>
            <Link to="/locations" className="navbar-link">場所登録</Link>
          </li>
          <li>
            <Link to="/statistics" className="navbar-link">統計</Link>
          </li>
        </ul>
        <div className="navbar-user">
          <span className="user-name">{user.name}</span>
          <button onClick={handleLogout} className="btn-logout">
            ログアウト
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
