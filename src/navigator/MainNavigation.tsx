import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../screens/splashScreens/SplashScreen';
import IntroScreen from '../screens/splashScreens/IntroScreen';
import AccountTypeScreen from '../screens/authScreens/AccountTypeScreen';
import SignUpScreen from '../screens/authScreens/SignUpScreen';

const Stack = createNativeStackNavigator();

const MainNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="SplashScreen1" component={IntroScreen} />
      <Stack.Screen name="AccountTypeScreen" component={AccountTypeScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigation;
