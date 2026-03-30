import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaEnvelope } from 'react-icons/fa';
import './auth.css';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = () => {
    // Placeholder until forgot-password mail flow is implemented.
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to request a password reset link</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                {...register('email')}
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Send Reset Link
          </button>
        </form>

        <p className="auth-footer">
          Remembered your password? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
