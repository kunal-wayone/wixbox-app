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
import {ImagePath} from '../../constants/ImagePath';
import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('screen');

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Must be a valid 10-digit mobile number')
    .required('Mobile number is required'),
});

const ForgetPasswordScreen = () => {
  const navigation = useNavigation<any>();
  // Mock API call for sending OTP
  const handleSendOtp = async (
    values: any,
    {setSubmitting, resetForm}: any,
  ) => {
    try {
      navigation.navigate("VerifyOtpScreen")
      // Replace with your actual API endpoint
      const response = await fetch('https://api.example.com/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: values.mobile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      const data = await response.json();
      ToastAndroid.show('OTP sent successfully!', ToastAndroid.SHORT);
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
            Enter your registered mobile number to receive an OTP.
          </Text>

          <Formik
            initialValues={{
              mobile: '',
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
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Mobile Number
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
                    placeholder="Enter your mobile number"
                    onChangeText={handleChange('mobile')}
                    onBlur={handleBlur('mobile')}
                    value={values.mobile}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                  {touched.mobile && errors.mobile && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.mobile}
                    </Text>
                  )}
                </View>

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
            <TouchableOpacity onPress={()=>navigation.navigate("LoginScreen")}>
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
