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

  // NEW: Create appointment request (from front desk)
  async createAppointmentRequest(appointmentData) {
    try {
      const response = await apiClient.post("/appointments/request", appointmentData);
      return response.data;
    } catch (error) {
      console.error("Create appointment request error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create appointment request"
      );
    }
  }

  async getAppointments(filters = {}) {
    return this.getAppointmentsWithFilters(filters);
  }

  // Method for filtered appointments
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
      if (filters.visitorName) {
        params.append('visitorName', filters.visitorName);
      }

      const queryString = params.toString();
      const url = queryString ? `/appointments?${queryString}` : '/appointments';
      
      const response = await apiClient.get(url);
      
      // Handle nested response structure
      return response.data;
    } catch (error) {
      console.error("Get filtered appointments error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch appointments"
      );
    }
  }

  // Method for getting appointment requests for employees
  async getMyAppointmentRequests() {
    try {
      const response = await apiClient.get("/appointments/requests");
      
      // Handle nested response structure
      return response.data;
    } catch (error) {
      console.error("Get appointment requests error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch appointment requests"
      );
    }
  }

  // NEW: Get incoming requests (alias for getMyAppointmentRequests)
  async getIncomingRequests() {
    try {
      const response = await apiClient.get("/appointments/incoming");
      return response.data;
    } catch (error) {
      console.error("Get incoming requests error:", error);
      // Fallback to the other endpoint if this doesn't exist
      return this.getMyAppointmentRequests();
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

  // NEW: Respond to appointment request (different endpoint)
  async respondToRequest(requestId, responseData) {
    try {
      const response = await apiClient.put(`/appointments/requests/${requestId}/respond`, responseData);
      return response.data;
    } catch (error) {
      console.error("Respond to request error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to respond to request"
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

  // NEW: Cancel appointment
  async cancelAppointment(appointmentId, cancelData) {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/cancel`, cancelData);
      return response.data;
    } catch (error) {
      console.error("Cancel appointment error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to cancel appointment"
      );
    }
  }

  // NEW: Reschedule appointment
  async rescheduleAppointment(appointmentId, rescheduleData) {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/reschedule`, rescheduleData);
      return response.data;
    } catch (error) {
      console.error("Reschedule appointment error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to reschedule appointment"
      );
    }
  }

  // NEW: Complete appointment
  async completeAppointment(appointmentId, completeData) {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}/complete`, completeData);
      return response.data;
    } catch (error) {
      console.error("Complete appointment error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to complete appointment"
      );
    }
  }

  // NEW: Search appointments
  async searchAppointments(query) {
    try {
      const response = await apiClient.get(`/appointments/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error("Search appointments error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to search appointments"
      );
    }
  }

  // Get today's appointments
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

  // Get appointments by status
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

  // Get pending appointments (for dashboard stats)
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

  // NEW: Get appointment statistics
  async getAppointmentStats(period = 'week') {
    try {
      const response = await apiClient.get(`/appointments/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error("Get appointment stats error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch appointment statistics"
      );
    }
  }
}

export const appointmentService = new AppointmentService();