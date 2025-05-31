import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigation from './src/navigator/MainNavigation';
import "./global.css"

const App = () => {
  return (
    <NavigationContainer>
      <MainNavigation />
    </NavigationContainer>
  );
};

export default App;
