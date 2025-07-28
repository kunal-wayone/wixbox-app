import React, { useState, useRef, useEffect } from 'react';
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
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImagePath } from '../../constants/ImagePath';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Post } from '../../utils/apiUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define navigation stack param list
type RootStackParamList = {
  LoginScreen: undefined;
  ForgetPasswordScreen: undefined;
  VerifyOtpScreen: { email: string };
  ResetPasswordScreen: undefined;
};

// Define navigation prop type
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Validation schema for OTP
const verifyOtpSchema = Yup.object().shape({
  otp: Yup.string()
    .length(4, 'OTP must be exactly 4 digits')
    .matches(/^\d+$/, 'OTP must contain only digits')
    .required('OTP is required'),
});
const VerifyOtpScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<any>();
  const email = route.params?.email || '';
  const [otpHint, setOtpHint] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [apiErrors, setApiErrors] = useState<{ otp: string }>({ otp: '' });
  const otpRefs = useRef<any>(
    Array(4)
      .fill(null)
      .map(() => React.createRef()),
  );
  // Load OTP hint from AsyncStorage
  useEffect(() => {
    const loadOtpHint = async () => {
      try {
        const storedOtp = await AsyncStorage.getItem('resetOtp');
        if (storedOtp) {
          const otp = JSON.parse(storedOtp);
          setOtpHint(otp);
        }
      } catch (error) {
        console.error('Failed to load OTP hint:', error);
      }
    };
    loadOtpHint();
  }, []);

  // Resend OTP timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Handle OTP verification
  const handleVerifyOtp = async (
    values: { otp: string },
    { setSubmitting, resetForm }: any,
  ) => {
    try {
      setApiErrors({ otp: '' });
      const response: any = await Post('/auth/verify-otp', {
        email,
        otp: values.otp,
      }, 5000);
      console.log(values);
      console.log(response);
      if (!response.success) {
        throw new Error(response?.message || 'OTP verification failed');
      }

      // await AsyncStorage.removeItem('resetOtp');
      // await AsyncStorage.removeItem('resetEmail');
      resetForm();
      ToastAndroid.show('OTP verified successfully!', ToastAndroid.SHORT);
      navigation.navigate('ResetPasswordScreen');
    } catch (error: any) {
      const errorMessage =
        error?.errors?.errors || 'Something went wrong. Please try again.';
      const errorData = error?.errors || {};
      setApiErrors({
        otp: errorData.otp || errorMessage,
      });
      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    try {
      setApiErrors({ otp: '' });
      const response: any = await Post('/auth/forget-password', {
        email,
      }, 5000);
      console.log(email, response);
      setOtpHint(response?.data?.otp);
      if (!response.success) {
        throw new Error(response?.message || 'Something went wrong!');
      }

      const data = response?.data;
      await AsyncStorage.setItem('resetOtp', JSON.stringify(data?.otp));
      setOtpHint(data.otp);
      setResendTimer(30);
      setCanResend(false);
      ToastAndroid.show('OTP resent successfully!', ToastAndroid.SHORT);
    } catch (error: any) {
      const errorMessage =
        error?.message || 'Something went wrong. Please try again.';
      setApiErrors({
        otp: error?.errors?.email?.[0] || errorMessage,
      });
      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
    }
  };

  const handleOtpChange = (
    index: number,
    value: string,
    setFieldValue: any,
    values: any,
  ) => {
    // Update the OTP value
    const otpArray = values.otp.split('');
    otpArray[index] = value;
    setFieldValue('otp', otpArray.join(''));

    // Handle focus navigation
    if (value.length === 1 && index < 3) {
      // Changed from index < 5 to index < 3
      otpRefs.current[index + 1].current?.focus();
    }
    if (value.length === 0 && index > 0) {
      otpRefs.current[index - 1].current?.focus();
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
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
            style={{
              position: 'absolute',
              top: '-2%',
              left: '-2%',
              width: 208,
              height: 176,
              tintColor: "#ac94f4"
            }}
            resizeMode="contain"
          />
          <View style={{ marginTop: 80 }}>
            <MaskedView
              maskElement={
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 30,
                    fontFamily: 'Raleway-Regular',
                  }}>
                  Verify OTP
                </Text>
              }>
              <LinearGradient
                colors={['#ac94f4', '#7248B3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 30,
                    fontFamily: 'Raleway-Regular',
                    opacity: 0,
                  }}>
                  Verify OTP
                </Text>
              </LinearGradient>
            </MaskedView>
            <Text
              style={{ fontFamily: 'Raleway-Regular', textAlign: 'center', marginVertical: 8, color: '#4B5563' }}>
              Enter the 4-digit OTP sent to{' '}
              <Text style={{ fontWeight: 'bold' }}>{email}</Text>.
              {otpHint && <Text style={{ fontFamily: 'Raleway-Regular' }}> Hint: OTP starts with {otpHint}</Text>}
            </Text>

            <Formik
              initialValues={{ otp: '' }}
              validationSchema={verifyOtpSchema}
              onSubmit={handleVerifyOtp}>
              {({
                handleSubmit,
                setFieldValue,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <View style={{ marginTop: 16 }}>
                  <View style={{ marginBottom: 12 }}>
                    <Text
                      className='text-center'
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: 4,
                        fontFamily: 'Raleway-Regular',
                      }}>
                      Enter OTP
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      {[...Array(4)].map((_, index) => (
                        <TextInput
                          key={index}
                          ref={otpRefs.current[index]}
                          style={{
                            borderWidth: 1,
                            borderColor: '#D1D5DB',
                            backgroundColor: '#F3F4F6',
                            borderRadius: 8,
                            width: 48,
                            height: 48,
                            textAlign: 'center',
                            fontSize: 18,
                            marginHorizontal: 4,
                            color: "#000",
                            fontFamily: 'Raleway-Regular',

                          }}
                          placeholder="0"
                          placeholderTextColor={"#000"}
                          keyboardType="number-pad"
                          maxLength={1}
                          onChangeText={(value: string) =>
                            handleOtpChange(index, value, setFieldValue, values)
                          }
                          value={values.otp[index] || ''}
                        />
                      ))}
                    </View>
                    {touched.otp && errors.otp && (
                      <Text
                        className='text-center'
                        style={{ fontFamily: 'Raleway-Regular', color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                        {errors.otp}
                      </Text>
                    )}
                    {apiErrors.otp && (
                      <Text
                        className='text-center'
                        style={{ fontFamily: 'Raleway-Regular', color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                        {apiErrors.otp}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={!canResend}
                    style={{ marginBottom: 16 }}>
                    <Text
                      style={{
                        color: canResend ? '#ac94f4' : '#ac94f4',
                        fontSize: 14,
                        textDecorationLine: 'underline',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontFamily: 'Raleway-Regular',
                      }}>
                      {canResend ? 'Resend OTP' : `Resend OTP in ${resendTimer}s`}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                    style={{ marginTop: 16 }}>
                    <LinearGradient
                      colors={['#ac94f4', '#7248B3']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        padding: 16,
                        borderRadius: 10,
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{ fontFamily: 'Raleway-Regular', color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                        {isSubmitting ? 'Verifying...' : 'Verify'}
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
              <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 14, color: '#4B5563' }}>Back to</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LoginScreen')}>
                <Text
                  style={{
                    color: '#ac94f4',
                    marginLeft: 4,
                    fontSize: 14,
                    textDecorationLine: 'underline',
                    fontFamily: 'Raleway-Regular',
                  }}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyOtpScreen;
