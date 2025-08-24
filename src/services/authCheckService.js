// src/services/authCheckService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../api/authService';

class AuthCheckService {
  async checkAuthStatus() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        return { isAuthenticated: false, user: null };
      }

      // Verify token is still valid by making an API call
      // You'll need to create a /auth/me endpoint in your backend
      const userData = await authService.getCurrentUser();
      
      return { 
        isAuthenticated: true, 
        user: userData,
        token: token
      };
    } catch (error) {
      console.log('Auth check failed:', error);
      // Token is invalid or expired, clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      return { isAuthenticated: false, user: null };
    }
  }
}

export const authCheckService = new AuthCheckService();