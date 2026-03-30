import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div
      style={{
        padding: '10px 16px',
        background: '#222',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Link to={isAuthenticated ? '/dashboard' : '/login'} style={{ color: '#fff', textDecoration: 'none' }}>
        <h2 style={{ margin: 0 }}>CuraBot</h2>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAuthenticated ? (
          <>
            <span style={{ fontSize: '0.95rem' }}>
              {user?.name ? `Hi, ${user.name}` : 'Signed in'}
            </span>
            <button
              type="button"
              onClick={logout}
              style={{
                border: '1px solid #fff',
                background: 'transparent',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
