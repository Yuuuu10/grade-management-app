import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './GameForm.css';

function GameForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    rule_id: '',
    location_id: '',
    played_at: new Date().toISOString().slice(0, 16),
    notes: '',
    players: [
      { user_id: user.id, rank: 1, score: 25000 },
      { user_id: '', rank: 2, score: 25000 },
      { user_id: '', rank: 3, score: 25000 },
      { user_id: '', rank: 4, score: 25000 },
    ]
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [rulesRes, locationsRes, statsRes] = await Promise.all([
        api.get('/rules'),
        api.get('/locations'),
        api.get('/scores/statistics')
      ]);

      setRules(rulesRes.data);
      setLocations(locationsRes.data);
      
      // デフォルトルールを選択
      const defaultRule = rulesRes.data.find(r => r.is_default);
      if (defaultRule) {
        setFormData(prev => ({ ...prev, rule_id: defaultRule.id }));
      }

      // ユーザーリストを作成（統計から）
      const usersList = [user];
      statsRes.data.forEach(stat => {
        if (stat.user && stat.user.id !== user.id) {
          usersList.push(stat.user);
        }
      });
      setUsers(usersList);

    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handlePlayerChange = (index, field, value) => {
    const newPlayers = [...formData.players];
    newPlayers[index] = {
      ...newPlayers[index],
      [field]: field === 'score' || field === 'rank' ? parseInt(value) : value
    };
    setFormData({
      ...formData,
      players: newPlayers
    });
  };

  const validateForm = () => {
    if (!formData.rule_id) {
      alert('ルールを選択してください');
      return false;
    }

    // 全プレイヤーが選択されているかチェック
    for (let i = 0; i < 4; i++) {
      if (!formData.players[i].user_id) {
        alert(`${i + 1}人目のプレイヤーを選択してください`);
        return false;
      }
    }

    // プレイヤーの重複チェック
    const userIds = formData.players.map(p => p.user_id);
    if (new Set(userIds).size !== 4) {
      alert('同じプレイヤーを複数回選択できません');
      return false;
    }

    // 順位の重複チェック
    const ranks = formData.players.map(p => p.rank);
    if (new Set(ranks).size !== 4) {
      alert('順位が重複しています');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/games', formData);
      navigate('/games');
    } catch (error) {
      console.error('Error creating game:', error);
      alert('ゲームの登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>成績登録</h1>
      </div>

      <form onSubmit={handleSubmit} className="game-form">
        <div className="card">
          <h2>ゲーム情報</h2>
          
          <div className="form-group">
            <label htmlFor="rule_id">ルール *</label>
            <select
              id="rule_id"
              name="rule_id"
              value={formData.rule_id}
              onChange={handleInputChange}
              required
            >
              <option value="">ルールを選択</option>
              {rules.map(rule => (
                <option key={rule.id} value={rule.id}>
                  {rule.name}
                  {rule.is_default ? ' (デフォルト)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location_id">場所</label>
            <select
              id="location_id"
              name="location_id"
              value={formData.location_id}
              onChange={handleInputChange}
            >
              <option value="">場所を選択（任意）</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="played_at">対局日時 *</label>
            <input
              type="datetime-local"
              id="played_at"
              name="played_at"
              value={formData.played_at}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">メモ</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="対局のメモ、特記事項など"
            />
          </div>
        </div>

        <div className="card">
          <h2>プレイヤー成績</h2>
          
          <div className="players-grid">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="player-form">
                <h3>プレイヤー {index + 1}</h3>
                
                <div className="form-group">
                  <label htmlFor={`player_${index}_user`}>プレイヤー *</label>
                  <select
                    id={`player_${index}_user`}
                    value={formData.players[index].user_id}
                    onChange={(e) => handlePlayerChange(index, 'user_id', e.target.value)}
                    required
                  >
                    <option value="">選択してください</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor={`player_${index}_rank`}>順位 *</label>
                    <select
                      id={`player_${index}_rank`}
                      value={formData.players[index].rank}
                      onChange={(e) => handlePlayerChange(index, 'rank', e.target.value)}
                      required
                    >
                      <option value="1">1位</option>
                      <option value="2">2位</option>
                      <option value="3">3位</option>
                      <option value="4">4位</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor={`player_${index}_score`}>素点 *</label>
                    <input
                      type="number"
                      id={`player_${index}_score`}
                      value={formData.players[index].score}
                      onChange={(e) => handlePlayerChange(index, 'score', e.target.value)}
                      required
                      step="100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? '登録中...' : '登録'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/games')}
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}

export default GameForm;
