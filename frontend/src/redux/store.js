import { configureStore } from '@reduxjs/toolkit';
import historyReducer from './slices/historySlice';
import userReducer from './slices/userSlice';
import announcementReducer from './slices/announcementSlice';
import seminarReducer from './slices/seminarSlice';

export const store = configureStore({
  reducer: {
    history: historyReducer,
    users: userReducer,
    announcements: announcementReducer,
    seminars: seminarReducer,
  },
});
