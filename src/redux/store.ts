import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import authReducer from './auth/authSlice';
import vehicleReducer from './vehicles/vehicleSlice';
import tripsReducer from './trips/tripsSlice';
import eventsReducer from './events/eventsSlice';
import driversReducer from './drivers/driversSlice';
import documentsSlice from './documents/documentsSlice';
import idashboardSlice from './insurer/dashboard/idashboardSlice';
import iFleetListSlice from './insurer/fleet-list/iFleetListSlice';
import iEventsMileSlice from './insurer/dashboard/iEventsMileSlice';
import iDashcamSlice from './insurer/dashcam/dashcamSlice';
import helpCenterSlice from './help-center/helpCenterSlice';
import devicesSlice from './admin/devices/devicesSlice';
import adminVehiclesSlice from './admin/vehicles/vehcileSlice';
import adminDriverSlice from './admin/drivers/driverSlice';
import userSlice from './admin/usermanagement/usersSlice';
import fnolSlice from './insurer/fnol/fnolSlice';

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer,
  vehicles: vehicleReducer,
  trips: tripsReducer,
  events: eventsReducer,
  drivers: driversReducer,
  documents: documentsSlice,
  idashboard: idashboardSlice,
  iFleetList: iFleetListSlice,
  iEventsMile: iEventsMileSlice,
  iDashcam: iDashcamSlice,
  helpCenter: helpCenterSlice,
  devices: devicesSlice,
  adminVehicles: adminVehiclesSlice,
  adminDriver: adminDriverSlice,
  usermanagement: userSlice,
  fnol: fnolSlice,
});

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  transforms: [
    encryptTransform({
      secretKey: import.meta.env.VITE_SECRET_KEY,
      onError: (error: any) => {
        console.error('Encryption Error:', error);
      },
    }),
  ],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware adjustments for redux-persist
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export default store;
