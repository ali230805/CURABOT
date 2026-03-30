import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import './Dashboard.css';

const PredictionResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prediction } = location.state || {};

  if (!prediction) {
    return (
      <div className="container">
        <div className="error-message">
          <FaExclamationTriangle />
          <h3>No prediction data found</h3>
          <button className="btn btn-primary" onClick={() => navigate('/chat')}>
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="prediction-container">
      <div className="prediction-header">
        <h2>Assessment Results</h2>
        <div className="disclaimer">
          <FaExclamationTriangle />
          <span>This is not a medical diagnosis. Please consult a healthcare professional for advice.</span>
        </div>
      </div>

      <div className="reported-symptoms">
        <h3>Reported Symptoms</h3>
        <div className="symptom-tags">
          {prediction.reportedSymptoms?.map((symptom, idx) => (
            <div key={idx} className="symptom-tag">
              <span className="symptom-name">{symptom.symptomName}</span>
              {symptom.severity && (
                <span className="symptom-severity">Severity: {symptom.severity}/10</span>
              )}
              {symptom.duration && (
                <span className="symptom-duration">Duration: {symptom.duration}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="predictions-list">
        <h3>Possible Conditions</h3>
        {prediction.results?.map((result, idx) => (
          <div key={idx} className="prediction-card">
            <div className="prediction-header">
              <h4>{result.conditionName}</h4>
              <div className="confidence-badge" style={{
                background: result.confidenceScore > 70 ? '#4caf50' : 
                           result.confidenceScore > 40 ? '#ff9800' : '#f44336'
              }}>
                {result.confidenceScore}% confidence
              </div>
            </div>
            
            <p className="condition-description">{result.description}</p>
            
            <div className="condition-details">
              <div className="detail-section">
                <h5>Recommended Actions:</h5>
                <ul>
                  {result.recommendedActions?.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              </div>
              
              {result.homeRemedies?.length > 0 && (
                <div className="detail-section">
                  <h5>Home Remedies:</h5>
                  <ul>
                    {result.homeRemedies.map((remedy, i) => (
                      <li key={i}>{remedy}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="severity-indicator">
                <strong>Severity Level:</strong> 
                <span className={`severity-${result.severity?.toLowerCase()}`}>
                  {result.severity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button className="btn btn-primary" onClick={() => navigate('/chat')}>
          Start New Assessment
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/history')}>
          View History
        </button>
      </div>
    </div>
  );
};

export default PredictionResult;