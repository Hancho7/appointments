import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  appointments: [],
  incomingRequests: [],
  isLoading: false,
  error: null,
};

const appointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    setAppointments: (state, action) => {
      state.appointments = action.payload;
    },
    addAppointment: (state, action) => {
      state.appointments.push(action.payload);
    },
    updateAppointment: (state, action) => {
      const index = state.appointments.findIndex(apt => apt.id === action.payload.id);
      if (index !== -1) {
        state.appointments[index] = { ...state.appointments[index], ...action.payload };
      }
    },
    removeAppointment: (state, action) => {
      state.appointments = state.appointments.filter(apt => apt.id !== action.payload);
    },
    setIncomingRequests: (state, action) => {
      state.incomingRequests = action.payload;
    },
    addIncomingRequest: (state, action) => {
      state.incomingRequests.push(action.payload);
    },
    removeIncomingRequest: (state, action) => {
      state.incomingRequests = state.incomingRequests.filter(req => req.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAppointments,
  addAppointment,
  updateAppointment,
  removeAppointment,
  setIncomingRequests,
  addIncomingRequest,
  removeIncomingRequest,
  setLoading,
  setError,
} = appointmentSlice.actions;

export default appointmentSlice.reducer;