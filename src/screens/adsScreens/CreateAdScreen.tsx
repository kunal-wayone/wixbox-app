import React from 'react';
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
import {useNavigation, useRoute} from '@react-navigation/native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker'; // For date and time pickers
import {ImagePath} from '../../constants/ImagePath'; // Adjust path as needed
import Icon from 'react-native-vector-icons/MaterialIcons';

const {width} = Dimensions.get('screen');

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  productName: Yup.string().required('Product name is required'),
  offerTag: Yup.string().required('Offer tag is required'),
  offerStartDate: Yup.date().required('Offer start date is required'),
  offerEndDate: Yup.date()
    .required('Offer end date is required')
    .min(Yup.ref('offerStartDate'), 'End date must be after start date'),
  offerStartTime: Yup.date().required('Offer start time is required'),
  offerEndTime: Yup.date().required('Offer end time is required'),
  originalPrice: Yup.number()
    .required('Original price is required')
    .positive('Price must be positive'),
  discountedPrice: Yup.number()
    .positive('Discounted price must be positive')
    .nullable(),
  caption: Yup.string().required('Caption is required'),
});

const CreateAdScreen = () => {
  const navigation = useNavigation();
  const route: any = useRoute();
  const adDetails = route.params?.adDetails || null;

  // State for date and time pickers
  const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = React.useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = React.useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = React.useState(false);

  // Mock API call for saving or updating ad
  const handleSaveAd = async (values: any, {setSubmitting, resetForm}: any) => {
    try {
      const response = await fetch('https://api.example.com/create-ad', {
        method: adDetails ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          id: adDetails?.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save ad');
      }

      ToastAndroid.show(
        adDetails ? 'Ad updated successfully!' : 'Ad created successfully!',
        ToastAndroid.SHORT,
      );
      resetForm();
      navigation.goBack();
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
              fontSize: 30,
              fontWeight: 'bold',
              fontFamily: 'Poppins',
              color: '#374151',
            }}>
            {adDetails ? 'Edit Ad' : 'Create Ad'}
          </Text>
          <Text
            style={{textAlign: 'center', marginVertical: 8, color: '#4B5563'}}>
            {adDetails
              ? 'Update the ad details below.'
              : 'Enter the ad details to create a new ad.'}
          </Text>

          <Formik
            initialValues={{
              productName: adDetails?.productName || '',
              offerTag: adDetails?.offerTag || '',
              offerStartDate: adDetails?.offerStartDate || null,
              offerEndDate: adDetails?.offerEndDate || null,
              offerStartTime: adDetails?.offerStartTime || null,
              offerEndTime: adDetails?.offerEndTime || null,
              originalPrice: adDetails?.originalPrice
                ? String(adDetails.originalPrice)
                : '',
              discountedPrice: adDetails?.discountedPrice
                ? String(adDetails.discountedPrice)
                : '',
              caption: adDetails?.caption || '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSaveAd}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
              setFieldValue,
            }: any) => (
              <View style={{marginTop: 16}}>
                {/* Image Upload Container */}
                <TouchableOpacity
                  style={{
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                    padding: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 170,
                    marginBottom: 12,
                  }}
                  onPress={() => {
                    ToastAndroid.show(
                      'Image picker not implemented',
                      ToastAndroid.SHORT,
                    );
                  }}>
                  <Image
                    source={ImagePath.uploadIcon}
                    style={{width: 30, height: 30}}
                    resizeMode="contain"
                  />
                  <Text style={{color: '#4B5563', marginTop: 8}}>
                    Add Images
                  </Text>
                </TouchableOpacity>

                {/* Product Name */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Product Name
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
                    placeholder="Enter product name"
                    onChangeText={handleChange('productName')}
                    onBlur={handleBlur('productName')}
                    value={values.productName}
                  />
                  {touched.productName && errors.productName && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.productName}
                    </Text>
                  )}
                </View>

                {/* Offer Tag */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Offer Tag
                  </Text>
                  <View
                    style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                    {['Fresh Arrived', 'Buy 1 Get 1 Free', '50% Off'].map(
                      tag => (
                        <TouchableOpacity
                          key={tag}
                          style={{
                            backgroundColor:
                              values.offerTag === tag ? '#B68AD4' : '#F3F4F6',
                            borderWidth: 1,
                            borderColor: '#D1D5DB',
                            borderRadius: 10,
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                          }}
                          onPress={() => setFieldValue('offerTag', tag)}>
                          <Text
                            style={{
                              color:
                                values.offerTag === tag ? '#fff' : '#374151',
                              fontSize: 14,
                              fontWeight: '500',
                            }}>
                            {tag}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                  {touched.offerTag && errors.offerTag && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.offerTag}
                    </Text>
                  )}
                </View>

                {/* Offer Start and End Date/Time */}
                <View style={{marginBottom: 12}}>
                  <View
                    className="bg-primary-20 p-5 rounded-lg"
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 15,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                      }}>
                      Offer Starts At
                    </Text>
                    <View className="w-[1px] h-full scale-150 bg-gray-600" />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                      }}>
                      Offer Ends At
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    {/* Start Date Picker */}
                    <View style={{flex: 1, marginRight: 8}}>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                        }}
                        className="flex-row justify-between items-center "
                        onPress={() => setShowStartDatePicker(true)}>
                        <Text style={{fontSize: 16, color: '#374151'}}>
                          {values.offerStartDate
                            ? new Date(
                                values.offerStartDate,
                              ).toLocaleDateString()
                            : 'Start date'}
                        </Text>
                        <Icon
                          name="calendar-today"
                          size={20}
                          color="#374151"
                          style={{marginRight: 8}}
                        />
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={showStartDatePicker}
                        mode="date"
                        onConfirm={date => {
                          setFieldValue('offerStartDate', date);
                          setShowStartDatePicker(false);
                        }}
                        className="rounded-xl"
                        onCancel={() => setShowStartDatePicker(false)}
                        accentColor="#B68AD4"
                        textColor="#B68AD4"
                        accessibilityIgnoresInvertColors={true}
                      />
                    </View>
                    {/* End Date Picker */}
                    <View style={{flex: 1, marginLeft: 8}}>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                        }}
                        className="flex-row justify-between items-center "
                        onPress={() => setShowEndDatePicker(true)}>
                        <Text style={{fontSize: 16, color: '#374151'}}>
                          {values.offerEndDate
                            ? new Date(values.offerEndDate).toLocaleDateString()
                            : 'End date'}
                        </Text>
                        <Icon
                          name="calendar-today"
                          size={20}
                          color="#374151"
                          style={{marginRight: 8}}
                        />
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={showEndDatePicker}
                        mode="date"
                        onConfirm={date => {
                          setFieldValue('offerEndDate', date);
                          setShowEndDatePicker(false);
                        }}
                        onCancel={() => setShowEndDatePicker(false)}
                      />
                    </View>
                  </View>
                  {touched.offerStartDate && errors.offerStartDate && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.offerStartDate}
                    </Text>
                  )}
                  {touched.offerEndDate && errors.offerEndDate && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.offerEndDate}
                    </Text>
                  )}
                </View>

                {/* Start and End Time Pickers */}
                <View style={{marginBottom: 12}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    {/* Start Time Picker */}
                    <View style={{flex: 1, marginRight: 8}}>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                        }}
                        className="flex-row justify-between items-center "
                        onPress={() => setShowStartTimePicker(true)}>
                        <Text style={{fontSize: 16, color: '#374151'}}>
                          {values.offerStartTime
                            ? new Date(
                                values.offerStartTime,
                              ).toLocaleTimeString()
                            : 'Start time'}
                        </Text>
                        <Icon
                          name="access-time"
                          size={20}
                          color="#374151"
                          style={{marginRight: 8}}
                        />
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={showStartTimePicker}
                        mode="time"
                        is24Hour={false}
                        onConfirm={time => {
                          setFieldValue('offerStartTime', time);
                          setShowStartTimePicker(false);
                        }}
                        onCancel={() => setShowStartTimePicker(false)}
                      />
                    </View>
                    {/* End Time Picker */}
                    <View style={{flex: 1, marginLeft: 8}}>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                        }}
                        className="flex-row justify-between items-center "
                        onPress={() => setShowEndTimePicker(true)}>
                        <Text style={{fontSize: 16, color: '#374151'}}>
                          {values.offerEndTime
                            ? new Date(values.offerEndTime).toLocaleTimeString()
                            : 'End time'}
                        </Text>
                        <Icon
                          name="access-time"
                          size={20}
                          color="#374151"
                          style={{marginRight: 8}}
                        />
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={showEndTimePicker}
                        mode="time"
                        is24Hour={false}
                        onConfirm={time => {
                          setFieldValue('offerEndTime', time);
                          setShowEndTimePicker(false);
                        }}
                        onCancel={() => setShowEndTimePicker(false)}
                      />
                    </View>
                  </View>
                  {touched.offerStartTime && errors.offerStartTime && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.offerStartTime}
                    </Text>
                  )}
                  {touched.offerEndTime && errors.offerEndTime && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.offerEndTime}
                    </Text>
                  )}
                </View>

                {/* Horizontal Line Separator */}
                <View
                  style={{
                    borderBottomWidth: 1,
                    borderBottomColor: '#D1D5DB',
                    marginVertical: 16,
                  }}
                />

                {/* Price & Discounted Price Section */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: '#374151',
                      marginBottom: 8,
                    }}>
                    Add Price & Discounted Price
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    {/* Original Price */}
                    <View style={{flex: 1, marginRight: 8}}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: 4,
                        }}>
                        Original Price
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
                        placeholder="Enter original price"
                        onChangeText={handleChange('originalPrice')}
                        onBlur={handleBlur('originalPrice')}
                        value={values.originalPrice}
                        keyboardType="numeric"
                      />
                      {touched.originalPrice && errors.originalPrice && (
                        <Text
                          style={{
                            color: '#EF4444',
                            fontSize: 12,
                            marginTop: 4,
                          }}>
                          {errors.originalPrice}
                        </Text>
                      )}
                    </View>
                    {/* Discounted Price */}
                    <View style={{flex: 1, marginLeft: 8}}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: 4,
                        }}>
                        Discounted Price (if any)
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
                        placeholder="Enter discounted price"
                        onChangeText={handleChange('discountedPrice')}
                        onBlur={handleBlur('discountedPrice')}
                        value={values.discountedPrice}
                        keyboardType="numeric"
                      />
                      {touched.discountedPrice && errors.discountedPrice && (
                        <Text
                          style={{
                            color: '#EF4444',
                            fontSize: 12,
                            marginTop: 4,
                          }}>
                          {errors.discountedPrice}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Caption */}
                <View style={{marginBottom: 12}}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Caption
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 16,
                      minHeight: 100,
                      textAlignVertical: 'top', // <-- This ensures text starts from the top
                    }}
                    placeholder="Enter ad caption"
                    onChangeText={handleChange('caption')}
                    onBlur={handleBlur('caption')}
                    value={values.caption}
                    multiline
                  />
                  {touched.caption && errors.caption && (
                    <Text
                      style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                      {errors.caption}
                    </Text>
                  )}
                </View>

                {/* Create/Update Button */}
                <TouchableOpacity
                  onPress={() => handleSubmit()}
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
                    {isSubmitting
                      ? 'Saving...'
                      : adDetails
                      ? 'Update Ad'
                      : 'Create Ad'}
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

export default CreateAdScreen;
