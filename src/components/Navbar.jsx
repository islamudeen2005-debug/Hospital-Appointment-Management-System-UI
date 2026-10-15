import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logout();
      navigate('/');
    } catch (error) {
      setLogoutError(
        error.response?.data?.message ||
          'You are logged out on this device, but the server could not revoke this token.'
      );
    }
  };

  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Doctors', to: '/doctors' },
  ];

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">+</span>
          CareConnect
        </Link>

        <nav className="nav-links">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active-link' : '')}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          {logoutError && <span className="alert error" role="alert">{logoutError}</span>}
          {!user ? (
            <>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          ) : (
            <>
              {user.role === 'patient' && (
                <>
                  <Link to="/my-appointments" className="btn btn-secondary">Appointments</Link>
                  <Link to="/profile" className="btn btn-secondary">Profile</Link>
                </>
              )}
              {user.role === 'doctor' && (
                <Link to="/doctor-dashboard" className="btn btn-secondary">Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin-dashboard" className="btn btn-secondary">Dashboard</Link>
              )}
              <button type="button" className="btn btn-primary" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
