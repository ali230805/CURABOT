import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FaEnvelope, FaLock, FaUser, FaVenusMars, FaBirthdayCake } from 'react-icons/fa';
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

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
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
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Sign up for your CURABOT account</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="name"
                placeholder="Enter your full name"
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
                placeholder="Enter your email"
                {...register('email')}
                className={errors.email ? 'error' : ''}
              />
            </div>
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <div className="input-group">
              <FaBirthdayCake className="input-icon" />
              <input
                type="number"
                id="age"
                placeholder="Enter your age"
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
            {errors.biologicalSex && <span className="error-message">{errors.biologicalSex.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="password"
                placeholder="Create a password"
                {...register('password')}
                className={errors.password ? 'error' : ''}
              />
            </div>
            {errors.password && <span className="error-message">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'error' : ''}
              />
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
