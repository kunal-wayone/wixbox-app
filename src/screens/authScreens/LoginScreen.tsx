import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ImagePath } from '../../constants/ImagePath';
import { googleAuth, login } from '../../store/slices/authSlice';
import { fetchUser } from '../../store/slices/userSlice';
import { getFcmToken } from '../../utils/notification/firebase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width } = Dimensions.get('screen');

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(8, 'Min 8 characters').required('Password is required'),
});

type RootStackParamList = {
  HomeScreen: { screen: string } | undefined;
  CreateShopScreen: undefined;
  ForgetPasswordScreen: undefined;
  AccountTypeScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useDispatch<any>();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState({ email: '', password: '' });

  const navigateAfterLogin = (user: any) => {
    if (!user) {
      ToastAndroid.show('User data missing', ToastAndroid.LONG);
      return;
    }
    const route: any =
      user.role === 'user'
        ? { name: 'HomeScreen', params: { screen: 'Market' } }
        : { name: user.shopcreated ? 'HomeScreen' : 'CreateShopScreen' };

    navigation.reset({ index: 0, routes: [route] });
  };

  const handleLogin = async (
    values: { email: string; password: string },
    { setSubmitting, resetForm, setErrors }: any
  ) => {
    setIsLoading(true);
    setSubmitting(true);
    try {
      const fcmToken = await getFcmToken();
      const payload = { ...values, fcm_token: fcmToken };
      const response = await dispatch(login(payload)).unwrap();
      console.log(response)
      if (!response.success) {
        throw new Error(response.message || 'Login failed');
      }

      await dispatch(fetchUser()).unwrap();
      resetForm();
      ToastAndroid.show(response.message || 'Login Successful!', ToastAndroid.LONG);

      navigateAfterLogin(response.user);
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.message || 'Login failed. Check credentials.';
      if (error.errors) {
        setErrors(error.errors);
        setApiErrors({
          email: error.errors.email?.[0] || '',
          password: error.errors.password?.[0] || '',
        });
      }
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setApiErrors({ email: '', password: '' });

    try {
      const fcmToken = await getFcmToken();
      const response = await dispatch(googleAuth({ fcm_token: fcmToken })).unwrap();

      if (!response.success) {
        throw new Error(response.message || 'Google login failed');
      }

      await dispatch(fetchUser()).unwrap();
      ToastAndroid.show(response.message || 'Login Successful!', ToastAndroid.LONG);
      navigateAfterLogin(response.user);
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = error?.message || 'Google login failed.';
      setApiErrors({
        email: error.errors?.email?.[0] || '',
        password: error.errors?.password?.[0] || '',
      });
      ToastAndroid.show(errorMessage, ToastAndroid.LONG);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View className="relative p-4">
            <Image
              source={ImagePath.signBg}
              style={styles.backgroundImage}
              resizeMode="contain"
            />

            <View className="mt-20">
              <MaskedView
                maskElement={<Text style={{ fontFamily: 'Raleway-Bold' }} className="text-center text-3xl ">Welcome Back!</Text>}
              >
                <LinearGradient
                  colors={['#ac94f4', '#7248B3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={{ fontFamily: 'Raleway-Bold', opacity: 0 }} className="text-center text-3xl ">
                    Welcome Back!
                  </Text>
                </LinearGradient>
              </MaskedView>

              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-center my-2 text-gray-600">
                Sign in to continue your journey
              </Text>

              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleLogin}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  isSubmitting,
                }) => (
                  <View className="mt-4">
                    {/* Email */}
                    <View className="mb-3">
                      <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                      <TextInput style={{ fontFamily: 'Raleway-Regular' }}
                        className="border border-gray-300 bg-gray-100 text-gray-900 rounded-lg p-3 text-base"
                        placeholder="Enter your email"
                        placeholderTextColor="#000"
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                      {touched.email && errors.email && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.email}</Text>
                      )}
                    </View>

                    {/* Password */}
                    <View className="mb-3">
                      <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm font-medium text-gray-700 mb-1">Password</Text>
                      <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden">
                        <TextInput style={{ fontFamily: 'Raleway-Regular' }}
                          className="flex-1 p-3 bg-gray-100 text-gray-900 text-base"
                          placeholder="Enter your password"
                          placeholderTextColor="#000"
                          secureTextEntry={!showPassword}
                          onChangeText={handleChange('password')}
                          onBlur={handleBlur('password')}
                          value={values.password}
                          editable={!isLoading}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          className="p-3 px-4 bg-gray-100"
                          disabled={isLoading}
                        >
                          <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                      {touched.password && errors.password && (
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.password}</Text>
                      )}
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity
                      className="my-1"
                      onPress={() => navigation.navigate('ForgetPasswordScreen')}
                      disabled={isLoading}
                    >
                      <Text style={{ fontFamily: 'Raleway-Bold' }} className="ml-2 text-sm text-primary-90 ">
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>

                    {/* Submit Button */}
                    <TouchableOpacity
                      className="mt-4"
                      onPress={() => handleSubmit()}
                      disabled={isLoading || isSubmitting}
                    >
                      <LinearGradient
                        colors={['#ac94f4', '#7248B3']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.loginButton, (isLoading || isSubmitting) && { opacity: 0.7 }]}
                      >
                        {isLoading || isSubmitting ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-white text-base ">Login</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>

              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-center my-4 mt-10 text-gray-600">
                -------- Or Continue with --------
              </Text>

              <View className="flex-row justify-center gap-4 mb-10 mt-5">
                <TouchableOpacity
                  className="p-3 w-1/2 bg-primary-10 rounded-2xl"
                  onPress={handleGoogleLogin}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Image source={ImagePath.google} className="w-8 h-8 m-auto" resizeMode="contain" />
                  )}
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View className="flex-row items-center justify-center mb-4">
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Don't have an account?</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('AccountTypeScreen')}
                  disabled={isLoading}
                >
                  <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-primary-100 text-sm ml-1 underline">
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    tintColor: '#ac94f4',
    position: 'absolute',
    top: -50,
    left: -8,
    width: width * 0.5,
    height: width * 0.5,
  },
  loginButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default LoginScreen;