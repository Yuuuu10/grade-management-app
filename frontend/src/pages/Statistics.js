import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Statistics.css';

function Statistics() {
  const [ranking, setRanking] = useState([]);
  const [allStats, setAllStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('ranking'); // 'ranking' or 'all'

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const [rankingRes, statsRes] = await Promise.all([
        api.get('/scores/ranking'),
        api.get('/scores/statistics')
      ]);

      setRanking(rankingRes.data);
      setAllStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWinRate = (stats) => {
    if (!stats.total_games) return 0;
    return ((stats.first_place / stats.total_games) * 100).toFixed(1);
  };

  const calculateTop2Rate = (stats) => {
    if (!stats.total_games) return 0;
    return (((stats.first_place + stats.second_place) / stats.total_games) * 100).toFixed(1);
  };

  const getRankDistribution = (stats) => {
    return [
      { rank: '1位', count: stats.first_place || 0, color: '#FFD700' },
      { rank: '2位', count: stats.second_place || 0, color: '#C0C0C0' },
      { rank: '3位', count: stats.third_place || 0, color: '#CD7F32' },
      { rank: '4位', count: stats.fourth_place || 0, color: '#666' },
    ];
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>ユーザー全体成績管理</h1>
        <div className="view-toggle">
          <button
            className={`btn ${view === 'ranking' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('ranking')}
          >
            ランキング
          </button>
          <button
            className={`btn ${view === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('all')}
          >
            全体統計
          </button>
        </div>
      </div>

      {view === 'ranking' ? (
        <div className="card">
          <h2>平均スコアランキング</h2>
          <p className="ranking-description">
            ※3ゲーム以上プレイしたユーザーのみ表示
          </p>
          
          {ranking.length === 0 ? (
            <div className="empty-state">
              <p>まだ十分なデータがありません</p>
            </div>
          ) : (
            <div className="ranking-list">
              {ranking.map((item, index) => (
                <div key={item.user_id} className="ranking-item">
                  <div className="ranking-position">
                    <span className={`rank-number rank-${index + 1}`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="ranking-info">
                    <h3>{item.user?.name || 'Unknown'}</h3>
                    <div className="ranking-stats">
                      <div className="stat-item">
                        <span className="stat-label">対局数</span>
                        <span className="stat-value">{item.total_games}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">平均スコア</span>
                        <span className="stat-value highlight">
                          {parseFloat(item.average_score).toFixed(1)}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">累計スコア</span>
                        <span className={`stat-value ${item.total_score >= 0 ? 'positive' : 'negative'}`}>
                          {item.total_score >= 0 ? '+' : ''}
                          {parseFloat(item.total_score).toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="stats-grid-container">
          {allStats.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <p>まだデータがありません</p>
              </div>
            </div>
          ) : (
            allStats.map((stats) => (
              <div key={stats.user_id} className="card user-stats-card">
                <h3>{stats.user?.name || 'Unknown'}</h3>
                
                <div className="stats-summary">
                  <div className="summary-item">
                    <div className="summary-value">{stats.total_games}</div>
                    <div className="summary-label">対局数</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-value">
                      {parseFloat(stats.average_score).toFixed(1)}
                    </div>
                    <div className="summary-label">平均スコア</div>
                  </div>
                  <div className="summary-item">
                    <div className={`summary-value ${stats.total_score >= 0 ? 'positive' : 'negative'}`}>
                      {stats.total_score >= 0 ? '+' : ''}
                      {parseFloat(stats.total_score).toFixed(1)}
                    </div>
                    <div className="summary-label">累計スコア</div>
                  </div>
                </div>

                <div className="rank-distribution">
                  <h4>順位分布</h4>
                  {getRankDistribution(stats).map((item) => (
                    <div key={item.rank} className="rank-bar-container">
                      <span className="rank-label">{item.rank}</span>
                      <div className="rank-bar-wrapper">
                        <div
                          className="rank-bar"
                          style={{
                            width: `${(item.count / stats.total_games) * 100}%`,
                            backgroundColor: item.color
                          }}
                        />
                        <span className="rank-count">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="additional-stats">
                  <div className="additional-stat">
                    <span className="label">1位率:</span>
                    <span className="value">{calculateWinRate(stats)}%</span>
                  </div>
                  <div className="additional-stat">
                    <span className="label">連対率:</span>
                    <span className="value">{calculateTop2Rate(stats)}%</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Statistics;
