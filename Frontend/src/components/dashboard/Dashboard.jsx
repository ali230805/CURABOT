import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FaComments,
  FaHistory,
  FaNotesMedical,
  FaShieldAlt,
  FaUserMd,
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="dashboard-page">
      <section className="dashboard-hero">
        <span className="dashboard-eyebrow">Your AI-Powered Health Assistant</span>
        <h1>{`Welcome${user?.name ? `, ${user.name}` : ''}`}</h1>
        <p className="dashboard-subtitle">
          Start a new assessment, review your previous conversations, and keep your guidance flow in
          one calm medical-style interface.
        </p>

        <div className="dashboard-actions">
          <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => navigate('/chat')}>
            Start New Assessment
          </button>
          <button type="button" className="dashboard-button dashboard-button--secondary" onClick={() => navigate('/history')}>
            Review History
          </button>
        </div>
      </section>

      <section className="dashboard-benefits">
        <article className="dashboard-benefit">
          <span className="dashboard-benefit__icon">
            <FaNotesMedical />
          </span>
          <h2>Structured Guidance</h2>
          <p>Ask about symptoms and get responses in a focused, readable health assistant layout.</p>
        </article>

        <article className="dashboard-benefit">
          <span className="dashboard-benefit__icon">
            <FaShieldAlt />
          </span>
          <h2>Private Workspace</h2>
          <p>Your dashboard keeps login, chat, and history in one consistent account-driven flow.</p>
        </article>

        <article className="dashboard-benefit">
          <span className="dashboard-benefit__icon">
            <FaUserMd />
          </span>
          <h2>Ready When Needed</h2>
          <p>Return anytime to continue with symptom review, follow-up questions, or earlier guidance.</p>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <span className="dashboard-card__icon">
              <FaComments />
            </span>
            <div>
              <p className="dashboard-card__eyebrow">Assessment</p>
              <h2>Talk to CURABOT</h2>
            </div>
          </div>
          <p className="dashboard-card__copy">
            Share symptoms, use quick prompts, and receive AI-supported health guidance in the chat flow.
          </p>
          <button type="button" className="dashboard-card__button" onClick={() => navigate('/chat')}>
            Open Assessment
          </button>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card__header">
            <span className="dashboard-card__icon">
              <FaHistory />
            </span>
            <div>
              <p className="dashboard-card__eyebrow">Timeline</p>
              <h2>Review History</h2>
            </div>
          </div>
          <p className="dashboard-card__copy">
            Go back through previous conversations and revisit the answers CURABOT generated earlier.
          </p>
          <button type="button" className="dashboard-card__button" onClick={() => navigate('/history')}>
            View History
          </button>
        </article>
      </section>
    </main>
  );
};

export default Dashboard;
