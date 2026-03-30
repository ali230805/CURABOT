import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaComments, FaHistory, FaUserMd } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="history-container">
      <div className="history-header">
        <FaUserMd className="header-icon" />
        <div>
          <h2>{`Welcome${user?.name ? `, ${user.name}` : ''}`}</h2>
          <p style={{ margin: 0, color: '#666' }}>
            Start a new assessment or review your previous health predictions.
          </p>
        </div>
      </div>

      <div className="predictions-grid">
        <div className="history-card">
          <div className="card-header">
            <span>New Assessment</span>
            <FaComments />
          </div>
          <div className="top-prediction">
            Chat with CURABOT about your symptoms and generate a new prediction.
          </div>
          <button className="btn-view" onClick={() => navigate('/chat')}>
            Open Chat
          </button>
        </div>

        <div className="history-card">
          <div className="card-header">
            <span>History</span>
            <FaHistory />
          </div>
          <div className="top-prediction">
            Review your saved assessments and revisit previous results.
          </div>
          <button className="btn-view" onClick={() => navigate('/history')}>
            View History
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
