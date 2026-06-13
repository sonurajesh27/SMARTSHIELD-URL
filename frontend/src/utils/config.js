const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const rawBaseUrl = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';

export const API_URL = rawApiUrl.replace(/\/$/, '');
export const BASE_URL = rawBaseUrl.replace(/\/$/, '');
