import React, { useState, useEffect } from 'react';
import { fetchSymptoms, createSymptom, updateSymptom, deleteSymptom } from '../../services/api';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './admin.css';

const SymptomManager = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSymptom, setEditingSymptom] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
    severityLevel: 'Mild',
    icd10Code: '',
  });

  useEffect(() => {
    loadSymptoms();
  }, []);

  const loadSymptoms = async () => {
    setLoading(true);
    try {
      const data = await fetchSymptoms();
      setSymptoms(data.data);
    } catch (error) {
      console.error('Failed to load symptoms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSymptom) {
        await updateSymptom(editingSymptom._id, formData);
      } else {
        await createSymptom(formData);
      }
      setShowModal(false);
      setEditingSymptom(null);
      setFormData({
        name: '',
        description: '',
        category: 'General',
        severityLevel: 'Mild',
        icd10Code: '',
      });
      loadSymptoms();
    } catch (error) {
      console.error('Failed to save symptom:', error);
    }
  };

  const handleEdit = (symptom) => {
    setEditingSymptom(symptom);
    setFormData({
      name: symptom.name,
      description: symptom.description,
      category: symptom.category,
      severityLevel: symptom.severityLevel,
      icd10Code: symptom.icd10Code || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this symptom?')) {
      try {
        await deleteSymptom(id);
        loadSymptoms();
      } catch (error) {
        console.error('Failed to delete symptom:', error);
      }
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Symptom Management</h2>
        <button className="btn btn-primary" onClick={() => { setEditingSymptom(null); setShowModal(true); }}>
          <FaPlus /> Add Symptom
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Severity</th>
            <th>ICD-10</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {symptoms.map((symptom) => (
            <tr key={symptom._id}>
              <td>{symptom.name}</td>
              <td>{symptom.description.substring(0, 50)}...</td>
              <td>{symptom.category}</td>
              <td>{symptom.severityLevel}</td>
              <td>{symptom.icd10Code || '-'}</td>
              <td className="actions">
                <button className="btn-icon edit" onClick={() => handleEdit(symptom)}>
                  <FaEdit />
                </button>
                <button className="btn-icon delete" onClick={() => handleDelete(symptom._id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingSymptom ? 'Edit Symptom' : 'Add New Symptom'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="General">General</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Gastrointestinal">Gastrointestinal</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                    <option value="Neurological">Neurological</option>
                    <option value="Musculoskeletal">Musculoskeletal</option>
                    <option value="Skin">Skin</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Severity Level</label>
                  <select name="severityLevel" value={formData.severityLevel} onChange={handleInputChange}>
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>ICD-10 Code</label>
                <input
                  type="text"
                  name="icd10Code"
                  value={formData.icd10Code}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  {editingSymptom ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomManager;