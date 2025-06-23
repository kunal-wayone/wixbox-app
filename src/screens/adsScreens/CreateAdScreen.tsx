import React, { useEffect } from 'react';
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
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import axios from 'axios';

// Assuming ImagePath is defined elsewhere
import { ImagePath } from '../../constants/ImagePath';
import { Fetch, IMAGE_URL, Post, Put } from '../../utils/apiUtils';

const { width } = Dimensions.get('screen');

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  productName: Yup.string().required('Product name is required'),
  offerTag: Yup.string().required('Offer tag is required'),
  promotionTag: Yup.string().required('Promotion tag is required'),
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
  status: Yup.boolean().required('Status is required'),
});

const CreateAdScreen = () => {
  const navigation = useNavigation();
  const route: any = useRoute();
  const adDetails = route.params?.adDetails || null;
  console.log('adDetails:', adDetails);
  const [isFetching, setIsFetching] = React.useState(!!adDetails);
  const [fetchedAdDetails, setFetchedAdDetails] = React.useState(adDetails);

  // State for date/time pickers and images
  const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = React.useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = React.useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = React.useState(false);
  const [images, setImages] = React.useState<string[]>(adDetails?.images || []);

  // Fetch ad details if editing
  useEffect(() => {
    if (adDetails?.id) {
      const fetchAdDetails = async () => {
        try {
          setIsFetching(true);
          const response: any = await Fetch(`/user/ads/${adDetails.id}`, undefined, 5000);

          if (!response.success) {
            throw new Error('Failed to fetch ad details');
          }

          const data = await response?.data
          console.log(data)
          setFetchedAdDetails(data || {});
          setImages((data?.images || []).map((img: any) => IMAGE_URL + img));
        } catch (error: any) {
          ToastAndroid.show(
            error.message || 'Failed to load ad details',
            ToastAndroid.LONG,
          );
        } finally {
          setIsFetching(false);
        }
      };

      fetchAdDetails();
    }
  }, [adDetails?.id]);

  // Image picker handler
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 5,
      });

      if (!result.didCancel && result.assets) {
        const newImages = result.assets.map(asset => asset.uri!);
        setImages(prev => [...prev, ...newImages].slice(0, 5));
      }
    } catch (error) {
      ToastAndroid.show('Error picking images', ToastAndroid.SHORT);
    }
  };

  // Remove image handler
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // API call handler
  const handleSaveAd = async (values: any, { setSubmitting, resetForm }: any) => {
    console.log(values, "saved value h y")
    try {
      const formData = new FormData();
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0]; // Extracts only the date part in yyyy-mm-dd format
      };
      const formatTime = (date: Date) => {
        return date.toISOString().split('T')[1]; // Extracts only the date part in yyyy-mm-dd format
      };

      formData.append('product_name', values.productName);
      formData.append('offer_tag', values.offerTag);
      formData.append('promotion_tag', values.promotionTag);
      formData.append('offer_starts_at', formatDate(values.offerStartDate));
      formData.append('offer_ends_at', formatDate(values.offerEndDate));
      formData.append('offer_start_time', formatTime(values.offerStartTime)); // if you want time, see below
      formData.append('offer_end_time', formatTime(values.offerEndTime));
      formData.append('original_price', values.originalPrice);
      formData.append('discounted_price', values.discountedPrice || '');
      formData.append('caption', values.caption);
      formData.append('status', values.status ? '1' : '0');
      // formData.append('images', images); // Append images as JSON string

      if(fetchedAdDetails?.id) {
        formData.append('_method', "PUT");
      }

      images.forEach((imageUri, index) => {
        formData.append(`images[${index}]`, {
          uri: imageUri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`,
        } as any);
      });
      const url = adDetails ? `/user/ads/${adDetails.id}` : '/user/ads';
      const method = adDetails ? Put : Post;
      const response: any = await method(url, formData, 5000);
      console.log(url, values, formData, response)

      if (!response?.success) {
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
        error.response?.data?.message || 'Something went wrong. Please try again.',
        ToastAndroid.LONG,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      {/* Loading Overlay */}
      {isFetching && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Tailwind bg-black/70
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}>
          <ActivityIndicator size="large" color="#B68AD4" />
          <Text style={{ color: '#fff', marginTop: 10, fontSize: 16 }}>
            Loading...
          </Text>
        </View>
      )}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          backgroundColor: '#fff',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row items-center border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 10 }}>
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
            style={{ textAlign: 'center', marginVertical: 8, color: '#4B5563' }}>
            {adDetails
              ? 'Update the ad details below.'
              : 'Enter the ad details to create a new ad.'}
          </Text>

          <Formik
            initialValues={{
              productName: fetchedAdDetails?.product_name || '',
              offerTag: fetchedAdDetails?.offer_tag || '',
              promotionTag: fetchedAdDetails?.promotion_tag || '',
              offerStartDate: fetchedAdDetails?.offer_starts_at
                ? new Date(fetchedAdDetails.offer_starts_at)
                : null,
              offerEndDate: fetchedAdDetails?.offer_ends_at
                ? new Date(fetchedAdDetails.offer_ends_at)
                : null,
              offerStartTime: fetchedAdDetails?.offer_starts_time
                ? new Date(fetchedAdDetails.offer_starts_time)
                : null,
              offerEndTime: fetchedAdDetails?.offer_ends_time
                ? new Date(fetchedAdDetails.offer_ends_time)
                : null,
              originalPrice: fetchedAdDetails?.original_price
                ? String(fetchedAdDetails.original_price)
                : '',
              discountedPrice: fetchedAdDetails?.discounted_price
                ? String(fetchedAdDetails.discounted_price)
                : '',
              caption: fetchedAdDetails?.caption || '',
              status: fetchedAdDetails?.status === "0" ? false : true || false,
            }}
            enableReinitialize // Reinitialize form when fetchedAdDetails changes
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
              <View style={{ marginTop: 16 }}>
                {/* Image Upload Container */}
                <View style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                      padding: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 100,
                      marginBottom: 12,
                    }}
                    onPress={pickImages}>
                    <Image
                      source={ImagePath.uploadIcon}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                    <Text style={{ color: '#4B5563', marginTop: 8 }}>
                      Add Images (Max 5)
                    </Text>
                  </TouchableOpacity>

                  {/* Display Selected Images */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {images.map((uri: string, index: number) => (
                      <View key={index} style={{ marginRight: 8, marginBottom: 8 }}>
                        <Image
                          source={{ uri }}
                          style={{ width: 80, height: 80, borderRadius: 8 }}
                        />
                        <TouchableOpacity
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            borderRadius: 12,
                          }}
                          onPress={() => removeImage(index)}>
                          <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                {/* Product Name */}
                <View style={{ marginBottom: 12 }}>
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
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.productName}
                    </Text>
                  )}
                </View>

                {/* Offer Tag */}
                <View style={{ marginBottom: 12 }}>
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
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.offerTag}
                    </Text>
                  )}
                </View>

                {/* Promotion Tag */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Promotion Tag
                  </Text>
                  <View
                    style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {['Limited Time', 'Flash Sale', 'Exclusive Offer'].map(
                      tag => (
                        <TouchableOpacity
                          key={tag}
                          style={{
                            backgroundColor:
                              values.promotionTag === tag ? '#B68AD4' : '#F3F4F6',
                            borderWidth: 1,
                            borderColor: '#D1D5DB',
                            borderRadius: 10,
                            paddingVertical: 8,
                            paddingHorizontal: 16,
                          }}
                          onPress={() => setFieldValue('promotionTag', tag)}>
                          <Text
                            style={{
                              color:
                                values.promotionTag === tag ? '#fff' : '#374151',
                              fontSize: 14,
                              fontWeight: '500',
                            }}>
                            {tag}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                  {touched.promotionTag && errors.promotionTag && (
                    <Text
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.promotionTag}
                    </Text>
                  )}
                </View>



                {/* Offer Start and End Date/Time */}
                <View style={{ marginBottom: 12 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 15,
                      backgroundColor: '#F3F4F6',
                      padding: 20,
                      borderRadius: 8,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                      }}>
                      Offer Starts At
                    </Text>
                    <View style={{ width: 1, backgroundColor: '#D1D5DB' }} />
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
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                        }}
                        onPress={() => setShowStartDatePicker(true)}>
                        <Text style={{ fontSize: 16, color: '#374151' }}>
                          {
                            values.offerStartDate
                              ? new Date(values.offerStartDate).toLocaleDateString()
                              : 'Start date'
                          }
                        </Text>
                        <Icon
                          name="calendar-today"
                          size={20}
                          color="#374151"
                          style={{ position: 'absolute', right: 8, top: 12 }}
                        />
                      </TouchableOpacity>
                      <DateTimePickerModal
                        isVisible={showStartDatePicker}
                        mode="date"
                        onConfirm={date => {
                          setFieldValue('offerStartDate', date);
                          setShowStartDatePicker(false);
                        }}
                        onCancel={() => setShowStartDatePicker(false)}
                        accentColor="#B68AD4"
                        textColor="#B68AD4"
                      />
                    </View>
                    {/* End Date Picker */}
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                        }}
                        onPress={() => setShowEndDatePicker(true)}>
                        <Text style={{ fontSize: 16, color: '#374151' }}>
                          {values.offerEndDate
                            ? new Date(values.offerEndDate).toLocaleDateString()
                            : 'End date'}
                        </Text>
                        <Icon
                          name="calendar-today"
                          size={20}
                          color="#374151"
                          style={{ position: 'absolute', right: 8, top: 12 }}
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
                        accentColor="#B68AD4"
                        textColor="#B68AD4"
                      />
                    </View>
                  </View>
                  {touched.offerStartDate && errors.offerStartDate && (
                    <Text
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.offerStartDate}
                    </Text>
                  )}
                  {touched.offerEndDate && errors.offerEndDate && (
                    <Text
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.offerEndDate}
                    </Text>
                  )}
                </View>

                {/* Start and End Time Pickers */}
                <View style={{ marginBottom: 12 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    {/* Start Time Picker */}
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                        }}
                        onPress={() => setShowStartTimePicker(true)}>
                        <Text style={{ fontSize: 16, color: '#374151' }}>
                          {values.offerStartTime
                            ? new Date(values.offerStartTime).toLocaleTimeString()
                            : 'Start time'}
                        </Text>
                        <Icon
                          name="access-time"
                          size={20}
                          color="#374151"
                          style={{ position: 'absolute', right: 8, top: 12 }}
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
                        accentColor="#B68AD4"
                        textColor="#B68AD4"
                      />
                    </View>
                    {/* End Time Picker */}
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <TouchableOpacity
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                        }}
                        onPress={() => setShowEndTimePicker(true)}>
                        <Text style={{ fontSize: 16, color: '#374151' }}>
                          {values.offerEndTime
                            ? new Date(values.offerEndTime).toLocaleTimeString()
                            : 'End time'}
                        </Text>
                        <Icon
                          name="access-time"
                          size={20}
                          color="#374151"
                          style={{ position: 'absolute', right: 8, top: 12 }}
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
                        accentColor="#B68AD4"
                        textColor="#B68AD4"
                      />
                    </View>
                  </View>
                  {touched.offerStartTime && errors.offerStartTime && (
                    <Text
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.offerStartTime}
                    </Text>
                  )}
                  {touched.offerEndTime && errors.offerEndTime && (
                    <Text
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.offerEndTime}
                    </Text>
                  )}
                </View>

                {/* Price & Discounted Price */}
                <View style={{ marginBottom: 12 }}>
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
                    <View style={{ flex: 1, marginRight: 8 }}>
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
                    <View style={{ flex: 1, marginLeft: 8 }}>
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
                <View style={{ marginBottom: 12 }}>
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
                      textAlignVertical: 'top',
                    }}
                    placeholder="Enter ad caption"
                    onChangeText={handleChange('caption')}
                    onBlur={handleBlur('caption')}
                    value={values.caption}
                    multiline
                  />
                  {touched.caption && errors.caption && (
                    <Text
                      style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.caption}
                    </Text>
                  )}
                </View>


                {/* Status Switch */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}>
                    Ad Status
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Switch
                      value={values.status}
                      onValueChange={value => setFieldValue('status', value)}
                      trackColor={{ false: '#D1D5DB', true: '#B68AD4' }}
                      thumbColor={values.status ? '#fff' : '#f4f3f4'}
                    />
                    <Text style={{ marginLeft: 8, color: '#374151' }}>
                      {values.status ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting || isFetching}
                  style={{
                    backgroundColor:
                      isSubmitting || isFetching ? '#B68AD480' : '#B68AD4',
                    padding: 16,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginTop: 16,
                    marginBottom: 20,
                  }}>
                  <Text
                    style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
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