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
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Post } from '../../utils/apiUtils';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
});

const DeleteAccountScreen = () => {
  const navigation = useNavigation<any>();

  // Mock API call for sending OTP
  const handleSendOtp = async (
    values: any,
    { setSubmitting, resetForm }: any,
  ) => {
    try {
      // Replace with your actual API endpoint for sending OTP
      const response: any = await Post('/user/send-delete-otp', { email: values.email }, 5000);
      console.log(response)
      if (!response.success) {
        throw new Error('Failed to send OTP');
      }

      ToastAndroid.show('OTP sent successfully!', ToastAndroid.SHORT);
      resetForm();
      // Optionally navigate to OTP verification screen
      navigation.navigate('DeleteAccountVerifyOtpScreen', { email: values.email });
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
          <View style={{ marginTop: 10 }}>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 20,
                fontWeight: 'bold',
                fontFamily: 'Raleway-Regular',
                color: '#374151',

              }}>
              Delete Account
            </Text>
            <Text
              style={{ fontFamily: 'Raleway-Regular', textAlign: 'center', marginVertical: 8, color: '#4B5563' }}>
              Enter your email to receive an OTP for account deletion.
            </Text>

            <Formik
              initialValues={{
                email: '',
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
                <View style={{ marginTop: 16 }}>
                  {/* email  */}
                  <View style={{ marginBottom: 12 }}>
                    <Text
                      style={{
                        fontFamily: 'Raleway-Regular',
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: 4,
                      }}>
                      Email Id
                    </Text>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        backgroundColor: '#F3F4F6',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                        fontFamily: 'Raleway-Regular',
                      }}
                      placeholder="Enter email id"
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      value={values.email}
                    />
                    {touched.email && errors.email && (
                      <Text
                        style={{ fontFamily: 'Raleway-Regular', color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                        {errors.email}
                      </Text>
                    )}
                  </View>

                  {/* Send OTP Button */}
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: isSubmitting ? '#ac94f4' : '#ac94f4',
                      padding: 16,
                      borderRadius: 10,
                      alignItems: 'center',
                      marginTop: 16,
                    }}>
                    <Text
                      style={{ fontFamily: 'Raleway-Regular', color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                      {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DeleteAccountScreen;
