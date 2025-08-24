// src/store/store.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { persistReducer, persistStore } from 'redux-persist';

// Import the correct slices
import appointmentReducer from './slices/appointmentSlice';
import authReducer from './slices/auth/loginSlice';
import signupReducer from './slices/auth/signupSlice';
import notificationReducer from './slices/notificationSlice';
import organizationReducer from './slices/organizationSlice';
import themeReducer from './slices/themeSlice';

// TEMPORARY: Disable persistence for testing
const ENABLE_PERSISTENCE = false; 

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ENABLE_PERSISTENCE ? ['auth', 'theme', 'organization'] : ['theme'], // Only persist theme in testing
};

const rootReducer = combineReducers({
  auth: authReducer,
  signup: signupReducer,
  organization: organizationReducer,
  appointment: appointmentReducer,
  theme: themeReducer,
  notification: notificationReducer, 
});

const persistedReducer = ENABLE_PERSISTENCE 
  ? persistReducer(persistConfig, rootReducer)
  : rootReducer;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ENABLE_PERSISTENCE 
          ? ['persist/PERSIST', 'persist/REHYDRATE']
          : [],
      },
    }),
});

export const persistor = ENABLE_PERSISTENCE ? persistStore(store) : null;