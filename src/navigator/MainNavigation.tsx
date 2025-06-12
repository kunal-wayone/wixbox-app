import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import ProtectedRoute from '../components/ProtectedRoute';

// Screens
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
import PaymentScreen from '../screens/otherScreen/PaymentScreen';
import SearchScreen from '../screens/otherScreen/SearchScreen';
import ShopDetailsScreen from '../screens/shopScreens/ShopDetailsScreen';
import ProductDetailsScreen from '../screens/productScreens/ProductDetailsScreen';
import LoadingComponent from '../screens/otherScreen/LoadingComponent';
import ManageStockScreen from '../screens/stockScreens/ManageStockScreen';

const Stack = createNativeStackNavigator();

const MainNavigation = () => {
  const isAuthenticated = useSelector(
    (state: any) => state.user.isAuthenticated,
  );
  // const isLoading = useSelector((state: any) => state.app.isLoading); // Assumes you have a loading state
  const status = useSelector((state: any) => state.user.status);
  const isLoading = status === 'loading';

  const publicScreens = {
    SplashScreen,
    SplashScreen1: IntroScreen,
    AccountTypeScreen,
    SignUpScreen,
    LoginScreen,
    ForgetPasswordScreen,
    VerifyOtpScreen,
    ResetPasswordScreen,
  };

  const protectedScreens = {
    CreateShopScreen,
    AddDineInServiceScreen,
    HomeScreen: () => <BottomTabNavigator />,
    NotificationScreen,
    AddProductScreen,
    CreateAdScreen,
    EditProfileScreen,
    DeleteAccountScreen,
    DeleteAccountVerifyOtpScreen,
    AddCustomerScreen,
    CustomerDetailsScreen,
    AddCustomerFormScreen,
    AddOrderScreen,
    OrderSummaryScreen,
    HighOnDemandScreen,
    BookATableScreen,
    LunchAndDinnerScreen,
    PaymentScreen,
    SearchScreen,
    ShopDetailsScreen,
    ProductDetailsScreen,
    ManageStockScreen,
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenOptions={{headerShown: false}}>
      {/* Public Screens */}
      {Object.entries(publicScreens).map(([name, Component]) => (
        <Stack.Screen key={name} name={name} component={Component} />
      ))}

      {/* Protected Screens */}
      {Object.entries(protectedScreens).map(([name, Component]) => (
        <Stack.Screen
          key={name}
          name={name}
          children={(props: any) => (
            <ProtectedRoute>
              {React.createElement(Component, props)}
            </ProtectedRoute>
          )}
        />
      ))}
    </Stack.Navigator>
  );
};

export default MainNavigation;
