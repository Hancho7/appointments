export const ROLES = {
  ADMIN: 'admin',
  FRONTDESK: 'frontdesk',
  EMPLOYEE: 'employee',
  PENDING: 'pending',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
};

export const NOTIFICATION_TYPES = {
  APPOINTMENT: 'appointment',
  MEMBER_REQUEST: 'member_request',
  SYSTEM: 'system',
  REMINDER: 'reminder',
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ORGANIZATIONS: '/organizations',
  MEMBERS: '/members',
  APPOINTMENTS: '/appointments',
  NOTIFICATIONS: '/notifications',
};