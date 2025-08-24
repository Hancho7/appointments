// src/store/slices/organizationSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentOrganization: null,
  members: [],
  pendingRequests: [],
  loading: false,
  error: null,
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setOrganization: (state, action) => {
      state.currentOrganization = action.payload;
    },
    setMembers: (state, action) => {
      state.members = action.payload;
    },
    setPendingRequests: (state, action) => {
      state.pendingRequests = action.payload;
    },
    updateMemberRole: (state, action) => {
      const { id, role } = action.payload;
      const member = state.members.find(m => m.id === id);
      if (member) {
        member.role = role;
      }
    },
    removeMember: (state, action) => {
      state.members = state.members.filter(m => m.id !== action.payload);
    },
    removePendingRequest: (state, action) => {
      state.pendingRequests = state.pendingRequests.filter(r => r.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setOrganization,
  setMembers,
  setPendingRequests,
  updateMemberRole,
  removeMember,
  removePendingRequest,
  setLoading,
  setError,
  clearError,
} = organizationSlice.actions;

export default organizationSlice.reducer;