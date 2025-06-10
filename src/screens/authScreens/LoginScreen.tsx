import React, {useState} from 'react';
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
import {Formik} from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import {ImagePath} from '../../constants/ImagePath';
import {useNavigation} from '@react-navigation/native';
import {Post, TokenStorage} from '../../utils/apiUtils';
import {useDispatch} from 'react-redux';
import {setAuthStatus, getCurrentUser} from '../../store/slices/userSlice';

const {width, height} = Dimensions.get('screen');

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const [showPassword, setShowPassword] = useState(false);
  const [apiErrors, setApiErrors] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (values: any, {setSubmitting, resetForm}: any) => {
    try {
      const response: any = await Post(
        '/auth/signin',
        {
          email: values.email,
          password: values.password,
        },
        5000,
      );
      console.log(response, values);
      if (!response.success) {
        throw new Error('Login failed');
      }

      const data = response.data;

      await TokenStorage.setToken(data?.token);
      await TokenStorage.setUserData(data?.user);
      await TokenStorage.setUserRole(data?.user?.role);
      dispatch(setAuthStatus(true));
      await dispatch(getCurrentUser());

      resetForm();

      if (data?.user?.role === 'user') {
        navigation.navigate('HomeScreen');
      } else {
        navigation.navigate('CreateShopScreen');
      }
    } catch (error: any) {
      const errorData = error?.message?.errors || {};
      setApiErrors({
        email: errorData.email?.[0] || '',
        password: errorData.password?.[0] || '',
      });

      ToastAndroid.show(
        error?.message?.message || 'Something went wrong. Please try again.',
        ToastAndroid.SHORT,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
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
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <Text
                className="text-center text-3xl font-bold font-poppins"
                style={{opacity: 0}}>
                Welcome Back!
              </Text>
            </LinearGradient>
          </MaskedView>

          <Text className="text-center my-2 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur.
          </Text>

          <Formik
            initialValues={{email: '', password: ''}}
            validationSchema={validationSchema}
            onSubmit={handleLogin}>
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
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="p-3 bg-gray-100">
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

                <View className="flex-row items-center my-1">
                  <TouchableOpacity
                    onPress={() => navigation.navigate('ForgetPasswordScreen')}>
                    <Text className="ml-2 text-sm text-orange-primary-80 font-poppins font-bold">
                      Forget Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  className="mt-4">
                  <LinearGradient
                    colors={['#EE6447', '#7248B3']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
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

          <Text className="text-center my-4 text-gray-600">
            --------Or Continue with--------
          </Text>

          <View className="flex-row justify-center gap-4 my-4">
            <TouchableOpacity className="p-3 w-1/2 h-24 bg-orange-primary-10 rounded-2xl">
              <Image
                source={ImagePath.google}
                className="w-14 h-14 m-auto"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity className="p-3 w-1/2 bg-orange-primary-10 rounded-2xl">
              <Image
                source={ImagePath.facebook}
                className="w-14 h-14 m-auto"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-gray-600">
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('AccountTypeScreen')}>
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
