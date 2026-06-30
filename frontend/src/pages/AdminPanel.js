import React, { useEffect, useState } from 'react';
import api from '../services/api';
import './Matching.css';

function AdminPanel() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewRes, usersRes, offersRes] = await Promise.all([
          api.get('/admin/overview'),
          api.get('/admin/users'),
          api.get('/admin/offers'),
        ]);
        setOverview(overviewRes.data);
        setUsers(usersRes.data);
        setOffers(offersRes.data);
      } catch (e) {
        setError(e.response?.data?.message || '管理データの取得に失敗しました');
      }
    };

    load();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>管理画面</h1>
      </div>

      {error && <div className="card"><p>{error}</p></div>}

      {overview && (
        <>
          <div className="grid grid-3">
            <div className="card metric-card">
              <h3>会員総数</h3>
              <p className="metric-value">{overview.users.total}</p>
            </div>
            <div className="card metric-card">
              <h3>雀荘 / 麻雀プロ</h3>
              <p className="metric-value">{overview.users.parlor} / {overview.users.pro}</p>
            </div>
            <div className="card metric-card">
              <h3>オファー総数</h3>
              <p className="metric-value">{overview.offers.total}</p>
            </div>
          </div>

          <div className="card">
            <h3>オファーステータス内訳</h3>
            <p>承認待ち: {overview.offers.pending} / やり取り中: {overview.offers.in_progress} / 完了: {overview.offers.completed}</p>
          </div>
        </>
      )}

      <div className="card">
        <h3>会員一覧（最新100件）</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>名前</th>
                <th>ロール</th>
                <th>エリア</th>
                <th>送信数</th>
                <th>受信数</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.role}</td>
                  <td>{item.area || '-'}</td>
                  <td>{item.sent_offers_count}</td>
                  <td>{item.received_offers_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3>オファー一覧（最新200件）</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>送信者</th>
                <th>受信者</th>
                <th>状態</th>
                <th>メッセージ件数</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id}>
                  <td>{offer.id}</td>
                  <td>{offer.from_user?.name}</td>
                  <td>{offer.to_user?.name}</td>
                  <td>{offer.status}</td>
                  <td>{offer.messages_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
