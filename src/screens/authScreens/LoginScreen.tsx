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

import { ImagePath } from '../../constants/ImagePath';
import { googleAuth, login } from '../../store/slices/authSlice';
import { fetchUser } from '../../store/slices/userSlice';
import { getFcmToken } from '../../utils/notification/firebase';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('screen');

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(8, 'Min 8 characters').required('Password is required'),
});


const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiErrors, setApiErrors] = useState({ email: '', password: '' });

  const navigateAfterLogin = (user: any) => {
    const route = user.role === 'user'
      ? { name: 'HomeScreen', params: { screen: 'Market' } }
      : { name: user.shopcreated ? 'HomeScreen' : 'CreateShopScreen' };

    navigation.reset({ index: 0, routes: [route as any] });
  };

  const handleLogin = async (values: { email: string; password: string }, actions: any) => {
    setIsSubmitting(true);
    setApiErrors({ email: '', password: '' });

    try {
      const payload = { ...values, fcm_token: await getFcmToken() };
      const response = await dispatch(login(payload)).unwrap();

      if (!response.success) throw new Error(response.message || 'Login failed');
      await dispatch(fetchUser()).unwrap();

      actions.resetForm();
      ToastAndroid.show(response.message || 'Login Successful!', ToastAndroid.LONG);

      if (response.user) navigateAfterLogin(response.user);
      else throw new Error('User data missing');

    } catch (error: any) {
      console.error('Login error:', error);
      const err = error?.errors || {};
      setApiErrors({
        email: err.email?.[0] || '',
        password: err.password?.[0] || '',
      });

      ToastAndroid.show(
        error.message || 'Login failed. Check credentials.',
        ToastAndroid.LONG
      );
    } finally {
      setIsSubmitting(false);
      actions.setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setApiErrors({ email: '', password: '' });

    try {
      const response = await dispatch(
        googleAuth({ fcm_token: await getFcmToken() })
      ).unwrap();

      if (!response.success) throw new Error(response.message || 'Google login failed');
      await dispatch(fetchUser()).unwrap();

      ToastAndroid.show(response.message || 'Login Successful!', ToastAndroid.LONG);
      if (response.user) navigateAfterLogin(response.user);

    } catch (error: any) {
      console.error('Google login error:', error);
      const err = error?.errors || {};
      setApiErrors({
        email: err.email?.[0] || '',
        password: err.password?.[0] || '',
      });

      ToastAndroid.show(error.message || 'Google login failed.', ToastAndroid.LONG);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, backgroundColor: '#fff' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="relative p-4">
          <Image
            source={ImagePath.signBg}
            style={{ tintColor: "#ac94f4" }}
            className="absolute -top-[2%] -left-[2%] w-52 h-44"
            resizeMode="contain"
          />

          <View className="mt-20">
            <MaskedView
              maskElement={
                <Text className="text-center text-3xl font-bold">Welcome Back!</Text>
              }
            >
              <LinearGradient
                colors={['#ac94f4', '#7248B3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text className="text-center text-3xl font-bold" style={{ opacity: 0 }}>
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
              onSubmit={handleLogin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting: formSubmitting,
              }) => (
                <View className="mt-4">
                  {/* Email */}
                  <View className="mb-3">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
                    <TextInput
                      className="border border-gray-300 bg-gray-100 text-gray-900 rounded-lg p-3 text-base"
                      placeholder="Enter your email"
                      placeholderTextColor={"#000"}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      value={values.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!isSubmitting}
                    />
                    {(touched.email || apiErrors.email) && (
                      <Text className="text-red-500 text-xs mt-1">
                        {errors.email || apiErrors.email}
                      </Text>
                    )}
                  </View>

                  {/* Password */}
                  <View className="mb-3">
                    <Text className="text-sm font-medium text-gray-700 mb-1">Password</Text>
                    <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden">
                      <TextInput
                        className="flex-1 p-3 bg-gray-100 text-gray-900 text-base"
                        placeholder="Enter your password"
                        placeholderTextColor={"#000"}
                        secureTextEntry={!showPassword}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                        editable={!isSubmitting}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        className="p-3 bg-gray-100"
                      >
                        <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
                      </TouchableOpacity>
                    </View>
                    {(touched.password || apiErrors.password) && (
                      <Text className="text-red-500 text-xs mt-1">
                        {errors.password || apiErrors.password}
                      </Text>
                    )}
                  </View>

                  {/* Forgot Password */}
                  <TouchableOpacity
                    className="my-1"
                    onPress={() => navigation.navigate('ForgetPasswordScreen')}
                    disabled={isSubmitting}
                  >
                    <Text className="ml-2 text-sm text-primary-90 font-bold">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>

                  {/* Submit Button */}
                  <TouchableOpacity
                    className="mt-4"
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting || formSubmitting}
                  >
                    <LinearGradient
                      colors={['#ac94f4', '#7248B3']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.loginButton,
                        (isSubmitting || formSubmitting) && { opacity: 0.7 },
                      ]}
                    >
                      <Text className="text-white text-base font-bold">Login</Text>
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
                className="p-3 w-1/2 bg-primary-10 rounded-2xl"
                onPress={handleGoogleLogin}
                disabled={isSubmitting}
              >
                <Image source={ImagePath.google} className="w-8 h-8 m-auto" resizeMode="contain" />
              </TouchableOpacity>

              {/* Facebook (Placeholder) */}
              <TouchableOpacity
                className="p-3 w-1/2 bg-primary-10 rounded-2xl opacity-50 hidden"
                onPress={() => ToastAndroid.show('Facebook login not implemented', ToastAndroid.SHORT)}
                disabled
              >
                <Image source={ImagePath.facebook} className="w-8 h-8 m-auto" resizeMode="contain" />
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="flex-row items-center justify-center mb-4">
              <Text className="text-sm text-gray-600">Don't have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AccountTypeScreen')}
                disabled={isSubmitting}
              >
                <Text className="text-primary-100 text-sm ml-1 underline font-bold">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Logging In...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loginButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
