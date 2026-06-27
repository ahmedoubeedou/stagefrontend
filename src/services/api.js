import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Get the API Base URL from the Expo public environment variables (falls back to local machine dev server)
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Create Axios client instance
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Automatically inject Sanctum token in Authorization header
API.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Automatically handle token expiration / unauthorized responses
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear corrupted or expired session data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// ==========================================
// Authentification
// ==========================================

export const login = async (email, password) => {
  return API.post('/login', { email, password });
};

export const register = async (userData) => {
  return API.post('/register', userData);
};

export const logout = async () => {
  return API.post('/logout');
};

export const getMe = async () => {
  return API.get('/user');
};

// ==========================================
// Car Listing & CRUD Operations
// ==========================================

export const getCars = async (filters = {}) => {
  // Map frontend filter keys to backend expected parameter keys
  const params = {};

  if (filters.search)       params.search = filters.search;
  if (filters.brand)        params.brand = filters.brand;
  if (filters.fuel)         params.fuel_type = filters.fuel;
  if (filters.transmission) params.transmission = filters.transmission;
  if (filters.minPrice)     params.min_price = filters.minPrice;
  if (filters.maxPrice)     params.max_price = filters.maxPrice;
  if (filters.minYear)      params.min_year = filters.minYear;
  if (filters.maxYear)      params.max_year = filters.maxYear;

  const response = await API.get('/cars', { params });

  // Extract flat data array from Laravel's pagination response
  if (response.data?.status === 'success' && response.data?.data?.data) {
    response.data.data = response.data.data.data;
  }

  return response;
};

export const getCarById = async (id) => {
  return API.get(`/cars/${id}`);
};

export const addCar = async (formData) => {
  return API.post('/cars', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateCar = async (id, formData) => {
  // POST request with X-HTTP-Method-Override header to perform a PUT request
  // This is required in PHP / Laravel when uploading files inside PUT requests
  return API.post(`/cars/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-HTTP-Method-Override': 'PUT',
    },
  });
};

export const getUserCars = async () => {
  return API.get('/user/cars');
};

export const deleteCar = async (id) => {
  return API.delete(`/cars/${id}`);
};

// ==========================================
// Favorites (Persistent in DB via API)
// ==========================================

export const getFavorites = async () => {
  return API.get('/user/favorites');
};

export const addFavorite = async (carId) => {
  return API.post(`/user/favorites/${carId}`);
};

export const removeFavorite = async (carId) => {
  return API.delete(`/user/favorites/${carId}`);
};

export const isFavorite = async (carId) => {
  try {
    const response = await API.get(`/user/favorites/${carId}`);
    if (response.data?.status === 'success') {
      return response.data.data === true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export default API;