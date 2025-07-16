import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Fetch, Post, TokenStorage } from '../../utils/apiUtils';
import LoadingComponent from './LoadingComponent';
import { RootState } from '@reduxjs/toolkit/query';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../../store/slices/userSlice';
import { formatDateToYYYYMMDD } from '../../utils/tools/tools';
import { Picker } from '@react-native-picker/picker';
import { states } from '../../utils/data/constant';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  dateOfBirth: Yup.string()
    .required('Date of birth is required')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Date of birth must be in DD/MM/YYYY format'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
  gender: Yup.string().required('Gender is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  address: Yup.array().of(
    Yup.object().shape({
      address: Yup.string()
        .required('Address is required')
        .min(5, 'Address must be at least 5 characters'),
      type: Yup.string().required('Address type is required'),
      state: Yup.string().required('State is required'),
      city: Yup.string().required('City is required'),
      pincode: Yup.string()
        .required('Pincode is required')
        .matches(/^\d{6}$/, 'Pincode must be 6 digits'),
    })
  ),
});

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { status: userStatus, data: user }: any = useSelector(
    (state: any) => state.user,
  );
  const [userData, setUserData] = useState<any>(user);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        const response = await dispatch(fetchUser())
        console.log(response, "asdfghj")
        // const user: any = await TokenStorage.getUserData();
        if (user) {
          // Ensure address is an array with at least one object
          const address = user.user_addresses?.length > 0 ? user.user_addresses : [{ address: '', type: '', state: '', city: '', pincode: '' }];
          // Set address type based on role
          const updatedAddress = [{
            ...address[0],
            type: user.role === 'user' ? 'Home' : user.role === 'vendor' ? 'Shop' : address[0].type,
          }];
          console.log({ ...user, address: updatedAddress }, "gfyhudsnmif");
          setUserData({ ...user, address: updatedAddress });
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

  // Handle profile update
  const handleUpdateProfile = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      setSubmitting(true);
      // Structure the payload to match the required format
      const payload = {
        fullName: values.fullName,
        dob: formatDateToYYYYMMDD(values.dateOfBirth),
        phone: values.phoneNumber,
        gender: values.gender,
        email: values.email,
        address: [
          {
            address: values.address[0].address,
            type: values.address[0].type,
            state: values.address[0].state,
            city: values.address[0].city,
            pincode: values.address[0].pincode,
          },
        ],
      };

      const response: any = await Post('/user/update-profile', payload, 5000);
      console.log(response, payload);
      if (!response.success) {
        const errorData = await response?.data;
        throw new Error(errorData.message || 'Failed to update profile');
      }

      // Update local user data
      const updatedUser = await response?.data;
      await TokenStorage.setUserData(updatedUser);
      setUserData(updatedUser);

      ToastAndroid.show('Profile updated successfully!', ToastAndroid.SHORT);
      resetForm({ values: updatedUser });
      navigation.goBack();
    } catch (error: any) {
      ToastAndroid.show(error.message || 'Something went wrong. Please try again.', ToastAndroid.LONG);
    } finally {
      setSubmitting(false);
    }
  };

  // Format date to DD/MM/YYYY
  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // if (isLoading) {
  //   return <LoadingComponent />;
  // }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {isLoading && <View className='absolute bg-black/80 top-0 z-50 h-full w-full '>
        <ActivityIndicator className='m-auto' size={"large"} color={'#B68AD4'} />
      </View>}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          backgroundColor: '#fff',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
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
            }}
          >
            Edit Profile
          </Text>
          <View className="p-2" style={{ width: 40 }} />
        </View>

        <Formik
          enableReinitialize
          initialValues={{
            fullName: user?.name || '',
            dateOfBirth: user?.dob || '',
            phoneNumber: user?.phone || '',
            gender: user?.gender || '',
            email: user?.email || '',
            address: [
              {
                address: user?.user_addresses?.[0]?.address || '',
                type: user?.user_addresses?.[0]?.type || (user?.role === 'user' ? 'Home' : user?.role === 'vendor' ? 'Shop' : ''),
                state: user?.user_addresses?.[0]?.state || '',
                city: user?.user_addresses?.[0]?.city || '',
                pincode: user?.user_addresses?.[0]?.pincode || '',
              },
            ],
          }}
          validationSchema={validationSchema}
          onSubmit={handleUpdateProfile}
        >
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
            <View style={{ marginTop: 16 }}>
              {/* Full Name */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
                  Full Name
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: touched.fullName && errors.fullName ? '#EF4444' : '#D1D5DB',
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
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.fullName}</Text>
                )}
              </View>

              {/* Date of Birth */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
                  Date of Birth (DD/MM/YYYY)
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  style={{
                    borderWidth: 1,
                    borderColor: touched.dateOfBirth && errors.dateOfBirth ? '#EF4444' : '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontSize: 16, color: values.dateOfBirth ? '#374151' : '#9CA3AF' }}>
                    {values?.dateOfBirth?.split(" ")[0] || 'Select date of birth'}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={
                      values.dateOfBirth
                        ? new Date(values.dateOfBirth.split('/').reverse().join('-'))
                        : new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                    }
                    mode="date"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))} // Must be at least 18 years old
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS, close on Android
                      if (selectedDate) {
                        setFieldValue('dateOfBirth', formatDate(selectedDate));
                      }
                    }}
                  />

                )}
                {touched.dateOfBirth && errors.dateOfBirth && (
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.dateOfBirth}</Text>
                )}
              </View>

              {/* Phone Number */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
                  Phone Number
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: touched.phoneNumber && errors.phoneNumber ? '#EF4444' : '#D1D5DB',
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
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.phoneNumber}</Text>
                )}
              </View>

              {/* Gender Radio Group */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
                  Gender
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {['Male', 'Female', 'Other'].map(gender => (
                    <TouchableOpacity
                      key={gender}
                      onPress={() => setFieldValue('gender', gender)}
                      style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
                    >
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
                        }}
                      >
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
                      <Text style={{ fontSize: 16, color: '#374151' }}>{gender}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {touched.gender && errors.gender && (
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.gender}</Text>
                )}
              </View>

              {/* Email Address */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
                  Email Address
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: touched.email && errors.email ? '#EF4444' : '#D1D5DB',
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
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.email}</Text>
                )}
              </View>

              {/* Address Fields */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
                  Address
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: touched.address?.[0]?.address && errors.address?.[0]?.address ? '#EF4444' : '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    minHeight: 100,
                    textAlignVertical: 'top',
                  }}
                  placeholder="Enter address"
                  onChangeText={handleChange('address[0].address')}
                  onBlur={handleBlur('address[0].address')}
                  value={values.address[0].address}
                  multiline
                />
                {touched.address?.[0]?.address && errors.address?.[0]?.address && (
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.address[0].address}</Text>
                )}
              </View>

              {/* Address Type (Read-only based on role) */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
                  Address Type
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                    color: '#374151',
                  }}
                  value={values.address[0].type}
                  editable={false}
                />
                {touched.address?.[0]?.type && errors.address?.[0]?.type && (
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.address[0].type}</Text>
                )}
              </View>

              {/* State */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
                  State
                </Text>
                <View
                  style={{
                    backgroundColor: '#F3F4F6',
                    borderWidth: 1,
                    borderColor: touched.address?.[0]?.state && errors.address?.[0]?.state ? '#EF4444' : '#D1D5DB',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    marginVertical: 8,
                  }}>
                  <Picker
                    selectedValue={values.address[0].state}
                    onValueChange={handleChange('address[0].state')}
                    style={{
                      fontSize: 16,

                      height: 50,
                    }}
                    accessible
                    accessibilityLabel="Select state">
                    <Picker.Item label="Select State" value="" />
                    {states.map((state) => (
                      <Picker.Item key={state?.id} label={state?.name} value={state?.name} />
                    ))}
                  </Picker>
                </View>
                {touched.address?.[0]?.state && errors.address?.[0]?.state && (
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.address[0].state}</Text>
                )}
              </View>

              {/* City */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
                  City
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: touched.address?.[0]?.city && errors.address?.[0]?.city ? '#EF4444' : '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                  }}
                  placeholder="Enter city"
                  onChangeText={handleChange('address[0].city')}
                  onBlur={handleBlur('address[0].city')}
                  value={values.address[0].city}
                />
                {touched.address?.[0]?.city && errors.address?.[0]?.city && (
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.address[0].city}</Text>
                )}
              </View>

              {/* Pincode */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 4 }}>
                  Pincode
                </Text>
                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: touched.address?.[0]?.pincode && errors.address?.[0]?.pincode ? '#EF4444' : '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 16,
                  }}
                  placeholder="Enter pincode"
                  onChangeText={handleChange('address[0].pincode')}
                  onBlur={handleBlur('address[0].pincode')}
                  value={values.address[0].pincode}
                  keyboardType="numeric"
                  maxLength={6}
                />
                {touched.address?.[0]?.pincode && errors.address?.[0]?.pincode && (
                  <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>{errors.address[0].pincode}</Text>
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
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
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