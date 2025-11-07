import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Games.css';

function Games() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, mine, participated

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await api.get('/games');
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('このゲームを削除してもよろしいですか?')) {
      return;
    }
    try {
      await api.delete(`/games/${id}`);
      fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('ゲームの削除に失敗しました');
    }
  };

  const getRankBadgeClass = (rank) => {
    switch (rank) {
      case 1: return 'rank-1';
      case 2: return 'rank-2';
      case 3: return 'rank-3';
      case 4: return 'rank-4';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>成績一覧</h1>
        <Link to="/games/new" className="btn btn-primary">
          新規成績登録
        </Link>
      </div>

      {games.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p>まだゲームが登録されていません</p>
            <Link to="/games/new" className="btn btn-primary">
              最初のゲームを登録
            </Link>
          </div>
        </div>
      ) : (
        <div className="games-list">
          {games.map((game) => (
            <div key={game.id} className="game-card">
              <div className="game-header">
                <div className="game-info">
                  <h3>
                    {new Date(game.played_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </h3>
                  <div className="game-meta">
                    <span className="meta-item">
                      <strong>ルール:</strong> {game.rule?.name || '-'}
                    </span>
                    {game.location && (
                      <span className="meta-item">
                        <strong>場所:</strong> {game.location.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="game-players">
                <table>
                  <thead>
                    <tr>
                      <th>順位</th>
                      <th>プレイヤー</th>
                      <th>素点</th>
                      <th>スコア</th>
                    </tr>
                  </thead>
                  <tbody>
                    {game.players
                      ?.sort((a, b) => a.rank - b.rank)
                      .map((player) => (
                        <tr key={player.id}>
                          <td>
                            <span className={`rank-badge ${getRankBadgeClass(player.rank)}`}>
                              {player.rank}位
                            </span>
                          </td>
                          <td>{player.user?.name || '-'}</td>
                          <td>{player.score?.toLocaleString()}</td>
                          <td className={player.calculated_score >= 0 ? 'positive' : 'negative'}>
                            {player.calculated_score >= 0 ? '+' : ''}
                            {parseFloat(player.calculated_score).toFixed(1)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {game.notes && (
                <div className="game-notes">
                  <strong>メモ:</strong> {game.notes}
                </div>
              )}

              <div className="game-actions">
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleDelete(game.id)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Games;
