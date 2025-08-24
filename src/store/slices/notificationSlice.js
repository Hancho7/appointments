import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    sms: true,
    email: true,
    inApp: true,
    pushNotifications: true,
    emailNotifications: true,
    appointmentReminders: true,
    appointmentUpdates: true,
    organizationUpdates: true,
    marketingEmails: false,
    reminderMinutesBefore: 30,
  },
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    removeNotification: (state, action) => {
      const notificationIndex = state.notifications.findIndex(
        notif => notif.id === action.payload
      );
      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex];
        if (!notification.read) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(notificationIndex, 1);
      }
    },
    markAsRead: (state, action) => {
      const notif = state.notifications.find(n => n.id === action.payload);
      if (notif && !notif.read) {
        notif.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach(notif => {
        notif.read = true;
      });
      state.unreadCount = 0;
    },
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  setUnreadCount,
  updateSettings,
  setLoading,
  setError,
} = notificationSlice.actions;

export default notificationSlice.reducer;