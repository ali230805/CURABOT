import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaHistory,
  FaLock,
  FaNotesMedical,
  FaShieldAlt,
} from 'react-icons/fa';
import './auth.css';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await login(data.email, data.password, { rememberMe });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-showcase">
          <span className="auth-eyebrow">Medical Assistant Access</span>
          <h1>Stay connected to your health guidance dashboard.</h1>
          <p>
            Log in to review past conversations, continue assessments, and keep your CURABOT
            workspace available whenever you need it.
          </p>

          <div className="auth-showcase-grid">
            <article className="auth-highlight-card">
              <span className="auth-highlight-icon">
                <FaNotesMedical />
              </span>
              <div>
                <h3>Guided Assessments</h3>
                <p>Ask about symptoms and get structured next-step guidance in a calmer flow.</p>
              </div>
            </article>

            <article className="auth-highlight-card">
              <span className="auth-highlight-icon">
                <FaHistory />
              </span>
              <div>
                <h3>Conversation History</h3>
                <p>Return to previous chats without losing context every time you sign back in.</p>
              </div>
            </article>
          </div>

          <div className="auth-mini-preview">
            <p className="auth-mini-preview__header">After login you can</p>
            <div className="auth-mini-preview__pill-row">
              <span className="auth-mini-preview__pill">Start New Assessment</span>
              <span className="auth-mini-preview__pill">Review History</span>
              <span className="auth-mini-preview__pill">Track Guidance</span>
            </div>

            <div className="auth-feature-list">
              <div className="auth-feature-list__item">
                <FaShieldAlt />
                <span>Use "Keep me signed in" for persistent access on trusted devices.</span>
              </div>
              <div className="auth-feature-list__item">
                <FaNotesMedical />
                <span>Continue with the clean light-blue CURABOT interface from the PDF flow.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card__header">
            <span className="auth-badge">Welcome Back</span>
            <h2>Login to Your Account</h2>
            <p className="auth-subtitle">Continue to your CURABOT health assistant workspace.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register('email')}
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && <span className="error-message">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password')}
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password.message}</span>}
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                Keep me signed in
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account? <Link to="/register">Sign up</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
