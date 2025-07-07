// App.tsx
import React, { useEffect } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './global.css';

import { NavigationContainer } from '@react-navigation/native';
import { store } from './src/store/store';
import AuthProvider from './src/providers/AuthProvider';
import { getToken, requestUserPermission } from './src/utils/notification/firebase';

const App = () => {

  // useEffect(() => {
  //   requestUserPermission()
  //   getToken()
  // }, [])

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