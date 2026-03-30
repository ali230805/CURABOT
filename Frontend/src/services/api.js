import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Symptom API
export const fetchSymptoms = async (category = '', search = '') => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (search) params.append('search', search);
  const res = await API.get(`/symptoms?${params}`);
  return res.data;
};

export const fetchSymptomById = async (id) => {
  const res = await API.get(`/symptoms/${id}`);
  return res.data;
};

// Prediction API
export const createPrediction = async (data) => {
  const res = await API.post('/predictions', data);
  return res.data;
};

export const fetchUserPredictions = async (page = 1, limit = 10) => {
  const res = await API.get(`/predictions?page=${page}&limit=${limit}`);
  return res.data;
};

export const fetchPredictionById = async (id) => {
  const res = await API.get(`/predictions/${id}`);
  return res.data;
};

export const submitFeedback = async (id, feedback) => {
  const res = await API.post(`/predictions/${id}/feedback`, feedback);
  return res.data;
};

// Admin API
export const getAnalytics = async () => {
  const res = await API.get('/admin/analytics');
  return res.data;
};

export const createSymptom = async (symptomData) => {
  const res = await API.post('/admin/symptoms', symptomData);
  return res.data;
};

export const updateSymptom = async (id, symptomData) => {
  const res = await API.put(`/admin/symptoms/${id}`, symptomData);
  return res.data;
};

export const deleteSymptom = async (id) => {
  const res = await API.delete(`/admin/symptoms/${id}`);
  return res.data;
};

export const createCondition = async (conditionData) => {
  const res = await API.post('/admin/conditions', conditionData);
  return res.data;
};

export const updateCondition = async (id, conditionData) => {
  const res = await API.put(`/admin/conditions/${id}`, conditionData);
  return res.data;
};

export default API;