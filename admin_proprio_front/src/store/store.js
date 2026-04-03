import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import notificationReducer from './slices/notificationSlice';
import userReducer from './slices/userSlice';
import financialReducer from './slices/financialSlice';
import maintenanceReducer from './slices/maintenanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertyReducer,
    notifications: notificationReducer,
    users: userReducer,
    financial: financialReducer,
    maintenance: maintenanceReducer,
  },
});