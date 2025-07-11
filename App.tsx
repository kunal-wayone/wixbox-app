// App.tsx
import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/store/store';
import AuthProvider from './src/providers/AuthProvider';

import {
  requestUserPermission,
  getFcmToken,
  onForegroundMessageListener,
  onTokenRefreshListener,
  onNotificationOpenedAppHandler,
  checkInitialNotification,
} from './src/utils/notification/firebase';
import { configureGoogleSignIn } from './src/utils/authentication/googleAuth';

const App = () => {
  useEffect(() => {
     configureGoogleSignIn()
    // Request permission and fetch token
    requestUserPermission();
    getFcmToken();
    configureGoogleSignIn()

    // Setup all listeners
    const unsubscribeForeground = onForegroundMessageListener();
    const unsubscribeTokenRefresh = onTokenRefreshListener();
    onNotificationOpenedAppHandler();
    checkInitialNotification();

    // Cleanup on unmount
    return () => {
      // unsubscribeForeground();
      unsubscribeTokenRefresh();
    };
  }, []);

  return (
    <ReduxProvider store={store}>
      <NavigationContainer>
        <SafeAreaProvider>
          <AuthProvider />
        </SafeAreaProvider>
      </NavigationContainer>
    </ReduxProvider>
  );
};

export default App;
