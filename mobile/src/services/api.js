import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Your machine's local IP - works for both Android/iOS devices on same WiFi
// For Android emulator use: http://10.0.2.2:5000
const API_BASE = 'http://192.168.1.9:5000';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000,
});

api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // SecureStore not available
    }
    return config;
});

// Auth
export const loginApi = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);

// Products
export const getProducts = (params) => api.get('/products', { params });
export const getProduct = (id) => api.get(`/products/${id}`);

// Favorites
export const getFavorites = (params) => api.get('/favorites', { params });
export const addFavorite = (productId) => api.post(`/favorites/${productId}`);
export const removeFavorite = (productId) => api.delete(`/favorites/${productId}`);

export default api;
