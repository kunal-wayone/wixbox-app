import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../screens/splashScreens/SplashScreen';
import IntroScreen from '../screens/splashScreens/IntroScreen';
import AccountTypeScreen from '../screens/authScreens/AccountTypeScreen';
import SignUpScreen from '../screens/authScreens/SignUpScreen';
import LoginScreen from '../screens/authScreens/LoginScreen';
import ForgetPasswordScreen from '../screens/authScreens/ForgetPasswordScreen';
import VerifyOtpScreen from '../screens/authScreens/VerifyOtpScreen';
import ResetPasswordScreen from '../screens/authScreens/ResetPasswordScreen';
import CreateShopScreen from '../screens/shopFormScreens/CreateShopScreen';
import AddDineInServiceScreen from '../screens/shopFormScreens/AddDineInServiceScreen';
import BottomTabNavigator from './BottomTabNavigator';
import NotificationScreen from '../screens/otherScreen/NotificationScreen';
import AddProductScreen from '../screens/productScreens/AddProductScreen';
import CreateAdScreen from '../screens/adsScreens/CreateAdScreen';
import EditProfileScreen from '../screens/otherScreen/EditProfileScreen';
import DeleteAccountScreen from '../screens/authScreens/DeleteAccountScreen';
import DeleteAccountVerifyOtpScreen from '../screens/authScreens/DeleteAccountVerifyOtpScreen';
import AddCustomerScreen from '../screens/customersScreens/AddCustomerScreen';
import CustomerDetailsScreen from '../screens/customersScreens/CustoemrDetailsScreen';
import AddCustomerFormScreen from '../screens/customersScreens/AddCustomerFormScreen';
import AddOrderScreen from '../screens/orderScreen/AddOrderScreen';
import OrderSummaryScreen from '../screens/orderScreen/OrderSummaryScreen';
import HighOnDemandScreen from '../screens/otherScreen/HighOnDemandScreen';
import BookATableScreen from '../screens/otherScreen/BookATableScreen';
import LunchAndDinnerScreen from '../screens/otherScreen/LunchAndDinnerScreen';

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
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="ForgetPasswordScreen" component={ForgetPasswordScreen} />
      <Stack.Screen name="VerifyOtpScreen" component={VerifyOtpScreen} />
      <Stack.Screen name="ResetPasswordScreen" component={ResetPasswordScreen} />
      <Stack.Screen name="CreateShopScreen" component={CreateShopScreen} />
      <Stack.Screen name="AddDineInServiceScreen" component={AddDineInServiceScreen} />
      <Stack.Screen name="HomeScreen" component={BottomTabNavigator} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
      <Stack.Screen name="CreateAdScreen" component={CreateAdScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="DeleteAccountScreen" component={DeleteAccountScreen} />
      <Stack.Screen name="DeleteAccountVerifyOtpScreen" component={DeleteAccountVerifyOtpScreen} />
      <Stack.Screen name="AddCustomerScreen" component={AddCustomerScreen} />
      <Stack.Screen name="CustomerDetailsScreen" component={CustomerDetailsScreen} />
      <Stack.Screen name="AddCustomerFormScreen" component={AddCustomerFormScreen} />
      <Stack.Screen name="AddOrderScreen" component={AddOrderScreen} />
      <Stack.Screen name="OrderSummaryScreen" component={OrderSummaryScreen} />
      <Stack.Screen name="HighOnDemandScreen" component={HighOnDemandScreen} />
      <Stack.Screen name="BookATableScreen" component={BookATableScreen} />
      <Stack.Screen name="LunchAndDinnerScreen" component={LunchAndDinnerScreen} />









      









    </Stack.Navigator>
  );
};

export default MainNavigation;
