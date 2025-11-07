import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, gamesRes] = await Promise.all([
        api.get(`/scores/user/${user.id}`),
        api.get('/games')
      ]);

      setStats(statsRes.data.statistics);
      setRecentGames(gamesRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>ダッシュボード</h1>
      </div>

      <div className="welcome-section">
        <h2>ようこそ、{user.name}さん！</h2>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total_games || 0}</div>
            <div className="stat-label">総ゲーム数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.first_place || 0}</div>
            <div className="stat-label">1位回数</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {stats.average_score ? parseFloat(stats.average_score).toFixed(1) : '0.0'}
            </div>
            <div className="stat-label">平均スコア</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {stats.total_score ? parseFloat(stats.total_score).toFixed(1) : '0.0'}
            </div>
            <div className="stat-label">累計スコア</div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>最近のゲーム</h2>
          <Link to="/games" className="btn btn-secondary btn-small">
            すべて見る
          </Link>
        </div>
        
        {recentGames.length === 0 ? (
          <div className="empty-state">
            <p>まだゲームが登録されていません</p>
            <Link to="/games/new" className="btn btn-primary">
              ゲームを登録
            </Link>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>日時</th>
                <th>場所</th>
                <th>ルール</th>
                <th>詳細</th>
              </tr>
            </thead>
            <tbody>
              {recentGames.map((game) => (
                <tr key={game.id}>
                  <td>{new Date(game.played_at).toLocaleString('ja-JP')}</td>
                  <td>{game.location?.name || '-'}</td>
                  <td>{game.rule?.name || '-'}</td>
                  <td>
                    <Link to={`/games/${game.id}`} className="btn btn-secondary btn-small">
                      詳細
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="quick-actions">
        <h2>クイックアクション</h2>
        <div className="action-buttons">
          <Link to="/games/new" className="action-button">
            <span className="action-icon">➕</span>
            <span>成績登録</span>
          </Link>
          <Link to="/rules" className="action-button">
            <span className="action-icon">⚙️</span>
            <span>ルール設定</span>
          </Link>
          <Link to="/locations" className="action-button">
            <span className="action-icon">📍</span>
            <span>場所登録</span>
          </Link>
          <Link to="/statistics" className="action-button">
            <span className="action-icon">📊</span>
            <span>統計を見る</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
