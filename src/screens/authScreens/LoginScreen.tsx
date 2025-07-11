// src/screens/authScreens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../../constants/ImagePath';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { googleAuth, login } from '../../store/slices/authSlice';
import { fetchUser } from '../../store/slices/userSlice';
import { RootState } from '../../store/store';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('screen');

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

type RootStackParamList = {
  SplashScreen: undefined;
  SplashScreen1: undefined;
  AccountTypeScreen: undefined;
  SignUpScreen: undefined;
  LoginScreen: undefined;
  ForgetPasswordScreen: undefined;
  VerifyOtpScreen: undefined;
  ResetPasswordScreen: undefined;
  CreateShopScreen: undefined;
  AddDineInServiceScreen: undefined;
  HomeScreen: { screen?: string };
  NotificationScreen: undefined;
  AddProductScreen: undefined;
  CreateAdScreen: undefined;
  EditProfileScreen: undefined;
  DeleteAccountScreen: undefined;
  DeleteAccountVerifyOtpScreen: undefined;
  AddCustomerScreen: undefined;
  CustomerDetailsScreen: undefined;
  AddCustomerFormScreen: undefined;
  AddOrderScreen: undefined;
  OrderSummaryScreen: undefined;
  HighOnDemandScreen: undefined;
  BookATableScreen: undefined;
  LunchAndDinnerScreen: undefined;
  PaymentScreen: undefined;
  SearchScreen: undefined;
  ShopDetailsScreen: undefined;
  ProductDetailsScreen: undefined;
  ManageStockScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<any>();
  const [showPassword, setShowPassword] = useState(false);
  const { error, loading: isSubmitting } = useSelector(
    (state: RootState) => state.auth,
  );
  const [apiErrors, setApiErrors] = useState<any>({
    email: '',
    password: '',
  });
  const { data: user } = useSelector((state: RootState) => state.user);

  const handleLogin = async (
    values: { email: string; password: string },
    { resetForm }: any,
  ) => {
    try {
      // Dispatch login action
      const data = await dispatch(login(values)).unwrap();
      console.log(data);
      // Fetch user data
      const userData = data?.user;
      await dispatch(fetchUser())
      // Reset form
      resetForm();

      // Navigate based on user role and shopcreated status
      if (userData) {
        if (userData.role === 'user') {
          console.log("user")
          navigation.reset({
            index: 0,
            routes: [{ name: 'HomeScreen', params: { screen: 'Market' } }],
          });
        } else {
          console.log("Vendor")
          navigation.reset({
            index: 0,
            routes: [
              { name: userData.shopcreated ? 'HomeScreen' : 'CreateShopScreen' },
            ],
          });
        }
      } else {
        throw new Error('User data not found');
      }
    } catch (err: any) {
      console.log(err);

      setApiErrors({
        email: err?.errors?.email,
        password: err?.errors?.password,
      });
      ToastAndroid.show(
        err?.errors?.errors || 'Something went wrong. Please try again.',
        ToastAndroid.SHORT,
      );
    }
  };


  const handleGoogleLogin = async () => {
    dispatch(googleAuth());
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          backgroundColor: '#fff',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Image
          source={ImagePath.signBg}
          className="absolute -top-[2%] -left-[2%] w-52 h-44"
          resizeMode="contain"
        />
        <View className="mt-20">
          <MaskedView
            maskElement={
              <Text className="text-center text-3xl font-bold font-poppins">
                Welcome Back!
              </Text>
            }>
            <LinearGradient
              colors={['#EE6447', '#7248B3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <Text
                className="text-center text-3xl font-bold font-poppins"
                style={{ opacity: 0 }}>
                Welcome Back!
              </Text>
            </LinearGradient>
          </MaskedView>

          <Text className="text-center my-2 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur.
          </Text>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View className="mt-4">
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Email
                  </Text>
                  <TextInput
                    className="border border-gray-300 bg-gray-100 rounded-lg p-3 text-base"
                    placeholder="Enter your email"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    accessibilityLabel="Email input"
                  />
                  {touched.email && errors.email && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.email}
                    </Text>
                  )}
                  {apiErrors.email && (
                    <Text className="text-red-500 text-xs mt-1">
                      {apiErrors.email}
                    </Text>
                  )}
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Password
                  </Text>
                  <View className="flex-row items-center border border-gray-300 overflow-hidden rounded-lg">
                    <TextInput
                      className="flex-1 p-3 bg-gray-100 text-base"
                      placeholder="Enter your password"
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                      secureTextEntry={!showPassword}
                      accessibilityLabel="Password input"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="p-3 bg-gray-100"
                      accessibilityLabel={
                        showPassword ? 'Hide password' : 'Show password'
                      }>
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </Text>
                  )}
                  {apiErrors.password && (
                    <Text className="text-red-500 text-xs mt-1">
                      {apiErrors.password}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgetPasswordScreen')}
                  className="my-1"
                  accessibilityLabel="Forgot password link">
                  <Text className="ml-2 text-sm text-orange-primary-80 font-poppins font-bold">
                    Forget Password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="mt-4"
                  accessibilityLabel="Login button">
                  <LinearGradient
                    colors={['#EE6447', '#7248B3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      alignItems: 'center',
                    }}>
                    <Text className="text-white text-base font-bold">
                      {isSubmitting ? 'Logging in...' : 'Login'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <Text className="text-center my-4 mt-10 text-gray-600">
            --------Or Continue with--------
          </Text>

          <View className="flex-row justify-center gap-4 my-10">
            <TouchableOpacity
              className="p-3 w-1/2 bg-orange-primary-10 rounded-2xl"
              accessibilityLabel="Google Sign Up"
              onPress={handleGoogleLogin}>
              <Image
                source={ImagePath.google}
                className="w-14 h-16 m-auto"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-3 w-1/2 bg-orange-primary-10 rounded-2xl"
              accessibilityLabel="Facebook Sign-In"
              onPress={() =>
                ToastAndroid.show(
                  'Facebook Sign-In not implemented yet.',
                  ToastAndroid.SHORT,
                )
              }>
              <Image
                source={ImagePath.facebook}
                className="w-14 h-16 m-auto"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-gray-600">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AccountTypeScreen')}
              accessibilityLabel="Sign Up link">
              <Text className="text-orange-primary-100 text-sm ml-1 underline font-bold">
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
