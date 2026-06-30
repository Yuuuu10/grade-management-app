import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import './Matching.css';

function OfferMessages() {
  const { id } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/matching/offers/${id}/messages`);
      setMessages(response.data);
    } catch (error) {
      setFeedback(error.response?.data?.message || 'メッセージ取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const send = async (e) => {
    e.preventDefault();
    if (!body.trim()) {
      return;
    }
    setSubmitting(true);
    setFeedback('');
    try {
      await api.post(`/matching/offers/${id}/messages`, { body });
      setBody('');
      await loadMessages();
    } catch (error) {
      setFeedback(error.response?.data?.message || '送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>メッセージ</h1>
        <Link className="btn btn-secondary" to="/offers">一覧へ戻る</Link>
      </div>

      {feedback && <div className="card"><p>{feedback}</p></div>}

      <div className="card chat-box">
        {loading ? (
          <div className="loading">読み込み中...</div>
        ) : messages.length === 0 ? (
          <p>まだメッセージはありません</p>
        ) : (
          <div className="message-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-item ${message.sender_id === user?.id ? 'my-message' : ''}`}
              >
                <p className="message-meta">{message.sender?.name}</p>
                <p>{message.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <form onSubmit={send} className="inline-form">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="メッセージを入力"
          />
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? '送信中...' : '送信'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OfferMessages;
