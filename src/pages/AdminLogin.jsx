import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData);
      if (user.role !== 'admin') {
        await logout();
        throw new Error('This account is not authorized as an admin.');
      }
      navigate('/admin-dashboard');
    } catch (error) {
      setServerError(error.response?.data?.message || error.message || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Admin login</h2>
        <p>Restricted access for administrators only.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          </div>
          {serverError && <div className="alert error">{serverError}</div>}
          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Signing in...' : 'Login as admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
