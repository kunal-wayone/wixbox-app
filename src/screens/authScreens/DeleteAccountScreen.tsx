import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
});

const DeleteAccountScreen = () => {
  const navigation = useNavigation<any>();

  // Mock API call for sending OTP
  const handleSendOtp = async (
    values: any,
    {setSubmitting, resetForm}: any,
  ) => {
    navigation.navigate('DeleteAccountVerifyOtpScreen');
    try {
      // Replace with your actual API endpoint for sending OTP
      const response = await fetch('https://api.example.com/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({phoneNumber: values.phoneNumber}),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      ToastAndroid.show('OTP sent successfully!', ToastAndroid.SHORT);
      resetForm();
      // Optionally navigate to OTP verification screen
      // navigation.navigate('VerifyOtpScreen', { phoneNumber: values.phoneNumber });
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Something went wrong. Please try again.',
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
        {/* Header with Back Button and Title */}
        <View className="flex-row items-center border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={{marginTop: 10}}>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'Poppins',
              color: '#374151',
            }}>
            Delete Account
          </Text>
          <Text
            style={{textAlign: 'center', marginVertical: 8, color: '#4B5563'}}>
            Enter your phone number to receive an OTP for account deletion.
          </Text>

          <Formik
            initialValues={{
              phoneNumber: '',
            }}
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
            }: any) => (
              <View style={{marginTop: 16}}>
                {/* Phone Number */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Phone Number
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
                    placeholder="Enter phone number"
                    onChangeText={handleChange('phoneNumber')}
                    onBlur={handleBlur('phoneNumber')}
                    value={values.phoneNumber}
                    maxLength={10}
                    keyboardType="numeric"
                  />
                  {touched.phoneNumber && errors.phoneNumber && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.phoneNumber}
                    </Text>
                  )}
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? '#B68AD480' : '#B68AD4',
                    padding: 16,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginTop: 16,
                  }}>
                  <Text
                    style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
                    {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default DeleteAccountScreen;
