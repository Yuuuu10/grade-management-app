import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Rules.css';

function Rules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    starting_points: 25000,
    return_points: 30000,
    uma_1: 20,
    uma_2: 10,
    uma_3: -10,
    uma_4: -20,
    oka: 0,
    is_default: false,
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await api.get('/rules');
      setRules(response.data);
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await api.put(`/rules/${editingRule.id}`, formData);
      } else {
        await api.post('/rules', formData);
      }
      fetchRules();
      resetForm();
    } catch (error) {
      console.error('Error saving rule:', error);
      alert('ルールの保存に失敗しました');
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData(rule);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('このルールを削除してもよろしいですか?')) {
      return;
    }
    try {
      await api.delete(`/rules/${id}`);
      fetchRules();
    } catch (error) {
      console.error('Error deleting rule:', error);
      alert('ルールの削除に失敗しました');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      starting_points: 25000,
      return_points: 30000,
      uma_1: 20,
      uma_2: 10,
      uma_3: -10,
      uma_4: -20,
      oka: 0,
      is_default: false,
    });
    setEditingRule(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>ルール設定</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'キャンセル' : '新規ルール追加'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>{editingRule ? 'ルール編集' : '新規ルール'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">ルール名</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="例: 東風戦、半荘戦"
              />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label htmlFor="starting_points">開始点</label>
                <input
                  type="number"
                  id="starting_points"
                  name="starting_points"
                  value={formData.starting_points}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="return_points">返し点</label>
                <input
                  type="number"
                  id="return_points"
                  name="return_points"
                  value={formData.return_points}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-4">
              <div className="form-group">
                <label htmlFor="uma_1">1位ウマ</label>
                <input
                  type="number"
                  id="uma_1"
                  name="uma_1"
                  value={formData.uma_1}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="uma_2">2位ウマ</label>
                <input
                  type="number"
                  id="uma_2"
                  name="uma_2"
                  value={formData.uma_2}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="uma_3">3位ウマ</label>
                <input
                  type="number"
                  id="uma_3"
                  name="uma_3"
                  value={formData.uma_3}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="uma_4">4位ウマ</label>
                <input
                  type="number"
                  id="uma_4"
                  name="uma_4"
                  value={formData.uma_4}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="oka">オカ</label>
              <input
                type="number"
                id="oka"
                name="oka"
                value={formData.oka}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleInputChange}
                />
                デフォルトルールに設定
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingRule ? '更新' : '作成'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>登録済みルール</h2>
        {rules.length === 0 ? (
          <div className="empty-state">
            <p>ルールが登録されていません</p>
          </div>
        ) : (
          <div className="rules-list">
            {rules.map((rule) => (
              <div key={rule.id} className={`rule-item ${rule.is_default ? 'default' : ''}`}>
                <div className="rule-header">
                  <h3>
                    {rule.name}
                    {rule.is_default && <span className="badge">デフォルト</span>}
                  </h3>
                  <div className="rule-actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleEdit(rule)}
                    >
                      編集
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(rule.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
                <div className="rule-details">
                  <div className="rule-detail-item">
                    <span className="label">開始点:</span>
                    <span className="value">{rule.starting_points.toLocaleString()}</span>
                  </div>
                  <div className="rule-detail-item">
                    <span className="label">返し点:</span>
                    <span className="value">{rule.return_points.toLocaleString()}</span>
                  </div>
                  <div className="rule-detail-item">
                    <span className="label">ウマ:</span>
                    <span className="value">
                      {rule.uma_1} / {rule.uma_2} / {rule.uma_3} / {rule.uma_4}
                    </span>
                  </div>
                  <div className="rule-detail-item">
                    <span className="label">オカ:</span>
                    <span className="value">{rule.oka}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Rules;
