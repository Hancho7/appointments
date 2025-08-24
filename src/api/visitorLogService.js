// src/api/visitorLogService.js
import apiClient from "./config";

class VisitorLogService {
  // Record walk-in
  async recordWalkIn(walkInData) {
    try {
      const response = await apiClient.post("/visitor-logs/walk-in", walkInData);
      return response.data;
    } catch (error) {
      console.error("Record walk-in error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to record walk-in"
      );
    }
  }

  // Record walk-out
  async recordWalkOut(walkOutData) {
    try {
      const response = await apiClient.post("/visitor-logs/walk-out", walkOutData);
      return response.data;
    } catch (error) {
      console.error("Record walk-out error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to record walk-out"
      );
    }
  }

  // Get today's visitor logs
  async getTodayVisitorLogs() {
    try {
      const response = await apiClient.get("/visitor-logs/today");
      return response.data;
    } catch (error) {
      console.error("Get today's visitor logs error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch today's visitor logs"
      );
    }
  }

  // Get all visitor logs
  async getAllVisitorLogs() {
    try {
      const response = await apiClient.get("/visitor-logs");
      return response.data;
    } catch (error) {
      console.error("Get all visitor logs error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch visitor logs"
      );
    }
  }

  // Get visitor logs by confirmation code
  async getVisitorLogsByConfirmationCode(confirmationCode) {
    try {
      const response = await apiClient.get(`/visitor-logs/confirmation/${confirmationCode}`);
      return response.data;
    } catch (error) {
      console.error("Get visitor logs by confirmation code error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch visitor logs"
      );
    }
  }

  // Get visitor log by ID
  async getVisitorLogById(logId) {
    try {
      const response = await apiClient.get(`/visitor-logs/${logId}`);
      return response.data;
    } catch (error) {
      console.error("Get visitor log by ID error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch visitor log"
      );
    }
  }

  // Check visitor status (is inside or not)
  async checkVisitorStatus(confirmationCode) {
    try {
      const response = await apiClient.get(`/visitor-logs/status/${confirmationCode}`);
      return response.data;
    } catch (error) {
      console.error("Check visitor status error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to check visitor status"
      );
    }
  }
}

export const visitorLogService = new VisitorLogService();