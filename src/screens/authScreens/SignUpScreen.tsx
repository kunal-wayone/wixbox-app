import React, {useState} from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
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
  fullName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
    .required('Confirm Password is required'),
});

const SignUpScreen = () => {
  const navigation = useNavigation<any>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  // Mock API call
  const handleSignUp = async (values: any, {setSubmitting, resetForm}: any) => {
    if (!isCheck) {
      ToastAndroid.show('Please Check Terms & Condition', ToastAndroid.SHORT);
      return null;
    }
    navigation.navigate('CreateShopScreen');
    try {
      // Replace with your actual API endpoint
      const response = await fetch('https://api.example.com/signup', {
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
        throw new Error('Registration failed');
      }

      const data = await response.json();
      Alert.alert('Success', 'Account created successfully!');
      resetForm();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Something went wrong. Please try again.',
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

          backgroundColor: '#fff',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View className="p-4">
          <Image
            source={ImagePath.signBg}
            className="absolute -top-[2%] -left-[2%] w-52 h-44"
            resizeMode="contain"
          />
          <View className="mt-20">
            <MaskedView
              maskElement={
                <Text className="text-center text-3xl font-bold font-poppins">
                  Create an Account
                </Text>
              }>
              <LinearGradient
                colors={['#EE6447', '#7248B3']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                <Text
                  className="text-center text-3xl font-bold font-poppins"
                  style={{opacity: 0}}>
                  Create an Account
                </Text>
              </LinearGradient>
            </MaskedView>
            <Text className="text-center my-2 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur.
            </Text>

            <Formik
              initialValues={{
                fullName: '',
                email: '',
                password: '',
                confirmPassword: '',
                agreeTerms: false,
              }}
              validationSchema={validationSchema}
              onSubmit={handleSignUp}>
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
                      Full Name
                    </Text>
                    <TextInput
                      className="border border-gray-300 bg-gray-100 rounded-lg p-3 text-base"
                      placeholder="Enter your full name"
                      onChangeText={handleChange('fullName')}
                      onBlur={handleBlur('fullName')}
                      value={values.fullName}
                    />
                    {touched.fullName && errors.fullName && (
                      <Text className="text-red-500 text-xs mt-1">
                        {errors.fullName}
                      </Text>
                    )}
                  </View>

                  <View className="mb-3">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Email Address
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
                  </View>

                  <View className="mb-3">
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Create Password
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

                  <View>
                    <Text className="text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </Text>
                    <View className="flex-row items-center bg-gray-100 border border-gray-300 overflow-hidden rounded-lg">
                      <TextInput
                        className="flex-1 p-3 text-base"
                        placeholder="Confirm your password"
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        value={values.confirmPassword}
                        secureTextEntry={!showConfirmPassword}
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="p-3 bg-gray-100">
                        <Icon
                          name={showConfirmPassword ? 'eye-off' : 'eye'}
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text className="text-red-500 text-xs mt-1">
                        {errors.confirmPassword}
                      </Text>
                    )}
                  </View>

                  <View className="flex-row items-center my-3">
                    <CheckBox
                      value={isCheck}
                      onValueChange={va => {
                        setIsCheck(va);
                        handleChange('agreeTerms');
                        console.log(va, isCheck, values.agreeTerms);
                      }}
                      tintColors={{true: '#7248B3', false: '#666'}}
                    />
                    <Text className="ml-2 text-sm text-gray-600">
                      Agree to all terms & conditions
                    </Text>
                  </View>

                  {touched.agreeTerms && !isCheck && (
                    <Text className="text-red-500 text-xs mb-3">
                      {'Please check agree terms & conditions'}
                    </Text>
                  )}
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
                        {isSubmitting ? 'Creating...' : 'Create Account'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            <Text className="text-center my-4 text-gray-600">
              --------Or Continue with--------
            </Text>

            <View className="flex-row justify-center gap-4 mb-4">
              <TouchableOpacity className="p-3 w-1/2  bg-orange-primary-10 rounded-2xl">
                <Image
                  source={ImagePath.google}
                  className="w-8 h-8 m-auto"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity className="p-3 w-1/2 bg-orange-primary-10 rounded-2xl">
                <Image
                  source={ImagePath.facebook}
                  className="w-8 h-8 m-auto"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center items-center mb-4">
              <Text className="text-sm text-gray-600">
                Already have an account?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}>
                <Text className="text-orange-primary-100 text-sm ml-1 font-bold underline">
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
