import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';
import { requestPasswordReset } from '../../services/api';
import './auth.css';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      const response = await requestPasswordReset(data.email.trim().toLowerCase());
      setSubmittedEmail(data.email);
      reset({ email: '' });
      toast.success(response.message || 'Password reset request sent.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to request a password reset right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-showcase">
          <span className="auth-eyebrow">Account Recovery</span>
          <h1>Request a reset link without leaving the CURABOT flow.</h1>
          <p>
            This screen now connects to the backend password-reset route, so your recovery step is
            functional instead of a placeholder.
          </p>

          <div className="auth-showcase-grid">
            <article className="auth-highlight-card">
              <span className="auth-highlight-icon">
                <FaLock />
              </span>
              <div>
                <h3>Reset Request</h3>
                <p>Submit your email and CURABOT sends the password reset response through the API.</p>
              </div>
            </article>

            <article className="auth-highlight-card">
              <span className="auth-highlight-icon">
                <FaShieldAlt />
              </span>
              <div>
                <h3>Protected Access</h3>
                <p>Return to the same dashboard, history, and assessment experience after recovery.</p>
              </div>
            </article>
          </div>

          <div className="auth-mini-preview">
            <p className="auth-mini-preview__header">Recovery notes</p>
            <div className="auth-feature-list">
              <div className="auth-feature-list__item">
                <FaEnvelope />
                <span>Use the same email address you used while registering your CURABOT account.</span>
              </div>
              <div className="auth-feature-list__item">
                <FaLock />
                <span>The backend stores a time-limited reset token for the request.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card__header">
            <span className="auth-badge">Reset Access</span>
            <h2>Forgot Password</h2>
            <p className="auth-subtitle">
              Enter your email to request a password reset link for your CURABOT account.
            </p>
          </div>

          {submittedEmail ? (
            <div className="auth-status-card" role="status">
              <strong>Reset request sent</strong>
              <p>
                If an account exists for <span>{submittedEmail}</span>, you&apos;ll be able to continue
                the reset flow from there.
              </p>
            </div>
          ) : null}

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

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Sending reset request...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="auth-footer">
            Remembered your password? <Link to="/login">Back to login</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default ForgotPassword;
