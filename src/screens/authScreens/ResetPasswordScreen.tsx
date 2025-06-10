import React, {useState, useEffect} from 'react';
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
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {Formik} from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import {ImagePath} from '../../constants/ImagePath';
import {useNavigation} from '@react-navigation/native';
import {Post} from '../../utils/apiUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width, height} = Dimensions.get('screen');

// Validation schema for password fields
const validationSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [email, setEmail] = useState<any>('');
  const [otp, setOtp] = useState<any>('');
  const [apiErrors, setApiErrors] = useState<any>({
    email: '',
    password: '',
  });

  // Load OTP hint from AsyncStorage
  useEffect(() => {
    const loadEmailHint = async () => {
      try {
        const storedEmail: any = await AsyncStorage.getItem('resetEmail');
        const storedOtp: any = await AsyncStorage.getItem('resetOtp');
        if (storedEmail) {
          const email = JSON.parse(storedEmail);
          const otp = JSON.parse(storedOtp);
          setEmail(email);
          setOtp(otp);
        }
      } catch (error) {
        console.error('Failed to load OTP hint:', error);
      }
    };
    loadEmailHint();
  }, []);

  // Mock API call for resetting password
  // const handleResetPassword = async (
  //   values: any,
  //   {setSubmitting, resetForm}: any,
  // ) => {
  //   // navigation.navigate('LoginScreen');
  //   try {
  //     // Replace with your actual API endpoint
  //     setShowSuccessModal(true); // Show success modal
  //     const response = await fetch('https://api.example.com/reset-password', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         password: values.password,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Password reset failed');
  //     }

  //     const data = await response.json();
  //     resetForm();
  //   } catch (error: any) {
  //     ToastAndroid.show(
  //       error.message || 'Something went wrong. Please try again.',
  //       ToastAndroid.SHORT,
  //     );
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleResetPassword = async (
    values: {password: string; confirmPassword: string},
    {setSubmitting, resetForm}: any,
  ) => {
    try {
      setApiErrors({password: '', confirmPassword: ''});
      const response: any = await Post(
        '/auth/reset-password',
        {
          email,
          password: values?.confirmPassword,
        },
        5000,
      );
      console.log(values);
      console.log(response);
      if (!response.success) {
        throw new Error(response?.message || 'OTP verification failed');
      }

      await AsyncStorage.removeItem('resetOtp');
      await AsyncStorage.removeItem('resetEmail');
      resetForm();
      ToastAndroid.show('OTP verified successfully!', ToastAndroid.SHORT);
      setShowSuccessModal(true)
      // navigation.navigate('ResetPasswordScreen');
    } catch (error: any) {
      console.log(error?.errors);
      const errorMessage =
        error?.message || 'Something went wrong. Please try again.';
      const errorData = error?.errors || {};
      setApiErrors({
        eamil: errorData?.email[0] || errorMessage,
        password: errorData?.password[0] || errorMessage,
      });
      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-close modal after 3 seconds
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
        navigation.navigate('LoginScreen');
      }, 3000); // Modal closes after 3 seconds
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [showSuccessModal]);

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
                Reset Password
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
                Reset Password
              </Text>
            </LinearGradient>
          </MaskedView>
          <Text
            style={{textAlign: 'center', marginVertical: 8, color: '#4B5563'}}>
            Enter and confirm your new password.
          </Text>

          <Formik
            initialValues={{
              password: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleResetPassword}>
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
                    New Password
                  </Text>
                  <View style={{position: 'relative'}}>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        backgroundColor: '#F3F4F6',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                      }}
                      placeholder="Enter new password"
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={{position: 'absolute', right: 12, top: 12}}
                      onPress={() => setShowPassword(!showPassword)}>
                      <Icon
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#4B5563"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.password}
                    </Text>
                  )}
                  {apiErrors?.password && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {apiErrors?.password}
                    </Text>
                  )}
                </View>

                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Confirm Password
                  </Text>
                  <View style={{position: 'relative'}}>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        backgroundColor: '#F3F4F6',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 16,
                      }}
                      placeholder="Re-enter password"
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      value={values.confirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      style={{position: 'absolute', right: 12, top: 12}}
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }>
                      <Icon
                        name={showConfirmPassword ? 'eye-off' : 'eye'}
                        size={20}
                        color="#4B5563"
                      />
                    </TouchableOpacity>
                  </View>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.confirmPassword}
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
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
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

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
          }}>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 12,
              padding: 24,
              alignItems: 'center',
              width: width * 0.8,
            }}>
            <LinearGradient
              colors={['#EE6447', '#7248B3']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={{
                padding: 10,
                borderRadius: 999,
                alignItems: 'center',
              }}>
              <Image
                source={ImagePath.stars}
                className="absolute left-[-15%] top-0 w-8 h-8"
                resizeMode="contain"
              />

              <Icon name="checkmark" size={45} color={'#fff'} />
              <Image
                source={ImagePath.stars}
                className="absolute right-[-15%] bottom-0 w-8 h-8"
                resizeMode="contain"
              />
            </LinearGradient>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: '#1F2937',
                marginTop: 16,
                textAlign: 'center',
              }}>
              Thank You!
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#4B5563',
                marginTop: 8,
                textAlign: 'center',
              }}>
              Your password has been reset successfully.
            </Text>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;
