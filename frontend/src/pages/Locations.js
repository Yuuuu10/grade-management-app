import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Locations.css';

function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await api.put(`/locations/${editingLocation.id}`, formData);
      } else {
        await api.post('/locations', formData);
      }
      fetchLocations();
      resetForm();
    } catch (error) {
      console.error('Error saving location:', error);
      alert('場所の保存に失敗しました');
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address || '',
      notes: location.notes || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('この場所を削除してもよろしいですか?')) {
      return;
    }
    try {
      await api.delete(`/locations/${id}`);
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('場所の削除に失敗しました');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      notes: '',
    });
    setEditingLocation(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>場所登録</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'キャンセル' : '新規場所追加'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>{editingLocation ? '場所編集' : '新規場所'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">場所名 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="例: 雀荘〇〇、自宅"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">住所</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="東京都渋谷区..."
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">メモ</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="4"
                placeholder="アクセス方法、特徴など"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingLocation ? '更新' : '作成'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                キャンセル
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>登録済み場所</h2>
        {locations.length === 0 ? (
          <div className="empty-state">
            <p>場所が登録されていません</p>
          </div>
        ) : (
          <div className="locations-grid">
            {locations.map((location) => (
              <div key={location.id} className="location-card">
                <div className="location-header">
                  <h3>{location.name}</h3>
                  <div className="location-actions">
                    <button
                      className="btn btn-secondary btn-small"
                      onClick={() => handleEdit(location)}
                    >
                      編集
                    </button>
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDelete(location.id)}
                    >
                      削除
                    </button>
                  </div>
                </div>
                {location.address && (
                  <div className="location-detail">
                    <strong>📍 住所:</strong>
                    <p>{location.address}</p>
                  </div>
                )}
                {location.notes && (
                  <div className="location-detail">
                    <strong>📝 メモ:</strong>
                    <p>{location.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Locations;
