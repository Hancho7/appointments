// src/api/appointmentService.js
import apiClient from "./config";

class AppointmentService {
  async createAppointment(appointmentData) {
    try {
      const response = await apiClient.post("/appointments", appointmentData);
      return response.data;
    } catch (error) {
      console.error("Create appointment error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create appointment"
      );
    }
  }

  async getAppointments() {
    try {
      const response = await apiClient.get("/appointments");
      return response.data;
    } catch (error) {
      console.error("Get appointments error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    }
  }

  // NEW: Method for filtered appointments (what the dashboard is calling)
  async getAppointmentsWithFilters(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Add filters as query parameters
      if (filters.employeeId) {
        params.append('employeeId', filters.employeeId);
      }
      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.startDate) {
        params.append('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params.append('endDate', filters.endDate);
      }

      const queryString = params.toString();
      const url = queryString ? `/appointments?${queryString}` : '/appointments';
      
      const response = await apiClient.get(url);
      
      // Handle nested response structure
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Get filtered appointments error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    }
  }

  // NEW: Method for getting appointment requests for employees
  async getMyAppointmentRequests() {
    try {
      const response = await apiClient.get("/appointments/requests");
      
      // Handle nested response structure
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Get appointment requests error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch appointment requests"
      );
    }
  }

  async getAppointmentById(id) {
    try {
      const response = await apiClient.get(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Get appointment by ID error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch appointment"
      );
    }
  }

  async updateAppointment(id, updateData) {
    try {
      const response = await apiClient.put(`/appointments/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Update appointment error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update appointment"
      );
    }
  }

  async respondToAppointment(id, action, responseData = {}) {
    try {
      const response = await apiClient.put(`/appointments/${id}/respond`, {
        action, // 'accept', 'reject', 'reschedule'
        ...responseData
      });
      return response.data;
    } catch (error) {
      console.error("Respond to appointment error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to respond to appointment"
      );
    }
  }

  async deleteAppointment(id) {
    try {
      const response = await apiClient.delete(`/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete appointment error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete appointment"
      );
    }
  }

  // NEW: Get today's appointments
  async getTodayAppointments() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await apiClient.get(`/appointments?date=${today}`);
      
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Get today's appointments error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch today's appointments"
      );
    }
  }

  // NEW: Get appointments by status
  async getAppointmentsByStatus(status) {
    try {
      const response = await apiClient.get(`/appointments?status=${status}`);
      
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Get appointments by status error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch appointments by status"
      );
    }
  }

  // NEW: Get pending appointments (for dashboard stats)
  async getPendingAppointments() {
    try {
      const response = await apiClient.get("/appointments?status=pending");
      
      return response.data.data || response.data || [];
    } catch (error) {
      console.error("Get pending appointments error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch pending appointments"
      );
    }
  }
}

export const appointmentService = new AppointmentService();