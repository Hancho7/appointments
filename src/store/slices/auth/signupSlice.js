// src/store/slices/auth/signupSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoading: false,
  signUpSuccess: false,
  message: null,
  error: null,
  user: null,
  errorDetails: null, // Additional error information
};

const signupSlice = createSlice({
  name: 'auth/signup',
  initialState,
  reducers: {
    signupStart: (state) => {
      state.isLoading = true;
      state.error = null;
      state.errorDetails = null;
      state.signUpSuccess = false;
      state.message = null;
    },
    signupSuccess: (state, action) => {
      state.isLoading = false;
      state.signUpSuccess = true;
      state.message = action.payload.message;
      state.user = action.payload.data?.user || null;
      state.error = null;
      state.errorDetails = null;
    },
    signupFailure: (state, action) => {
      state.isLoading = false;
      state.signUpSuccess = false;
      
      // Handle different error payload formats
      if (typeof action.payload === 'string') {
        state.error = action.payload;
        state.message = null;
        state.errorDetails = null;
      } else if (action.payload && typeof action.payload === 'object') {
        state.error = action.payload.message || action.payload.detail || 'Signup failed';
        state.message = null;
        state.errorDetails = {
          status: action.payload.status,
          type: action.payload.type,
          title: action.payload.title,
          timestamp: action.payload.timestamp,
          path: action.payload.path,
        };
      } else {
        state.error = 'An unexpected error occurred during signup';
        state.message = null;
        state.errorDetails = null;
      }
      
      state.user = null;
    },
    clearSignupState: (state) => {
      state.isLoading = false;
      state.signUpSuccess = false;
      state.message = null;
      state.error = null;
      state.errorDetails = null;
      state.user = null;
    },
    clearSignupError: (state) => {
      state.error = null;
      state.errorDetails = null;
    },
  },
});

export const {
  signupStart,
  signupSuccess,
  signupFailure,
  clearSignupState,
  clearSignupError,
} = signupSlice.actions;

export default signupSlice.reducer;