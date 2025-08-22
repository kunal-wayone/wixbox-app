import React, { useState, useCallback, memo } from 'react';
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
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import CheckBox from '@react-native-community/checkbox';
import { ImagePath } from '../../constants/ImagePath';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { googleAuth, signup } from '../../store/slices/authSlice';
import { fetchUser } from '../../store/slices/userSlice';
import { getFcmToken } from '../../utils/notification/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('screen');

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

interface FormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ApiError {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

// Reusable Input Component
const InputField = memo(
  ({
    label,
    placeholder,
    value,
    onChangeText,
    onBlur,
    error,
    touched,
    secureTextEntry,
    toggleSecureText,
    keyboardType,
    disabled,
  }: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    onBlur: () => void;
    error?: string;
    touched?: boolean;
    secureTextEntry?: boolean;
    toggleSecureText?: () => void;
    keyboardType?: string;
    disabled?: boolean;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#666"
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
          editable={!disabled}
          accessibilityLabel={label}
        />
        {toggleSecureText && (
          <TouchableOpacity
            onPress={toggleSecureText}
            style={styles.iconButton}
            disabled={disabled}
            accessibilityLabel={secureTextEntry ? 'Show password' : 'Hide password'}
          >
            <Icon name={secureTextEntry ? 'eye' : 'eye-off'} size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
      {touched && error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
);

const SignUpScreen = ({ route }: { route: any }) => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const { accountType } = route.params || {};
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheck, setIsCheck] = useState(false);
  const [apiErrors, setApiErrors] = useState<ApiError>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = useCallback(
    async (values: FormValues, { setSubmitting, resetForm, setErrors }: any) => {
      if (!isCheck) {
        ToastAndroid.show('Please accept the Terms & Conditions.', ToastAndroid.SHORT);
        setSubmitting(false);
        return;
      }

      setIsLoading(true);
      try {
        if (!accountType) {
          throw new Error('Account type is required');
        }

        const payload = {
          name: values.fullName,
          email: values.email,
          password: values.password,
          password_confirmation: values.confirmPassword,
          role: accountType,
          fcm_token: await getFcmToken(),
        };

        const response = await dispatch(signup(payload)).unwrap();
        if (!response.success) {
          throw new Error(response.message || 'Registration failed');
        }

        await dispatch(fetchUser()).unwrap();

        resetForm();
        setApiErrors({});
        ToastAndroid.show(response.message || 'Account created successfully!', ToastAndroid.LONG);

        navigation.navigate(response.user?.role === 'user' ? 'HomeScreen' : 'CreateShopScreen');
      } catch (error: any) {
        const errorData = error?.errors || {};
        setApiErrors({
          name: errorData.name?.[0] || '',
          email: errorData.email?.[0] || '',
          password: errorData.password?.[0] || '',
          password_confirmation: errorData.password_confirmation?.[0] || '',
        });
        setErrors(errorData);
        ToastAndroid.show(error.message || 'Registration failed. Please try again.', ToastAndroid.LONG);
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
    [isCheck, accountType, dispatch, navigation]
  );

  const handleGoogleSignUp = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!accountType) {
        throw new Error('Account type is required');
      }

      const payload = { role: accountType };
      const response = await dispatch(googleAuth(payload)).unwrap();

      if (!response.success) {
        throw new Error(response.message || 'Google registration failed');
      }

      await dispatch(fetchUser()).unwrap();
      ToastAndroid.show(response.message || 'Account created successfully!', ToastAndroid.LONG);

      navigation.navigate(response.user?.role === 'user' ? 'HomeScreen' : 'CreateShopScreen');
    } catch (error: any) {
      setApiErrors({
        name: error?.errors?.name?.[0] || '',
        email: error?.errors?.email?.[0] || '',
        password: error?.errors?.password?.[0] || '',
        password_confirmation: error?.errors?.password_confirmation?.[0] || '',
      });
      ToastAndroid.show(error.message || 'Google registration failed. Please try again.', ToastAndroid.LONG);
    } finally {
      setIsLoading(false);
    }
  }, [accountType, dispatch, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.padding}>
            <Image
              source={ImagePath.signBg}
              style={[styles.backgroundImage, { tintColor: '#ac94f4' }]}
              resizeMode="contain"
            />
            <View style={styles.content}>
              <MaskedView
                maskElement={<Text style={styles.title}>Create an Account</Text>}
              >
                <LinearGradient
                  colors={['#ac94f4', '#7248B3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.title, { opacity: 0 }]}>Create an Account</Text>
                </LinearGradient>
              </MaskedView>
              <Text style={styles.subtitle}>Create your account to get started</Text>

              <Formik
                initialValues={{
                  fullName: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSignUp}
              >
                {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
                  <View style={styles.form}>
                    <InputField
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={values.fullName}
                      onChangeText={handleChange('fullName')}
                      onBlur={handleBlur('fullName')}
                      error={errors.fullName || apiErrors.name}
                      touched={touched.fullName}
                      disabled={isLoading || isSubmitting}
                    />
                    <InputField
                      label="Email Address"
                      placeholder="Enter your email"
                      value={values.email}
                      onChangeText={handleChange('email')}
                      onBlur={handleBlur('email')}
                      error={errors.email || apiErrors.email}
                      touched={touched.email}
                      keyboardType="email-address"
                      disabled={isLoading || isSubmitting}
                    />
                    <InputField
                      label="Create Password"
                      placeholder="Enter your password"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      error={errors.password || apiErrors.password}
                      touched={touched.password}
                      secureTextEntry={!showPassword}
                      toggleSecureText={() => setShowPassword(!showPassword)}
                      disabled={isLoading || isSubmitting}
                    />
                    <InputField
                      label="Confirm Password"
                      placeholder="Confirm your password"
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      error={errors.confirmPassword || apiErrors.password_confirmation}
                      touched={touched.confirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      toggleSecureText={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading || isSubmitting}
                    />
                    <View style={styles.checkboxContainer}>
                      <CheckBox
                        value={isCheck}
                        onValueChange={setIsCheck}
                        tintColors={{ true: '#7248B3', false: '#666' }}
                        disabled={isLoading || isSubmitting}
                        accessibilityLabel="Accept Terms & Conditions"
                      />
                      <Text style={styles.checkboxText}>
                        I agree to the Terms & Conditions
                      </Text>
                    </View>
                    {!isCheck && touched.confirmPassword && (
                      <Text style={styles.errorText}>
                        Please accept the Terms & Conditions
                      </Text>
                    )}
                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      disabled={isLoading || isSubmitting}
                      style={styles.submitButton}
                      accessibilityLabel="Create Account"
                    >
                      <LinearGradient
                        colors={['#ac94f4', '#7248B3']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.gradientButton, { opacity: isLoading || isSubmitting ? 0.7 : 1 }]}
                      >
                        <Text style={styles.buttonText}>Create Account</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>

              <Text style={styles.divider}>-------- Or Continue with --------</Text>

              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleSignUp}
                  disabled={isLoading}
                  accessibilityLabel="Sign up with Google"
                >
                  <Image
                    source={ImagePath.google}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.loginPrompt}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('LoginScreen')}
                  disabled={isLoading}
                  accessibilityLabel="Navigate to Login"
                >
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Creating Account...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  padding: {
    padding: 16,
  },
  backgroundImage: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 208,
    height: 176,
  },
  content: {
    marginTop: 80,
  },
  title: {
    fontFamily: 'Raleway-Regular',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Raleway-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 8,
  },
  form: {
    marginTop: 16,
  },
  inputContainer: {
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Raleway-Regular',
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    fontFamily: 'Raleway-Regular',
    fontSize: 16,
    color: '#333',
  },
  iconButton: {
    padding: 12,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 12,
    color: '#e53e3e',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 16,
  },
  gradientButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    fontFamily: 'Raleway-Regular',
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  socialButton: {
    padding: 12,
    width: width * 0.4,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    alignItems: 'center',
  },
  socialIcon: {
    width: 32,
    height: 32,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontFamily: 'Raleway-Regular',
    fontSize: 14,
    color: '#7248B3',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    fontFamily: 'Raleway-Regular',
    fontSize: 16,
    color: '#fff',
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;