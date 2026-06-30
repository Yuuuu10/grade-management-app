import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Matching.css';

function UserDirectory() {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingUserId, setSendingUserId] = useState(null);
  const [formByUser, setFormByUser] = useState({});
  const [feedback, setFeedback] = useState('');

  const targetRole = user?.role === 'parlor' ? 'pro' : 'parlor';

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/matching/users', {
        params: {
          role: targetRole,
          q: keyword || undefined,
        },
      });
      setUsers(response.data.data ?? []);
    } catch (error) {
      console.error('Failed to load users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      setLoading(false);
      return;
    }
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const handleOfferSubmit = async (toUserId) => {
    const values = formByUser[toUserId] || {};
    if (!values.title) {
      setFeedback('件名を入力してください');
      return;
    }

    setSendingUserId(toUserId);
    setFeedback('');
    try {
      await api.post('/matching/offers', {
        to_user_id: toUserId,
        title: values.title,
        message: values.message || '',
      });
      setFeedback('オファーを送信しました');
      setFormByUser((prev) => ({
        ...prev,
        [toUserId]: { title: '', message: '' },
      }));
    } catch (error) {
      setFeedback(error.response?.data?.message || 'オファー送信に失敗しました');
    } finally {
      setSendingUserId(null);
    }
  };

  if (user?.role === 'admin') {
    return (
      <div className="page-container">
        <div className="card">
          <h2>管理者アカウントでは検索機能を利用できません</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>{targetRole === 'pro' ? '麻雀プロを探す' : '雀荘を探す'}</h1>
      </div>

      <div className="card">
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            loadUsers();
          }}
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="名前・エリア・プロフィールで検索"
          />
          <button type="submit" className="btn btn-secondary">検索</button>
        </form>
      </div>

      {feedback && <div className="card"><p>{feedback}</p></div>}

      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : (
        <div className="grid grid-2">
          {users.map((target) => {
            const values = formByUser[target.id] || { title: '', message: '' };
            return (
              <div className="card" key={target.id}>
                <h3>{target.name}</h3>
                <p><strong>エリア:</strong> {target.area || '未設定'}</p>
                <p className="card-text">{target.profile || 'プロフィール未設定'}</p>
                <div className="form-group">
                  <label>件名</label>
                  <input
                    type="text"
                    value={values.title}
                    onChange={(e) => setFormByUser((prev) => ({
                      ...prev,
                      [target.id]: { ...values, title: e.target.value },
                    }))}
                    placeholder="例: 来店ゲストオファー"
                  />
                </div>
                <div className="form-group">
                  <label>メッセージ</label>
                  <textarea
                    rows={3}
                    value={values.message}
                    onChange={(e) => setFormByUser((prev) => ({
                      ...prev,
                      [target.id]: { ...values, message: e.target.value },
                    }))}
                    placeholder="希望日時・条件など"
                  />
                </div>
                <button
                  className="btn btn-primary"
                  disabled={sendingUserId === target.id}
                  onClick={() => handleOfferSubmit(target.id)}
                >
                  {sendingUserId === target.id ? '送信中...' : 'オファー送信'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UserDirectory;
