import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import propertyReducer from './propertySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    properties: propertyReducer
  }
});
