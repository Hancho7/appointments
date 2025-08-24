// src/api/organizationService.js
import apiClient from "./config";

class OrganizationService {
  async getCurrentOrganization() {
    try {
      const response = await apiClient.get("/organizations/current");
      return response.data;
    } catch (error) {
      console.error("Get organization error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch organization"
      );
    }
  }

  async getOrganizationByCode(code) {
    try {
      const response = await apiClient.get(`/organizations/code/${code}`);
      return response.data;
    } catch (error) {
      console.error("Get organization by code error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch organization"
      );
    }
  }

  async getOrganizationMembers() {
    try {
      const response = await apiClient.get("/organizations/members");
      return response.data;
    } catch (error) {
      console.error("Get members error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch members"
      );
    }
  }

  async getPendingJoinRequests() {
    try {
      const response = await apiClient.get("/organizations/pending-requests");
      return response.data;
    } catch (error) {
      console.error("Get pending requests error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch pending requests"
      );
    }
  }

  async handleJoinRequest(requestId, action, role) {
    try {
      const response = await apiClient.put(
        `/organizations/join-requests/${requestId}`,
        {
          action,
          role,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Handle join request error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to handle join request"
      );
    }
  }

  async updateMemberRole(memberId, role) {
    try {
      const response = await apiClient.put(
        `/organizations/members/${memberId}/role`,
        {
          role,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Update member role error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update member role"
      );
    }
  }

  async removeMember(memberId) {
    try {
      const response = await apiClient.delete(
        `/organizations/members/${memberId}`
      );
      return response.data;
    } catch (error) {
      console.error("Remove member error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to remove member"
      );
    }
  }

  // Organization creation and joining methods
  async createOrganization(formData) {
    try {
      const config = {};

      // Handle FormData vs JSON
      if (formData instanceof FormData) {
        config.headers = {
          "Content-Type": "multipart/form-data",
        };
      }

      const response = await apiClient.post("/organizations", formData, config);
      return response.data;
    } catch (error) {
      console.error("Create organization error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create organization"
      );
    }
  }

  async joinOrganization(joinData) {
    try {
      const response = await apiClient.post("/organizations/join", joinData);
      return response.data;
    } catch (error) {
      console.error("Join organization error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to join organization"
      );
    }
  }

  async inviteMember(inviteData) {
    try {
      const response = await apiClient.post(
        "/organizations/invite",
        inviteData
      );
      return response.data;
    } catch (error) {
      console.error("Invite member error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to send invitation"
      );
    }
  }
}

export const organizationService = new OrganizationService();