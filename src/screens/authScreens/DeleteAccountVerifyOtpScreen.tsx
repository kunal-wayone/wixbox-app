import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  Modal,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fetch, Post } from '../../utils/apiUtils';

const { width, height } = Dimensions.get('screen');

// Validation schema for 6-digit OTP
const validationSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^[0-9]{6}$/, 'OTP must be exactly 6 digits')
    .required('OTP is required'),
});

const DeleteAccountVerifyOtpScreen = () => {
  const navigation = useNavigation<any>();
  const route: any = useRoute();
  const email = route.params?.email
  const [modalVisible, setModalVisible] = useState(false);
  // Refs for each OTP input box to manage focus
  const otpRefs = useRef<any>(
    Array(6)
      .fill(null)
      .map(() => React.createRef()),
  );

  // Mock API call for OTP verification
  const handleVerifyOtp = async (
    values: any,
    { setSubmitting, resetForm }: any,
  ) => {
    try {
      setModalVisible(true); // Show success modal

      // Replace with your actual API endpoint
      const response: any = await Post('/user/delete-profile', { otp: values.otp, }, 5000);
      console.log(response)
      if (!response.success) {
        throw new Error('OTP verification failed');
      }
      const data = await response?.data;
      setModalVisible(true); // Show success modal
      resetForm();
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Something went wrong. Please try again.',
        ToastAndroid.SHORT,
      );
    } finally {
      setSubmitting(false);
    }
  };


  const reSendOtp = async (
    values: any,
    { setSubmitting, resetForm }: any,
  ) => {
    try {
      // Replace with your actual API endpoint for sending OTP
      const response: any = await Post('/user/send-delete-otp', { email: email }, 5000);
      console.log(response)
      if (!response.success) {
        throw new Error('Failed to send OTP');
      }

      ToastAndroid.show('OTP sent successfully!', ToastAndroid.SHORT);
      resetForm();
      // Optionally navigate to OTP verification screen
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
    index: any,
    value: any,
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
          {/* Header with Back Button and Title */}
          <View className="flex-row items-center border-gray-200">
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 80 }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                fontFamily: 'Raleway-Regular',
              }}>
              Verify OTP
            </Text>

            <Text
              style={{ fontFamily: 'Raleway-Regular', textAlign: 'center', marginVertical: 8, color: '#4B5563' }}>
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
                setSubmitting,
                resetForm,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <View style={{ marginTop: 16 }}>
                  <View style={{ marginBottom: 12 }}>
                    <Text
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
                        justifyContent: 'space-between',
                      }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
                        {[...Array(6)].map((_, index) => (
                          <TextInput
                            key={index}
                            ref={(ref) => (otpRefs.current[index] = ref!)}
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
                              fontFamily: 'Raleway-Regular',
                            }}
                            placeholder="_"
                            placeholderTextColor={'gray'}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={values.otp[index] || ''}
                            onChangeText={(value) => {
                              const otpArray = values.otp.split('');
                              otpArray[index] = value;

                              const updatedOtp = otpArray.join('');
                              setFieldValue('otp', updatedOtp);

                              if (value && index < 5) {
                                otpRefs.current[index + 1]?.focus();
                              }
                            }}
                            onKeyPress={({ nativeEvent }) => {
                              if (nativeEvent.key === 'Backspace') {
                                const otpArray = values.otp.split('');
                                if (!values.otp[index] && index > 0) {
                                  otpRefs.current[index - 1]?.focus();
                                  otpArray[index - 1] = '';
                                  setFieldValue('otp', otpArray.join(''));
                                } else {
                                  otpArray[index] = '';
                                  setFieldValue('otp', otpArray.join(''));
                                }
                              }
                            }}
                          />
                        ))}
                      </View>
                    </View>
                    {touched.otp && errors.otp && (
                      <Text
                        style={{ fontFamily: 'Raleway-Regular', color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                        {errors.otp}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => reSendOtp(values, { setSubmitting, resetForm })}>
                    <Text
                      className="text-primary-80"
                      style={{
                        marginLeft: 4,
                        fontSize: 14,
                        textDecorationLine: 'underline',
                        fontFamily: 'Raleway-Bold',
                      }}>
                      Resend Otp
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                    style={{ marginTop: 16 }}>
                    <Text
                      className="text-center bg-primary-80 p-4 rounded-xl"
                      style={{ fontFamily: 'Raleway-Regular', color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                      {isSubmitting ? 'Verifying...' : 'Verify'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>

        {/* Success Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            navigation.navigate('RegisterScreen');
          }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 20,
                width: width * 0.8,
                alignItems: 'center',
              }}>
              <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
              <Text
                style={{
                  fontSize: 18,
                  marginVertical: 12,
                  textAlign: 'center',
                  fontFamily: 'Raleway-Bold',
                }}>
                OTP Verified Successfully!
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#4B5563',
                  textAlign: 'center',
                  marginBottom: 16,
                  fontFamily: 'Raleway-Regular',
                }}>
                Your OTP has been verified. You will be redirected to the Register
                screen.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('SignUpScreen');
                }}
                style={{
                  backgroundColor: '#22C55E',
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 8,
                }}>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    fontFamily: 'Raleway-Bold',
                  }}>
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DeleteAccountVerifyOtpScreen;
