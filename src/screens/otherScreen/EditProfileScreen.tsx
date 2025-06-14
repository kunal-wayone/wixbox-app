import React, {useEffect, useState} from 'react';
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
import {Fetch, Post, TokenStorage} from '../../utils/apiUtils'; // Ensure this utility is properly implemented
import LoadingComponent from './LoadingComponent';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  dateOfBirth: Yup.string()
    .required('Date of birth is required')
    .matches(
      /^\d{2}\/\d{2}\/\d{4}$/,
      'Date of birth must be in DD/MM/YYYY format',
    ),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
  gender: Yup.string().required('Gender is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  homeAddress: Yup.string()
    .required('Home address is required')
    .min(5, 'Address must be at least 5 characters'),
  shopAddress: Yup.string()
    .required('Shop address is required')
    .min(5, 'Address must be at least 5 characters'),
});

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const user = await TokenStorage.getUserData();
        if (user) {
          setUserData(user);
        } else {
          ToastAndroid.show('Failed to load user data', ToastAndroid.SHORT);
        }
      } catch (error) {
        ToastAndroid.show('Error loading user data', ToastAndroid.SHORT);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle profile update with proper error handling and state management
  const handleUpdateProfile = async (
    values: any,
    {setSubmitting, resetForm}: any,
  ) => {
    try {
      setSubmitting(true);

      // Replace with your actual API endpoint
      const response: any = await Post('/user/update-profile', values, 5000);
      console.log(response, values);
      if (!response.success) {
        const errorData = await response?.data;
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Update local user data
      const updatedUser = await response?.data;
      await TokenStorage.setUserData(updatedUser); // Save updated data to storage
      setUserData(updatedUser); // Update local state

      ToastAndroid.show('Profile updated successfully!', ToastAndroid.SHORT);
      resetForm({values: updatedUser}); // Reset form with updated values
      navigation.goBack();
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Something went wrong. Please try again.',
        ToastAndroid.LONG,
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingComponent />;
  }

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
          <Text
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'Poppins',
              color: '#374151',
            }}>
            Edit Profile
          </Text>
          <View className="p-2" style={{width: 40}} />{' '}
          {/* Spacer for centering */}
        </View>

        <Formik
          enableReinitialize // Allow form to reinitialize when userData changes
          initialValues={{
            fullName: userData?.name || '',
            dateOfBirth: userData?.dob || '',
            phoneNumber: userData?.phone || '',
            gender: userData?.gender || '',
            email: userData?.email || '',
            homeAddress: userData?.homeAddress || '',
            shopAddress: userData?.shopAddress || '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleUpdateProfile}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
            isSubmitting,
          }: any) => (
            <View style={{marginTop: 16}}>
              {/* Full Name */}
              <View style={{marginBottom: 12}}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: 4,
                  }}>
                  Full Name
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor:
                      touched.fullName && errors.fullName
                        ? '#EF4444'
                        : '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                  }}
                  placeholder="Enter full name"
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  value={values.fullName}
                />
                {touched.fullName && errors.fullName && (
                  <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                    {errors.fullName}
                  </Text>
                )}
              </View>

              {/* Date of Birth */}
              <View style={{marginBottom: 12}}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: 4,
                  }}>
                  Date of Birth (DD/MM/YYYY)
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor:
                      touched.dateOfBirth && errors.dateOfBirth
                        ? '#EF4444'
                        : '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                  }}
                  placeholder="DD/MM/YYYY"
                  onChangeText={handleChange('dateOfBirth')}
                  onBlur={handleBlur('dateOfBirth')}
                  value={values.dateOfBirth}
                />
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                    {errors.dateOfBirth}
                  </Text>
                )}
              </View>

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
                    borderColor:
                      touched.phoneNumber && errors.phoneNumber
                        ? '#EF4444'
                        : '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                  }}
                  placeholder="Enter phone number"
                  onChangeText={handleChange('phoneNumber')}
                  onBlur={handleBlur('phoneNumber')}
                  value={values.phoneNumber}
                  keyboardType="numeric"
                  maxLength={10}
                />
                {touched.phoneNumber && errors.phoneNumber && (
                  <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                    {errors.phoneNumber}
                  </Text>
                )}
              </View>

              {/* Gender Radio Group */}
              <View style={{marginBottom: 12}}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: 4,
                  }}>
                  Gender
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}>
                  {['Male', 'Female', 'Other'].map(gender => (
                    <TouchableOpacity
                      key={gender}
                      onPress={() => setFieldValue('gender', gender)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 8,
                      }}>
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 8,
                        }}>
                        {values.gender === gender && (
                          <View
                            style={{
                              height: 12,
                              width: 12,
                              borderRadius: 6,
                              backgroundColor: '#B68AD4',
                            }}
                          />
                        )}
                      </View>
                      <Text style={{fontSize: 16, color: '#374151'}}>
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.gender && errors.gender && (
                  <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                    {errors.gender}
                  </Text>
                )}
              </View>

              {/* Email Address */}
              <View style={{marginBottom: 12}}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: 4,
                  }}>
                  Email Address
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor:
                      touched.email && errors.email ? '#EF4444' : '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                  }}
                  placeholder="Enter email address"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && (
                  <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                    {errors.email}
                  </Text>
                )}
              </View>

              {/* Home Address */}
              <View style={{marginBottom: 12}}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: 4,
                  }}>
                  Home Address
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor:
                      touched.homeAddress && errors.homeAddress
                        ? '#EF4444'
                        : '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    minHeight: 100,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Enter home address"
                  onChangeText={handleChange('homeAddress')}
                  onBlur={handleBlur('homeAddress')}
                  value={values.homeAddress}
                  multiline
                />
                {touched.homeAddress && errors.homeAddress && (
                  <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                    {errors.homeAddress}
                  </Text>
                )}
              </View>

              {/* Shop Address */}
              <View style={{marginBottom: 12}}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: 4,
                  }}>
                  Shop Address
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor:
                      touched.shopAddress && errors.shopAddress
                        ? '#EF4444'
                        : '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    minHeight: 100,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Enter shop address"
                  onChangeText={handleChange('shopAddress')}
                  onBlur={handleBlur('shopAddress')}
                  value={values.shopAddress}
                  multiline
                />
                {touched.shopAddress && errors.shopAddress && (
                  <Text style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                    {errors.shopAddress}
                  </Text>
                )}
              </View>

              {/* Update Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? '#B68AD480' : '#B68AD4',
                  padding: 16,
                  borderRadius: 10,
                  alignItems: 'center',
                  marginTop: 16,
                  marginBottom: 24,
                }}>
                <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
                  {isSubmitting ? 'Updating...' : 'Update Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;
