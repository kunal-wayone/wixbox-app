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
import CheckBox from '@react-native-community/checkbox';
import {ImagePath} from '../../constants/ImagePath';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('screen');

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  username: Yup.string()
    .email('Invalid username address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const LoginScreen = () => {
  const navigaiton = useNavigation<any>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Mock API call
  const handleLogin = async (values: any, {setSubmitting, resetForm}: any) => {
    // AsyncStorage.setItem('user', 'user');
    navigaiton.navigate('CreateShopScreen');

    try {
      // Replace with your actual API endpoint
      const response = await fetch('https://api.example.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      ToastAndroid.show('Account Login successfully!', ToastAndroid.SHORT);
      resetForm();
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Something went wrong. Please try again.',
        ToastAndroid.SHORT,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // const setuser = async (role: any) => {
  //   await AsyncStorage.setItem('user', role);
  //   navigaiton.navigate('CreateShopScreen');
  // };

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
                Welcome Back!{' '}
              </Text>
            }>
            <LinearGradient
              colors={['#EE6447', '#7248B3']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <Text
                className="text-center text-3xl font-bold font-poppins"
                style={{opacity: 0}}>
                Welcome Back!{' '}
              </Text>
            </LinearGradient>
          </MaskedView>
          <Text className="text-center my-2 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur.
          </Text>

          <Formik
            initialValues={{
              username: '',
              password: '',
            }}
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
            }: any) => (
              <View className="mt-4">
                <View className="mb-3">
                  <Text className="text-sm font-medium text-gray-700 mb-1">
                    Username
                  </Text>
                  <TextInput
                    className="border border-gray-300 bg-gray-100 rounded-lg p-3 text-base"
                    placeholder="Enter your username"
                    onChangeText={handleChange('username')}
                    onBlur={handleBlur('username')}
                    value={values.username}
                  />
                  {touched.username && errors.username && (
                    <Text className="text-red-500 text-xs mt-1">
                      {errors.username}
                    </Text>
                  )}
                </View>

                <View className="mb-3">
                  <Text className="text-sm font-medium bg-gray-100 text-gray-700 mb-1">
                    Password
                  </Text>
                  <View className="flex-row items-center border border-gray-300 overflow-hidden rounded-lg">
                    <TextInput
                      className="flex-1 p-3  bg-gray-100 text-base"
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
                </View>

                <View className="flex-row items-center my-1">
                  <TouchableOpacity
                    onPress={() => navigaiton.navigate('ForgetPasswordScreen')}>
                    <Text className="ml-2 text-sm text-orange-primary-80 font-poppins font-bold ">
                      Forget Password?
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={handleSubmit}
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
                      {isSubmitting ? 'Login...' : 'Login'}
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
            <TouchableOpacity
              onPress={() => setuser('user')}
              className="p-3 w-1/2 h-24  bg-orange-primary-10 rounded-2xl">
              <Image
                source={ImagePath.google}
                className="w-14 h-14 m-auto"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setuser('owner')}
              className="p-3 w-1/2 bg-orange-primary-10 rounded-2xl">
              <Image
                source={ImagePath.facebook}
                className="w-14 h-14 m-auto"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center">
            <Text className="text-sm text-gray-600">
              Already have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() => navigaiton.navigate('SignUpScreen')}>
              <Text className="text-orange-primary-100 text-sm ml-1 underline font-bold">
                SignUp
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
