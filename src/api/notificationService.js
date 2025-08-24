import * as Notifications from 'expo-notifications';
import apiClient from './config';

export const notificationService = {
  // Get all notifications for current user
  getNotifications: async (page = 1, limit = 20) => {
    try {
      const response = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get notifications');
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await apiClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await apiClient.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },

  // Get notification settings
  getNotificationSettings: async () => {
    try {
      const response = await apiClient.get('/notifications/settings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get notification settings');
    }
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    try {
      const response = await apiClient.put('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update notification settings');
    }
  },

  // Register device for push notifications
  registerPushToken: async (pushToken) => {
    try {
      const response = await apiClient.post('/notifications/register-device', {
        pushToken,
        platform: 'expo',
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register push token');
    }
  },

  // Unregister device for push notifications
  unregisterPushToken: async () => {
    try {
      const response = await apiClient.delete('/notifications/unregister-device');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unregister push token');
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get unread count');
    }
  },

  // Setup push notifications for the device
  setupPushNotifications: async () => {
    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Push notification permissions not granted');
      }

      // Get push token
      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      const pushToken = pushTokenData.data;

      // Register with backend
      await notificationService.registerPushToken(pushToken);

      return pushToken;
    } catch (error) {
      console.error('Failed to setup push notifications:', error);
      throw error;
    }
  },
};