import React, {useState} from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ImagePath} from '../../constants/ImagePath';
import {Post} from '../../utils/apiUtils';

// Define navigation stack param list (adjust according to your app's navigation)
type RootStackParamList = {
  LoginScreen: undefined;
  OtpVerificationScreen: {email: string}; // Example for OTP screen
};

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgetPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [apiErrors, setApiErrors] = useState<{email: string}>({email: ''});

  // Handle sending OTP
  const handleSendOtp = async (
    values: {email: string},
    {setSubmitting, resetForm}: any,
  ) => {
    try {
      setApiErrors({email: ''}); // Reset API errors
      const response: any = await Post(
        '/auth/forget-password',
        {
          email: values.email,
        },
        5000,
      );
      console.log(values, response);
      if (!response.success) {
        throw new Error(response?.message || 'Something went wrong!');
      }

      const data = response?.data;
      // Store OTP or relevant data (adjust key and value as needed)
      await AsyncStorage.setItem('resetOtp', JSON.stringify(data?.otp));
      await AsyncStorage.setItem('resetEmail', JSON.stringify(values?.email));

      // Navigate to OTP verification screen
      navigation.navigate('VerifyOtpScreen', {email: values.email});

      resetForm();
      ToastAndroid.show('OTP sent successfully!', ToastAndroid.SHORT);
    } catch (error: any) {
      const errorMessage =
        error?.message || 'Something went wrong. Please try again.';
      const errorData = error?.errors || {};
      setApiErrors({
        email: errorData.email?.[0] || errorMessage,
      });
      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
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
          style={{
            position: 'absolute',
            top: '-2%',
            left: '-2%',
            width: 208,
            height: 176,
          }}
          resizeMode="contain"
        />
        <View style={{marginTop: 80}}>
          <MaskedView
            maskElement={
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 30,
                  fontWeight: 'bold',
                  fontFamily: 'Poppins',
                }}>
                Forget Password
              </Text>
            }>
            <LinearGradient
              colors={['#EE6447', '#7248B3']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 30,
                  fontWeight: 'bold',
                  fontFamily: 'Poppins',
                  opacity: 0,
                }}>
                Forget Password
              </Text>
            </LinearGradient>
          </MaskedView>
          <Text
            style={{textAlign: 'center', marginVertical: 8, color: '#4B5563'}}>
            Enter your registered email to receive an OTP.
          </Text>

          <Formik
            initialValues={{email: ''}}
            validationSchema={validationSchema}
            onSubmit={handleSendOtp}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View style={{marginTop: 16}}>
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Email
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                    }}
                    placeholder="Enter your email address"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {touched.email && errors.email && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.email}
                    </Text>
                  )}
                  {apiErrors.email && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {apiErrors.email}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  style={{marginTop: 16}}>
                  <LinearGradient
                    colors={['#EE6447', '#7248B3']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={{
                      padding: 16,
                      borderRadius: 10,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
                      {isSubmitting ? 'Sending...' : 'Send OTP'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 16,
            }}>
            <Text style={{fontSize: 14, color: '#4B5563'}}>Back to</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('LoginScreen')}>
              <Text
                style={{
                  color: '#F97316',
                  marginLeft: 4,
                  fontSize: 14,
                  textDecorationLine: 'underline',
                  fontWeight: 'bold',
                }}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgetPasswordScreen;
