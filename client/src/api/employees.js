import api from './client';

export const listEmployees = (params, config = {}) =>
  api.get('/employees', { params, ...config }).then((r) => r.data);

export const createEmployee = (payload) =>
  api.post('/employees', payload).then((r) => r.data);

export const updateEmployee = (id, payload) =>
  api.put(`/employees/${id}`, payload).then((r) => r.data);

export const deleteEmployee = (id) =>
  api.delete(`/employees/${id}`).then((r) => r.data);

export const fetchAnalytics = (config = {}) =>
  api.get('/employees/analytics/summary', config).then((r) => r.data);

export const fetchMeta = () => api.get('/meta').then((r) => r.data);
