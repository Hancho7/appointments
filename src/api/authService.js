// src/api/authService.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
// http://localhost:8080 https://sweet-swift-refined.ngrok-free.app
// Use the same base URL logic as your config
const API_BASE_URL = __DEV__ 
  ? 'https://sweet-swift-refined.ngrok-free.app/api/v1'  // Use your actual IP for device testing
  : 'https://your-production-api.com/api/v1';

// Create a separate axios instance for auth (without token interceptor)
const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

class AuthService {
  // Helper method to get auth token
  async getAuthToken() {
    try {
      return await AsyncStorage.getItem("authToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async register(userData) {
    try {
      const response = await authClient.post("/auth/register", userData);
      
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || "Registration failed");
    }
  }

  async login(email, password) {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      
      const response = await authClient.post("/auth/login", {
        email,
        password
      });

      console.log('Login response:', response.data);

      // The backend returns { success, message, data, statusCode, timestamp }
      if (response.data.success) {
        // Store token
        if (response.data.data.token) {
          await AsyncStorage.setItem("authToken", response.data.data.token);
          await AsyncStorage.setItem(
            "refreshToken",
            response.data.data.refreshToken || ""
          );
        }

        return response.data.data; // Return the data object containing user and tokens
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          method: error.config?.method
        }
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // Handle network errors specifically
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Cannot connect to server. Please check your internet connection and server status.');
      }
      
      throw new Error(error.message || "Login failed");
    }
  }

  async verifyEmail(token, email) {
    try {
      const response = await authClient.post("/auth/verify-email", {
        token,
        email
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Email verification failed");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || "Email verification failed");
    }
  }

  async resendVerification(email) {
    try {
      const response = await authClient.post("/auth/resend-verification", {
        email
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(
          response.data.message || "Failed to resend verification email"
        );
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || "Failed to resend verification email");
    }
  }

  async getCurrentUser() {
    try {
      const token = await this.getAuthToken();

      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await authClient.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Get current user response:", response.data);
      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to get user data");
      }
    } catch (error) {
      console.error("Get current user failed:", error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || "Failed to get user data");
    }
  }

  async createOrganization(formData) {
    try {
      const token = await this.getAuthToken();
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      };

      // Handle FormData vs JSON
      if (formData instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await authClient.post("/organizations", formData, config);

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to create organization");
      }
    } catch (error) {
      console.error("Create organization API error:", error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || "Failed to create organization");
    }
  }

  async joinOrganization(joinData) {
    try {
      const token = await this.getAuthToken();

      const response = await authClient.post("/organizations/join", joinData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.message || "Failed to join organization");
      }
    } catch (error) {
      console.error("Join organization API error:", error);
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || "Failed to join organization");
    }
  }

  async logout() {
    try {
      const token = await this.getAuthToken();
      
      // Call logout endpoint if token exists
      if (token) {
        try {
          await authClient.post('/auth/logout', {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          });
        } catch (error) {
          console.error("Logout API call failed:", error);
          // Continue with local cleanup even if API call fails
        }
      }
      
      // Clean up local storage
      await AsyncStorage.multiRemove(['authToken', 'refreshToken']);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }
}

export const authService = new AuthService();