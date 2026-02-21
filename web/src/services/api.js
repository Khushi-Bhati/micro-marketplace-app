import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
});

// Product cache for instant loading
let productCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Products with caching
export const getProducts = async (params) => {
    // Use cache for default parameters (page 1, no search/filter)
    const isDefaultQuery = !params || (!params.search && !params.category && params.page === 1);
    const now = Date.now();
    
    if (isDefaultQuery && productCache && (now - cacheTimestamp < CACHE_DURATION)) {
        return productCache;
    }
    
    const res = await api.get('/products', { params: params || { page: 1, limit: 9 } });
    
    if (isDefaultQuery) {
        productCache = res;
        cacheTimestamp = now;
    }
    
    return res;
};

export const prefetchProducts = () => {
    // Prefetch products on app load
    return getProducts({ page: 1, limit: 9 }).catch(err => {
        console.error('Prefetch failed:', err);
        return null;
    });
};

export const clearProductCache = () => {
    productCache = null;
    cacheTimestamp = 0;
};

export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => {
    clearProductCache();
    return api.post('/products', data);
};
export const updateProduct = (id, data) => {
    clearProductCache();
    return api.put(`/products/${id}`, data);
};
export const deleteProduct = (id) => {
    clearProductCache();
    return api.delete(`/products/${id}`);
};

// Favorites
export const getFavorites = (params) => api.get('/favorites', { params });
export const addFavorite = (productId) => {
    clearProductCache();
    return api.post(`/favorites/${productId}`);
};
export const removeFavorite = (productId) => {
    clearProductCache();
    return api.delete(`/favorites/${productId}`);
};

export default api;
