import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../../services/api';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaUsers, FaStethoscope, FaVial, FaExclamationTriangle } from 'react-icons/fa';
import './admin.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loader">Loading dashboard...</div>;

  const dailyChartData = {
    labels: analytics.dailyPredictions.map(d => d._id),
    datasets: [
      {
        label: 'Daily Predictions',
        data: analytics.dailyPredictions.map(d => d.count),
        borderColor: 'rgb(102, 126, 234)',
        backgroundColor: 'rgba(102, 126, 234, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const symptomsChartData = {
    labels: analytics.commonSymptoms.map(s => s._id),
    datasets: [
      {
        label: 'Most Common Symptoms',
        data: analytics.commonSymptoms.map(s => s.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
      },
    ],
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{analytics.overview.totalUsers}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaStethoscope />
          </div>
          <div className="stat-content">
            <h3>Total Predictions</h3>
            <p className="stat-number">{analytics.overview.totalPredictions}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaVial />
          </div>
          <div className="stat-content">
            <h3>Symptoms</h3>
            <p className="stat-number">{analytics.overview.totalSymptoms}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <FaExclamationTriangle />
          </div>
          <div className="stat-content">
            <h3>Conditions</h3>
            <p className="stat-number">{analytics.overview.totalConditions}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h2>Daily Predictions (Last 7 Days)</h2>
          <Line data={dailyChartData} options={{ responsive: true }} />
        </div>
        
        <div className="chart-container">
          <h2>Most Common Symptoms</h2>
          <Bar data={symptomsChartData} options={{ responsive: true }} />
        </div>
      </div>

      <div className="top-conditions">
        <h2>Top Predicted Conditions</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Condition</th>
              <th>Predictions</th>
              <th>Avg. Confidence</th>
            </tr>
          </thead>
          <tbody>
            {analytics.topConditions.map((condition, idx) => (
              <tr key={idx}>
                <td>{condition._id}</td>
                <td>{condition.count}</td>
                <td>{condition.avgConfidence.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;