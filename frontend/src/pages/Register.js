import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('parlor');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [profile, setProfile] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    setLoading(true);

    const result = await register({
      name,
      email,
      role,
      phone,
      area,
      profile,
      password,
      password_confirmation: passwordConfirmation,
    });
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">🀄 麻雀マッチング</h1>
        <h2 className="auth-subtitle">新規登録</h2>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">名前</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="山田太郎"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">利用タイプ</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="parlor">雀荘</option>
              <option value="pro">麻雀プロ</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="phone">連絡先（任意）</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="090-xxxx-xxxx"
            />
          </div>

          <div className="form-group">
            <label htmlFor="area">活動エリア（任意）</label>
            <input
              type="text"
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="東京都 / 大阪市 など"
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile">プロフィール（任意）</label>
            <textarea
              id="profile"
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              rows={3}
              placeholder="自己紹介、希望条件など"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="8文字以上"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password_confirmation">パスワード（確認）</label>
            <input
              type="password"
              id="password_confirmation"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              placeholder="パスワードを再入力"
            />
          </div>

          {error && <div className="error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? '登録中...' : '登録'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            すでにアカウントをお持ちの方は
            <Link to="/login" className="auth-link"> こちら</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
