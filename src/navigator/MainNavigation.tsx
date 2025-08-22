// src/navigator/MainNavigation.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
import ManageStockScreen from '../screens/stockScreens/ManageStockScreen';
import PostScreen from '../screens/postScreens/PostScreen';
import PostDetailScreen from '../screens/postScreens/PostDetailScreen';
import AdsListScreen from '../screens/adsScreens/AdsListScreen';
import AdsDetailScreen from '../screens/adsScreens/AdsDetailScreen';
import TopCafesScreen from '../screens/otherScreen/TopCafesScreen';
import TableBookingFormScreen from '../screens/otherScreen/TableBookingFormScreen';
import BookedTablesScreen from '../screens/otherScreen/BookedTablesScreen';
import MenuItemListScreen from '../screens/stockScreens/MenuItemListScreen';
import CartScreen from '../screens/orderScreen/CartScreen';
import AboutUsScreen from '../screens/moreLInkPages/AboutUsScreen';
import ContactUsScreen from '../screens/moreLInkPages/ContactUsScreen';
import TermsConditionsScreen from '../screens/moreLInkPages/TermsConditionsScreen';
import PrivacyPolicyScreen from '../screens/moreLInkPages/PrivecyPolicyScreen';
import FaqsScreen from '../screens/moreLInkPages/FaqsScreen';
import AllCategoriesScreen from '../screens/otherScreen/AllCategoriesScreen';
import WalletScreen from '../screens/walletScreen/WalletScreen';
import AllOrderScreen from '../screens/orderScreen/AllOrderScreen';
import ManageDineInServiceScreen from '../screens/shopFormScreens/ManageDineInServiceScreen';
import ManageReviewScreen from '../screens/otherScreen/ManageReviewScreeen';
import UsersMenuItems from '../components/common/UsersMenuItems';
import CustormerScreen from '../(tabs)/CustormerScreen';

const Stack = createNativeStackNavigator();

const MainNavigation = () => {
  return (
    <Stack.Navigator initialRouteName='SplashScreen' screenOptions={{ headerShown: false }}>
      {/* Splash Always First */}
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
      <Stack.Screen name="ManageDineInServiceScreen" component={ManageDineInServiceScreen} />
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
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="AddOrderScreen" component={AddOrderScreen} />
      <Stack.Screen name="OrderSummaryScreen" component={OrderSummaryScreen} />
      <Stack.Screen name="HighOnDemandScreen" component={HighOnDemandScreen} />
      <Stack.Screen name="TopCafesScreen" component={TopCafesScreen} />
      <Stack.Screen name="BookATableScreen" component={BookATableScreen} />
      <Stack.Screen name="LunchAndDinnerScreen" component={LunchAndDinnerScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
      <Stack.Screen name="ShopDetailsScreen" component={ShopDetailsScreen} />
      <Stack.Screen name="ProductDetailsScreen" component={ProductDetailsScreen} />
      <Stack.Screen name="ManageStockScreen" component={ManageStockScreen} />

      <Stack.Screen name="PostScreen" component={PostScreen} />
      <Stack.Screen name="PostDetailScreen" component={PostDetailScreen} />
      <Stack.Screen name="AdsListScreen" component={AdsListScreen} />
      <Stack.Screen name="AdsDetailScreen" component={AdsDetailScreen} />
      <Stack.Screen name="TableBookingFormScreen" component={TableBookingFormScreen} />
      <Stack.Screen name="BookedTablesScreen" component={BookedTablesScreen} />
      <Stack.Screen name="MenuItemListScreen" component={MenuItemListScreen} />
      <Stack.Screen name="AllCategoriesScreen" component={AllCategoriesScreen} />

      <Stack.Screen name="ManageTransection" component={WalletScreen} />
      <Stack.Screen name="ManageAllOrders" component={AllOrderScreen} />
      <Stack.Screen name="ManageReviewScreen" component={ManageReviewScreen} />
      <Stack.Screen name="ViewAllMenuItems" component={UsersMenuItems} />
      <Stack.Screen name="MomentScreen" component={CustormerScreen} />





      {/* More Links Screens */}
      <Stack.Screen name="AboutUsScreen" component={AboutUsScreen} />
      <Stack.Screen name="ContactUsScreen" component={ContactUsScreen} />
      <Stack.Screen name="TermsConditionScreen" component={TermsConditionsScreen} />
      <Stack.Screen name="PrivecyPolicyScreen" component={PrivacyPolicyScreen} />
      <Stack.Screen name="FaqsScreen" component={FaqsScreen} />












    </Stack.Navigator>
  );
};

export default MainNavigation;
