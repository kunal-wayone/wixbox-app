import React, {useState, useRef} from 'react';
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
import {ImagePath} from '../../constants/ImagePath';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('screen');

// Validation schema for 6-digit OTP
const validationSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^[0-9]{6}$/, 'OTP must be exactly 6 digits')
    .required('OTP is required'),
});

const VerifyOtpScreen = () => {
  const navigation = useNavigation<any>();
  // Refs for each OTP input box to manage focus
  const otpRefs = useRef<any>(
    Array(6)
      .fill(null)
      .map(() => React.createRef()),
  );

  // Mock API call for OTP verification
  const handleVerifyOtp = async (
    values: any,
    {setSubmitting, resetForm}: any,
  ) => {
    try {
      navigation.navigate('ResetPasswordScreen');
      // Replace with your actual API endpoint
      const response = await fetch('https://api.example.com/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp: values.otp,
        }),
      });

      if (!response.ok) {
        throw new Error('OTP verification failed');
      }

      const data = await response.json();
      ToastAndroid.show('OTP verified successfully!', ToastAndroid.SHORT);
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

  // Handle input change for OTP boxes
  const handleOtpChange = (
    index: number,
    value: string,
    setFieldValue: any,
    values: any,
  ) => {
    if (value.length === 1 && index < 5) {
      otpRefs.current[index + 1].current.focus();
    }
    if (value.length === 0 && index > 0) {
      otpRefs.current[index - 1].current.focus();
    }

    // Update the OTP value in Formik
    const otpArray = values.otp.split('');
    otpArray[index] = value;
    setFieldValue('otp', otpArray.join(''));
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
                Verify OTP
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
                Verify OTP
              </Text>
            </LinearGradient>
          </MaskedView>
          <Text
            style={{textAlign: 'center', marginVertical: 8, color: '#4B5563'}}>
            Enter the 6-digit OTP sent to your registered mobile number.
          </Text>

          <Formik
            initialValues={{
              otp: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleVerifyOtp}>
            {({
              handleSubmit,
              setFieldValue,
              values,
              errors,
              touched,
              isSubmitting,
            }: any) => (
              <View style={{marginTop: 16}}>
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Enter OTP
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    {[...Array(6)].map((_, index) => (
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
                        }}
                        placeholder="0"
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
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.otp}
                    </Text>
                  )}
                </View>
                <TouchableOpacity>
                  <Text
                    style={{
                      color: '#F97316',
                      marginLeft: 4,
                      fontSize: 14,
                      textDecorationLine: 'underline',
                      fontWeight: 'bold',
                    }}>
                    Resend Otp
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSubmit}
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

export default VerifyOtpScreen;
