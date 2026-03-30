import React, { useState, useEffect } from 'react';
import { fetchUserPredictions } from '../../services/api';
import { format } from 'date-fns';
import { FaHistory, FaCalendar, FaStethoscope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const History = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadPredictions();
  }, [page]);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      const data = await fetchUserPredictions(page);
      setPredictions(data.data);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Failed to load predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/prediction/${id}`);
  };

  if (loading) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <FaHistory className="header-icon" />
        <h2>Your Assessment History</h2>
      </div>

      {predictions.length === 0 ? (
        <div className="empty-history">
          <FaStethoscope className="empty-icon" />
          <h3>No assessments yet</h3>
          <p>Start a new health assessment to see your history here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/chat')}>
            Start Assessment
          </button>
        </div>
      ) : (
        <>
          <div className="predictions-grid">
            {predictions.map((prediction) => (
              <div key={prediction._id} className="history-card">
                <div className="card-header">
                  <div className="date">
                    <FaCalendar />
                    <span>{format(new Date(prediction.createdAt), 'PPP')}</span>
                  </div>
                  <div className="symptom-count">
                    {prediction.reportedSymptoms.length} symptoms
                  </div>
                </div>
                
                <div className="symptoms-preview">
                  {prediction.reportedSymptoms.slice(0, 3).map((s, idx) => (
                    <span key={idx} className="symptom-badge">
                      {s.symptomName}
                    </span>
                  ))}
                  {prediction.reportedSymptoms.length > 3 && (
                    <span className="more-badge">
                      +{prediction.reportedSymptoms.length - 3}
                    </span>
                  )}
                </div>
                
                <div className="top-prediction">
                  <strong>Top condition:</strong>{' '}
                  {prediction.results[0]?.conditionName}
                  <span className="confidence">
                    {prediction.results[0]?.confidenceScore}%
                  </span>
                </div>
                
                <button
                  className="btn-view"
                  onClick={() => handleViewDetails(prediction._id)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span>Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default History;