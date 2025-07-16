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
  ActivityIndicator,
  StyleSheet,
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
import { getFcmToken } from '../../utils/notification/firebase';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (
    values: { email: string; password: string },
    { setSubmitting, resetForm }: any,
  ) => {
    setIsSubmitting(true);

    try {
      const payload = {
        email: values.email,
        password: values.password,
        fcm_token: await getFcmToken(),
      };

      const response = await dispatch(login(payload)).unwrap();
console.log(response)
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      await dispatch(fetchUser()).unwrap();

      // Clear form and errors
      setApiErrors({
        email: '',
        password: '',
      });
      resetForm();

      ToastAndroid.show(
        response.message || 'Logged in successfully!',
        ToastAndroid.LONG
      );

      // Navigate based on user role and shopcreated status
      const userData = response.user;
      if (userData) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: userData.role === 'user'
                ? 'HomeScreen'
                : userData.shopcreated ? 'HomeScreen' : 'CreateShopScreen',
              params: userData.role === 'user' ? { screen: 'Market' } : undefined,
            },
          ],
        });
      } else {
        throw new Error('User data not found');
      }
    } catch (error: any) {
      console.log(error)
      const errorData = error?.errors || {};
      setApiErrors({
        email: errorData.email?.[0] || '',
        password: errorData.password?.[0] || '',
      });

      ToastAndroid.show(
        error.message || 'Login failed. Please check your credentials.',
        ToastAndroid.LONG
      );
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);

    try {
      const payload = {
        fcm_token: await getFcmToken(),
      };

      const response = await dispatch(googleAuth(payload)).unwrap();

      if (!response.success) {
        throw new Error(response.message || 'Google login failed');
      }

      await dispatch(fetchUser()).unwrap();

      ToastAndroid.show(
        response.message || 'Logged in successfully!',
        ToastAndroid.LONG
      );

      // Navigate based on user role and shopcreated status
      const userData = response.user;
      if (userData) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: userData.role === 'user'
                ? 'HomeScreen'
                : userData.shopcreated ? 'HomeScreen' : 'CreateShopScreen',
              params: userData.role === 'user' ? { screen: 'Market' } : undefined,
            },
          ],
        });
      } else {
        throw new Error('User data not found');
      }
    } catch (error: any) {
      const errorData = error?.errors || {};
      setApiErrors({
        email: errorData.email?.[0] || '',
        password: errorData.password?.[0] || '',
      });

      ToastAndroid.show(
        error.message || 'Google login failed. Please try again.',
        ToastAndroid.LONG
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: '#fff',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View className="relative p-4">
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
              Sign in to continue your journey
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
                isSubmitting: formikSubmitting,
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
                      editable={!isSubmitting}
                      accessibilityLabel="Email input"
                    />
                    {(touched.email || apiErrors.email) && (
                      <Text className="text-red-500 text-xs mt-1">
                        {errors.email || apiErrors.email}
                      </Text>
                    )}
                  </View>

                  <View className="mb-3">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Password
                    </Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden">
                      <TextInput
                        className="flex-1 p-3 bg-gray-100 text-base"
                        placeholder="Enter your password"
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                        secureTextEntry={!showPassword}
                        editable={!isSubmitting}
                        accessibilityLabel="Password input"
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="p-3 bg-gray-100"
                        disabled={isSubmitting}
                        accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      >
                        <Icon
                          name={showPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                    {(touched.password || apiErrors.password) && (
                      <Text className="text-red-500 text-xs mt-1">
                        {errors.password || apiErrors.password}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgetPasswordScreen')}
                    disabled={isSubmitting}
                    className="my-1"
                    accessibilityLabel="Forgot password link">
                    <Text className="ml-2 text-sm text-orange-primary-80 font-poppins font-bold">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting || formikSubmitting}
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
                        opacity: isSubmitting || formikSubmitting ? 0.7 : 1,
                      }}>
                      <Text className="text-white text-base font-bold">
                        Login
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            <Text className="text-center my-4 mt-10 text-gray-600">
              -------- Or Continue with --------
            </Text>

            <View className="flex-row justify-center gap-4 mb-10 mt-5">
              <TouchableOpacity
                className="p-3 w-1/2 bg-orange-primary-10 rounded-2xl"
                onPress={handleGoogleLogin}
                disabled={isSubmitting}
                accessibilityLabel="Google Sign In">
                <Image
                  source={ImagePath.google}
                  className="w-8 h-8 m-auto"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                className="p-3 w-1/2 bg-orange-primary-10 rounded-2xl hidden"
                onPress={() =>
                  ToastAndroid.show(
                    'Facebook Sign-In not implemented yet.',
                    ToastAndroid.LONG
                  )
                }
                disabled={isSubmitting}
                accessibilityLabel="Facebook Sign In">
                <Image
                  source={ImagePath.facebook}
                  className="w-8 h-8 m-auto"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-center mb-4">
              <Text className="text-sm text-gray-600">
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AccountTypeScreen')}
                disabled={isSubmitting}
                accessibilityLabel="Sign Up link">
                <Text className="text-orange-primary-100 text-sm ml-1 underline font-bold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Logging In...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default LoginScreen;