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
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('screen');

// Validation schema for 6-digit OTP
const validationSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^[0-9]{6}$/, 'OTP must be exactly 6 digits')
    .required('OTP is required'),
});

const DeleteAccountVerifyOtpScreen = () => {
  const navigation = useNavigation<any>();
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
      setModalVisible(true); // Show success modal
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
                fontFamily: 'Poppins',
              }}>
              Verify OTP
            </Text>

            <Text
              style={{ textAlign: 'center', marginVertical: 8, color: '#4B5563' }}>
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
              }) => (
                <View style={{ marginTop: 16 }}>
                  <View style={{ marginBottom: 12 }}>
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
                          onChangeText={value =>
                            handleOtpChange(index, value, setFieldValue, values)
                          }
                          value={values.otp[index] || ''}
                        />
                      ))}
                    </View>
                    {touched.otp && errors.otp && (
                      <Text
                        style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                        {errors.otp}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity>
                    <Text
                      className="text-primary-80"
                      style={{
                        marginLeft: 4,
                        fontSize: 14,
                        textDecorationLine: 'underline',
                        fontWeight: 'bold',
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
                      style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
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
                  fontWeight: 'bold',
                  marginVertical: 12,
                  textAlign: 'center',
                }}>
                OTP Verified Successfully!
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#4B5563',
                  textAlign: 'center',
                  marginBottom: 16,
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
                    fontWeight: 'bold',
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
