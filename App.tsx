import React from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import MainNavigation from './src/navigator/MainNavigation';
import './global.css';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {store} from './src/store/store';

const App = () => {
  return (
    <ReduxProvider store={store}>
      <SafeAreaProvider>
        <NavigationContainer>
          <MainNavigation />
        </NavigationContainer>
      </SafeAreaProvider>
    </ReduxProvider>
  );
};

export default App;
