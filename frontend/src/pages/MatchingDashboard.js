import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Matching.css';

function MatchingDashboard() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/matching/offers');
        setOffers(response.data);
      } catch (error) {
        console.error('Failed to load offers', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const summary = useMemo(() => ({
    pending: offers.filter((offer) => offer.status === 'pending').length,
    inProgress: offers.filter((offer) => offer.status === 'in_progress').length,
    completed: offers.filter((offer) => offer.status === 'completed').length,
  }), [offers]);

  const roleLabel = user?.role === 'parlor' ? '雀荘' : user?.role === 'pro' ? '麻雀プロ' : '管理者';

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>マッチングダッシュボード</h1>
      </div>

      <div className="card">
        <p><strong>ログイン種別:</strong> {roleLabel}</p>
        <p>雀荘はPC中心、麻雀プロはスマホ中心で使いやすい画面に最適化しています。</p>
      </div>

      <div className="grid grid-3">
        <div className="card metric-card">
          <h3>承認待ち</h3>
          <p className="metric-value">{summary.pending}</p>
        </div>
        <div className="card metric-card">
          <h3>やり取り中</h3>
          <p className="metric-value">{summary.inProgress}</p>
        </div>
        <div className="card metric-card">
          <h3>完了</h3>
          <p className="metric-value">{summary.completed}</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>相手を探す</h3>
          <p>条件に合う相手を検索し、そのままオファーを送信できます。</p>
          <Link className="btn btn-primary dashboard-link" to="/directory">検索ページへ</Link>
        </div>
        <div className="card">
          <h3>やり取りを管理</h3>
          <p>ステータスごとにオファー一覧を管理し、成立後はメッセージを送れます。</p>
          <Link className="btn btn-secondary dashboard-link" to="/offers">オファー管理へ</Link>
        </div>
      </div>
    </div>
  );
}

export default MatchingDashboard;
