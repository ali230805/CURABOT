import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaExclamationTriangle, FaHistory, FaNotesMedical, FaRedoAlt } from 'react-icons/fa';
import './Dashboard.css';

const PredictionResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { prediction } = location.state || {};

  if (!prediction) {
    return (
      <main className="prediction-page">
        <section className="prediction-shell prediction-shell--empty">
          <FaExclamationTriangle className="prediction-empty__icon" />
          <h1>No prediction data found</h1>
          <p>Start a new assessment so CURABOT can generate a result summary for you.</p>
          <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => navigate('/chat')}>
            Start New Assessment
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="prediction-page">
      <section className="prediction-shell">
        <div className="prediction-header">
          <div>
            <p className="prediction-eyebrow">CuraBot Health Assistant</p>
            <h1>Assessment Results</h1>
            <p className="prediction-subtitle">
              Review possible conditions, confidence levels, and recommended next actions.
            </p>
          </div>
          <button type="button" className="prediction-header__action" onClick={() => navigate('/chat')}>
            Start New Assessment
          </button>
        </div>

        <div className="prediction-disclaimer">
          <FaExclamationTriangle />
          <span>This is not a medical diagnosis. Please consult a healthcare professional for advice.</span>
        </div>

        {prediction.reportedSymptoms?.length ? (
          <section className="prediction-panel">
            <div className="prediction-panel__header">
              <FaNotesMedical />
              <h2>Reported Symptoms</h2>
            </div>
            <div className="prediction-symptom-list">
              {prediction.reportedSymptoms.map((symptom, index) => (
                <div key={`${symptom.symptomName}-${index}`} className="prediction-symptom-chip">
                  <strong>{symptom.symptomName}</strong>
                  {symptom.severity ? <span>Severity: {symptom.severity}/10</span> : null}
                  {symptom.duration ? <span>Duration: {symptom.duration}</span> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="prediction-panel">
          <div className="prediction-panel__header">
            <FaNotesMedical />
            <h2>Possible Conditions</h2>
          </div>

          <div className="prediction-results">
            {prediction.results?.length ? (
              prediction.results.map((result, index) => (
                <article key={`${result.conditionName}-${index}`} className="prediction-result-card">
                  <div className="prediction-result-card__top">
                    <div>
                      <h3>{result.conditionName}</h3>
                      <p>{result.description}</p>
                    </div>

                    <div className="prediction-score">
                      <span>{result.confidenceScore}% confidence</span>
                      <div className="prediction-score__track">
                        <div
                          className="prediction-score__fill"
                          style={{ width: `${Math.max(0, Math.min(result.confidenceScore || 0, 100))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="prediction-severity">
                    <span>Severity Level</span>
                    <strong>{result.severity || 'Not specified'}</strong>
                  </div>

                  <div className="prediction-columns">
                    <div className="prediction-column">
                      <h4>Recommended Actions</h4>
                      <ul>
                        {result.recommendedActions?.length ? (
                          result.recommendedActions.map((action, actionIndex) => (
                            <li key={`${result.conditionName}-action-${actionIndex}`}>{action}</li>
                          ))
                        ) : (
                          <li>No specific actions provided.</li>
                        )}
                      </ul>
                    </div>

                    <div className="prediction-column">
                      <h4>Home Remedies</h4>
                      <ul>
                        {result.homeRemedies?.length ? (
                          result.homeRemedies.map((remedy, remedyIndex) => (
                            <li key={`${result.conditionName}-remedy-${remedyIndex}`}>{remedy}</li>
                          ))
                        ) : (
                          <li>No home remedies listed.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="prediction-empty-state">No condition results were returned for this assessment.</div>
            )}
          </div>
        </section>

        <div className="prediction-actions">
          <button type="button" className="dashboard-button dashboard-button--primary" onClick={() => navigate('/chat')}>
            <FaRedoAlt />
            <span>Start New Assessment</span>
          </button>
          <button type="button" className="dashboard-button dashboard-button--secondary" onClick={() => navigate('/history')}>
            <FaHistory />
            <span>View History</span>
          </button>
        </div>
      </section>
    </main>
  );
};

export default PredictionResult;
