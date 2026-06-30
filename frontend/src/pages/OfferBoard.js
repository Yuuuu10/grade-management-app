import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Matching.css';

const STATUS_LABEL = {
  pending: '承認待ち',
  accepted: '承認済み',
  rejected: '辞退',
  in_progress: 'やり取り中',
  completed: '完了',
  cancelled: 'キャンセル',
};

function OfferBoard() {
  const [offers, setOffers] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  const loadOffers = async (selectedStatus = status) => {
    setLoading(true);
    try {
      const response = await api.get('/matching/offers', {
        params: { status: selectedStatus || undefined },
      });
      setOffers(response.data);
    } catch (error) {
      setFeedback('一覧取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeStatus = async (offerId, nextStatus) => {
    setFeedback('');
    try {
      await api.patch(`/matching/offers/${offerId}/status`, { status: nextStatus });
      await loadOffers();
    } catch (error) {
      setFeedback(error.response?.data?.message || 'ステータス更新に失敗しました');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>オファー管理</h1>
      </div>

      <div className="card">
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            loadOffers(status);
          }}
        >
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">すべて</option>
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-secondary">絞り込み</button>
        </form>
      </div>

      {feedback && <div className="card"><p>{feedback}</p></div>}

      {loading ? (
        <div className="loading">読み込み中...</div>
      ) : offers.length === 0 ? (
        <div className="empty-state"><p>オファーはありません</p></div>
      ) : (
        <div className="grid">
          {offers.map((offer) => (
            <div className="card" key={offer.id}>
              <div className="offer-header">
                <h3>{offer.title}</h3>
                <span className={`status-chip status-${offer.status}`}>{STATUS_LABEL[offer.status]}</span>
              </div>
              <p><strong>相手:</strong> {offer.counterpart?.name} ({offer.counterpart?.role === 'parlor' ? '雀荘' : '麻雀プロ'})</p>
              <p className="card-text">{offer.message || 'メッセージなし'}</p>
              <p><strong>メッセージ数:</strong> {offer.messages_count}</p>

              <div className="offer-actions">
                {!offer.is_sender && offer.status === 'pending' && (
                  <>
                    <button className="btn btn-primary btn-small" onClick={() => changeStatus(offer.id, 'accepted')}>承認</button>
                    <button className="btn btn-danger btn-small" onClick={() => changeStatus(offer.id, 'rejected')}>辞退</button>
                  </>
                )}
                {offer.is_sender && offer.status === 'pending' && (
                  <button className="btn btn-danger btn-small" onClick={() => changeStatus(offer.id, 'cancelled')}>キャンセル</button>
                )}
                {offer.status === 'accepted' && (
                  <button className="btn btn-secondary btn-small" onClick={() => changeStatus(offer.id, 'in_progress')}>やり取り中にする</button>
                )}
                {(offer.status === 'accepted' || offer.status === 'in_progress') && (
                  <button className="btn btn-primary btn-small" onClick={() => changeStatus(offer.id, 'completed')}>完了にする</button>
                )}
                {(offer.status === 'accepted' || offer.status === 'in_progress' || offer.status === 'completed') && (
                  <Link className="btn btn-secondary btn-small" to={`/offers/${offer.id}`}>メッセージ</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OfferBoard;
