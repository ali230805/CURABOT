import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FaBirthdayCake,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaNotesMedical,
  FaShieldAlt,
  FaUser,
  FaVenusMars,
} from 'react-icons/fa';
import './auth.css';

const schema = yup.object({
  name: yup.string().trim().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  age: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? undefined : value))
    .nullable()
    .optional()
    .min(0, 'Age cannot be negative')
    .max(150, 'Age must be 150 or below'),
  biologicalSex: yup
    .string()
    .oneOf(['', 'Male', 'Female', 'Other', 'Prefer not to say'], 'Invalid biological sex value')
    .optional(),
});

const getPasswordStrength = (password = '') => {
  if (!password) {
    return { label: 'Add a password', progress: 0, tone: 'neutral' };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) {
    return { label: 'Needs work', progress: 35, tone: 'weak' };
  }

  if (score === 3) {
    return { label: 'Good', progress: 68, tone: 'medium' };
  }

  return { label: 'Strong', progress: 100, tone: 'strong' };
};

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
      biologicalSex: '',
    },
  });

  const passwordStrength = getPasswordStrength(watch('password'));

  const onSubmit = async (data) => {
    setLoading(true);

    const payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      ...(data.age !== '' && data.age !== undefined ? { age: Number(data.age) } : {}),
      ...(data.biologicalSex ? { biologicalSex: data.biologicalSex } : {}),
    };

    const result = await registerUser(payload);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <section className="auth-showcase">
          <span className="auth-eyebrow">Create Your Workspace</span>
          <h1>Set up your CURABOT account in a cleaner, calmer interface.</h1>
          <p>
            Join a health-focused workspace built for guided assessments, conversation history,
            and a simple assistant flow inspired by the project reference screens.
          </p>

          <div className="auth-showcase-grid">
            <article className="auth-highlight-card">
              <span className="auth-highlight-icon">
                <FaShieldAlt />
              </span>
              <div>
                <h3>Profile-Based Guidance</h3>
                <p>Add optional age and biological sex details for a more tailored starting profile.</p>
              </div>
            </article>

            <article className="auth-highlight-card">
              <span className="auth-highlight-icon">
                <FaNotesMedical />
              </span>
              <div>
                <h3>Assessment Ready</h3>
                <p>Move from sign-up into the dashboard and start a symptom review right away.</p>
              </div>
            </article>
          </div>

          <div className="auth-mini-preview">
            <p className="auth-mini-preview__header">CURABOT account benefits</p>
            <div className="auth-mini-preview__pill-row">
              <span className="auth-mini-preview__pill">Protected Access</span>
              <span className="auth-mini-preview__pill">Quick Symptom Flow</span>
              <span className="auth-mini-preview__pill">Saved Timeline</span>
            </div>

            <div className="auth-feature-list">
              <div className="auth-feature-list__item">
                <FaUser />
                <span>Minimal sign-up fields with clearer form spacing and inline validation.</span>
              </div>
              <div className="auth-feature-list__item">
                <FaShieldAlt />
                <span>A live password strength meter helps prevent weak credentials.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="auth-card">
          <div className="auth-card__header">
            <span className="auth-badge">New Account</span>
            <h2>Create Account</h2>
            <p className="auth-subtitle">Sign up for your CURABOT assistant and dashboard.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="auth-form-grid">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-group">
                  <FaUser className="input-icon" />
                  <input
                    type="text"
                    id="name"
                    placeholder="Enter your full name"
                    autoComplete="name"
                    {...register('name')}
                    className={errors.name ? 'error' : ''}
                  />
                </div>
                {errors.name && <span className="error-message">{errors.name.message}</span>}
              </div>

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
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <div className="input-group">
                  <FaBirthdayCake className="input-icon" />
                  <input
                    type="number"
                    id="age"
                    placeholder="Optional"
                    inputMode="numeric"
                    {...register('age')}
                    className={errors.age ? 'error' : ''}
                  />
                </div>
                {errors.age && <span className="error-message">{errors.age.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="biologicalSex">Biological Sex</label>
                <div className="input-group">
                  <FaVenusMars className="input-icon" />
                  <select
                    id="biologicalSex"
                    {...register('biologicalSex')}
                    className={errors.biologicalSex ? 'error' : ''}
                  >
                    <option value="">Select an option</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
                {errors.biologicalSex && (
                  <span className="error-message">{errors.biologicalSex.message}</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
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
              <div className="password-strength">
                <div className="password-strength__track">
                  <span
                    className={`password-strength__fill password-strength__fill--${passwordStrength.tone}`}
                    style={{ width: `${passwordStrength.progress}%` }}
                  />
                </div>
                <span className="password-strength__label">
                  Strength: {passwordStrength.label}
                </span>
              </div>
              {errors.password && <span className="error-message">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-group">
                <FaLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword.message}</span>
              )}
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Register;
