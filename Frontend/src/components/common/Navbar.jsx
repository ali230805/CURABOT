import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaHeartbeat } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const authenticatedLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/chat', label: 'Assessment' },
    { to: '/history', label: 'History' },
  ];

  return (
    <nav className="navbar" aria-label="Primary">
      <Link to={isAuthenticated ? '/dashboard' : '/login'} className="navbar__brand">
        <span className="navbar__logo">
          <FaHeartbeat />
        </span>
        <span className="navbar__brand-copy">
          <span className="navbar__brand-title">CuraBot</span>
          <span className="navbar__brand-subtitle">Smart Health Assistant</span>
        </span>
      </Link>

      <div className="navbar__links">
        {isAuthenticated ? (
          authenticatedLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `navbar__link${isActive ? ' navbar__link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `navbar__link${isActive ? ' navbar__link--active' : ''}`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `navbar__link${isActive ? ' navbar__link--active' : ''}`
              }
            >
              Sign Up
            </NavLink>
          </>
        )}
      </div>

      <div className="navbar__actions">
        {isAuthenticated ? (
          <>
            <div className="navbar__user">
              <span>Signed in as</span>
              <strong>{user?.name || 'User'}</strong>
            </div>
            <button type="button" onClick={logout} className="navbar__action navbar__action--ghost">
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__action navbar__action--ghost">
              Login
            </Link>
            <Link to="/register" className="navbar__action navbar__action--primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
