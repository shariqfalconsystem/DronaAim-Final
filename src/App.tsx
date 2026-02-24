// App.tsx

import React from 'react';
import './App.css';
import store, { persistor } from './redux/store';
import { Provider } from 'react-redux';
import RouteConfig from './routes/routeConfig';
import theme from './theme';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ToastContainer } from 'react-toastify';
import { Amplify } from 'aws-amplify';
import { PersistGate } from 'redux-persist/integration/react';
import environment from './environments/environment';
import '@aws-amplify/ui-react/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationsProvider } from './common/contexts/notificationContext';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: environment.userPoolId,
      userPoolClientId: environment.userPoolClientId,
    },
  },
});

function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  return (
    <APIProvider apiKey={apiKey}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NotificationsProvider>
            <ToastContainer
              position="top-right"
              autoClose={3000}
              style={{ width: 'auto' }}
              toastStyle={{ whiteSpace: 'pretty' }}
            />
            <ThemeProvider theme={theme}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <CssBaseline />
                <div className="App">
                  <RouteConfig />
                </div>
              </LocalizationProvider>
            </ThemeProvider>
          </NotificationsProvider>
        </PersistGate>
      </Provider>
    </APIProvider>
  );
}

export default App;
