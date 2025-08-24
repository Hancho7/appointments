import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert } from 'react-native';

// Base API configuration - IMPORTANT: Use your actual IP address
export const API_BASE_URL = __DEV__ 
  ? 'https://sweet-swift-refined.ngrok-free.app/api/v1'  // Use the same IP as your original AuthService
  : 'https://your-production-api.com/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Token management - Updated to match your AuthService
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken'); // Match your AuthService key
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const setAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('authToken', token); // Match your AuthService key
  } catch (error) {
    console.error('Error setting auth token:', error);
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken'); // Match your AuthService key
  } catch (error) {
    console.error('Error removing auth token:', error);
  }
};

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request for debugging
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token
    });
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data
    });
    
    const { status, data } = error.response || {};
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401) {
      await removeAuthToken();
      Alert.alert('Session Expired', 'Please login again.');
    }
    
    // Handle other errors
    const errorMessage = data?.message || error.message || 'An error occurred';
    
    if (status >= 500) {
      Alert.alert('Server Error', 'Please try again later.');
    } else if (status === 403) {
      Alert.alert('Access Denied', 'You do not have permission to perform this action.');
    } else if (status === 404) {
      console.log('Resource not found:', errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;