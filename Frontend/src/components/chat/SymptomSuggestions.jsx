import React, { useState, useEffect } from 'react';
import { fetchSymptoms } from '../../services/api';
import './chat.css';

const SymptomSuggestions = ({ onSelect }) => {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadSymptoms();
  }, [category]);

  const loadSymptoms = async () => {
    setLoading(true);
    try {
      const data = await fetchSymptoms(category);
      setSymptoms(data.data);
    } catch (error) {
      console.error('Failed to load symptoms:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="symptom-suggestions">
      <div className="symptom-categories">
        <button 
          className={`category-btn ${category === '' ? 'active' : ''}`}
          onClick={() => setCategory('')}
        >
          All
        </button>
        <button 
          className={`category-btn ${category === 'Respiratory' ? 'active' : ''}`}
          onClick={() => setCategory('Respiratory')}
        >
          Respiratory
        </button>
        <button 
          className={`category-btn ${category === 'Gastrointestinal' ? 'active' : ''}`}
          onClick={() => setCategory('Gastrointestinal')}
        >
          Stomach
        </button>
        <button 
          className={`category-btn ${category === 'Neurological' ? 'active' : ''}`}
          onClick={() => setCategory('Neurological')}
        >
          Head & Brain
        </button>
      </div>
      <div className="symptom-list">
        {symptoms.slice(0, 10).map((symptom) => (
          <button
            key={symptom._id}
            className="symptom-chip"
            onClick={() => onSelect(symptom)}
          >
            {symptom.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SymptomSuggestions;