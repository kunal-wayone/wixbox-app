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
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as ImagePicker from 'react-native-image-picker';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch, IMAGE_URL, Post, Put } from '../../utils/apiUtils';
import Switch from '../../components/common/Switch';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('screen');

const validationSchema = Yup.object().shape({
  ad_title: Yup.string().required('Please enter an ad title 😊'),
  ads_type: Yup.string().required('Please select an ad type 🌟'),
  related_item: Yup.string().required('Please enter a product name 🛍️'),
  offer_tag: Yup.string().required('Please select an offer tag 🎁'),
  promotion_tag: Yup.string().required('Please select a promotion tag 🌟'),
  offer_starts_at: Yup.date().required('Please set a start date 📅'),
  offer_ends_at: Yup.date()
    .required('Please set an end date 📅')
    .min(Yup.ref('offer_starts_at'), 'End date must be after start date'),
  offer_start_time: Yup.date().required('Please set a start time ⏰'),
  offer_end_time: Yup.date().required('Please set an end time ⏰'),
  original_price: Yup.number()
    .required('Please enter the original price 💸')
    .positive('Price must be positive'),
  discounted_price: Yup.number()
    .positive('Discounted price must be positive')
    .nullable(),
  caption: Yup.string().required('Please add a caption 📝'),
  budget: Yup.number()
    .required('Please specify a budget 💰')
    .positive('Budget must be positive'),
  status: Yup.boolean().required('Please set the ad status 🔄'),
});

const CreateAdScreen = () => {
  const navigation = useNavigation();
  const route: any = useRoute();
  const adDetails = route.params?.adDetails || null;
  const [isFetching, setIsFetching] = React.useState(!!adDetails);
  const [fetchedAdDetails, setFetchedAdDetails] = React.useState(adDetails);
  const [showStartDatePicker, setShowStartDatePicker] = React.useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = React.useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = React.useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = React.useState(false);
  const [images, setImages] = React.useState<any[]>(adDetails?.images?.map((img: any, index: any) => ({ uri: IMAGE_URL + img, id: index })) || []);

  useEffect(() => {
    if (adDetails?.id) {
      const fetchAdDetails = async () => {
        try {
          setIsFetching(true);
          const response: any = await Fetch(`/user/ads/${adDetails.id}`, undefined, 5000);
          if (!response.success) {
            throw new Error('Failed to fetch ad details');
          }
          const data = await response?.data;
          setFetchedAdDetails(data || {});
          setImages((data?.images || []).map((img: any, index: any) => ({
            uri: IMAGE_URL + img,
            id: index,
          })));
        } catch (error: any) {
          ToastAndroid.show(
            error.message || 'Couldn’t load ad details 😔',
            ToastAndroid.SHORT,
          );
        } finally {
          setIsFetching(false);
        }
      };
      fetchAdDetails();
    }
  }, [adDetails?.id]);

  const pickImages = async (setFieldValue: any) => {
    try {
      const result = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 5,
      });
      if (!result.didCancel && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || `image_${Date.now()}.jpg`,
        }));
        setImages(prev => [...prev, ...newImages].slice(0, 5));
        setFieldValue('images', [...images, ...newImages].slice(0, 5));
      }
    } catch (error) {
      ToastAndroid.show('Error picking images 📸', ToastAndroid.SHORT);
    }
  };

  const removeImage = (index: number, setFieldValue: any) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    setFieldValue('images', updatedImages);
  };

  const handleSaveAd = async (values: any, { setSubmitting, resetForm, setErrors }: any) => {
    try {
      const formData = new FormData();
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      const formatTime = (date: Date) => date.toISOString().split('T')[1];

      formData.append('ad_title', values.ad_title);
      formData.append('ads_type', values.ads_type);
      formData.append('related_item', values.related_item);
      formData.append('offer_tag', values.offer_tag);
      formData.append('promotion_tag', values.promotion_tag);
      formData.append('offer_starts_at', formatDate(values.offer_starts_at));
      formData.append('offer_ends_at', formatDate(values.offer_ends_at));
      formData.append('offer_start_time', formatTime(values.offer_start_time));
      formData.append('offer_end_time', formatTime(values.offer_end_time));
      formData.append('original_price', values.original_price);
      formData.append('discounted_price', values.discounted_price || '');
      formData.append('caption', values.caption);
      formData.append('budget', values.budget);
      formData.append('status', values.status ? '1' : '0');

      values.images?.forEach((image: any, index: any) => {
        if (image.uri && image.type && image.name) {
          formData.append(`images[${index}]`, {
            uri: image.uri,
            type: image.type,
            name: image.name,
          });
        }
      });

      const endpoint = adDetails ? `/user/ads/${adDetails.id}` : '/user/ads';
      const response: any = await (adDetails ? Put : Post)(endpoint, formData, 5000);

      if (!response?.success) {
        throw new Error('Failed to save ad');
      }

      ToastAndroid.show(
        adDetails ? 'Ad updated successfully! 🎉' : 'Ad created successfully! 🎉',
        ToastAndroid.SHORT,
      );
      resetForm();
      setImages([]);
      navigation.goBack();
    } catch (error: any) {
      if (error.errors) {
        const formattedErrors: any = {};
        for (const key in error.errors) {
          formattedErrors[key] = error.errors[key][0];
        }
        setErrors(formattedErrors);
      }
      ToastAndroid.show(
        error.response?.data?.message || 'Something went wrong 😔',
        ToastAndroid.SHORT,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        className="flex-1 bg-white dark:bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {isFetching && (
          <View className="absolute inset-0 bg-black/80 justify-center items-center z-50">
            <ActivityIndicator size="large" color="#ac94f4" />
            <Text className="text-white text-lg mt-3 font-medium">Loading...</Text>
          </View>
        )}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            className="absolute top-4 left-4 p-2 z-10"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>

          <View className="">
            <Text className="text-center text-2xl font-bold text-gray-900 dark:text-gray-900 font-[Poppins] mt-4">
              {adDetails ? 'Edit Ad ✨' : 'Create New Ad ✨'}
            </Text>
            <Text className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
              {adDetails ? 'Update your ad to captivate your audience!' : 'Craft a stunning ad to promote your offer!'}
            </Text>

            <Formik
              initialValues={{
                ad_title: fetchedAdDetails?.ad_title || '',
                ads_type: fetchedAdDetails?.ads_type || 'Promote Product',
                related_item: fetchedAdDetails?.related_item || '',
                offer_tag: fetchedAdDetails?.offer_tag || '',
                promotion_tag: fetchedAdDetails?.promotion_tag || '',
                offer_starts_at: fetchedAdDetails?.offer_starts_at
                  ? new Date(fetchedAdDetails.offer_starts_at)
                  : null,
                offer_ends_at: fetchedAdDetails?.offer_ends_at
                  ? new Date(fetchedAdDetails.offer_ends_at)
                  : null,
                offer_start_time: fetchedAdDetails?.offer_start_time
                  ? new Date(`1970-01-01T${fetchedAdDetails.offer_start_time}`)
                  : null,
                offer_end_time: fetchedAdDetails?.offer_end_time
                  ? new Date(`1970-01-01T${fetchedAdDetails.offer_end_time}`)
                  : null,
                original_price: fetchedAdDetails?.original_price
                  ? String(fetchedAdDetails.original_price)
                  : '',
                discounted_price: fetchedAdDetails?.discounted_price
                  ? String(fetchedAdDetails.discounted_price)
                  : '',
                caption: fetchedAdDetails?.caption || '',
                budget: fetchedAdDetails?.budget ? String(fetchedAdDetails.budget) : '',
                status: fetchedAdDetails?.status === "0" ? false : true,
                images: images || [],
              }}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={handleSaveAd}
            >
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
                <View className="space-y-4">
                  {/* Image Upload and Preview */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Upload Poster</Text>
                    </View>
                    <TouchableOpacity
                      className="border border-dashed border-gray-400 dark:border-gray-300 rounded-lg p-4 items-center justify-center h-36 mb-3"
                      onPress={() => pickImages(setFieldValue)}
                      accessibilityLabel="Add ad photos"
                    >
                      <View className="bg-primary-100 rounded-full p-3">
                        <Ionicons name="camera-outline" size={40} color="#fff" />
                      </View>
                      <Text className="text-gray-600 dark:text-gray-400 mt-2">Tap to add photos</Text>
                      <Text className="text-xs text-gray-500 dark:text-gray-400">Up to 5 images from camera or gallery</Text>
                    </TouchableOpacity>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {images.map((image: any, index: any) => (
                        <View key={index} className="mr-3 relative">
                          <Image
                            source={{ uri: image.uri }}
                            className="w-24 h-24 rounded-lg"
                            accessibilityLabel={`Ad image ${index + 1}`}
                          />
                          <TouchableOpacity
                            className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                            onPress={() => removeImage(index, setFieldValue)}
                            accessibilityLabel={`Remove image ${index + 1}`}
                          >
                            <Ionicons name="close-circle" size={24} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                    {touched.images && errors.images && (
                      <Text className="text-red-500 text-xs mt-1">{errors.images}</Text>
                    )}
                  </View>

                  {/* Ad Title */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <FontAwesome name="bullhorn" size={22} color="#ac94f4" className="mr-2" />
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Ad Title</Text>
                    </View>
                    <TextInput
                      className="border border-gray-300 dark:border-gray-300 bg-gray-100 dark:bg-white text-gray-900 rounded-lg p-3 text-base dark:text-gray-900"
                      placeholder="e.g., Summer Sale Extravaganza"
                      placeholderTextColor="#6B7280"
                      onChangeText={handleChange('ad_title')}
                      onBlur={handleBlur('ad_title')}
                      value={values.ad_title}
                      accessibilityLabel="Ad title"
                    />
                    {touched.ad_title && errors.ad_title && (
                      <Text className="text-red-500 text-xs mt-1">{errors.ad_title}</Text>
                    )}
                  </View>

                  {/* Product Name */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <MaterialIcons name="shopping-bag" size={22} color="#ac94f4" className="mr-2" />
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Product Name</Text>
                    </View>
                    <TextInput
                      className="border border-gray-300 dark:border-gray-300 bg-gray-100 dark:bg-white rounded-lg p-3 text-base text-gray-800 dark:text-gray-900"
                      placeholder="e.g., Deluxe Burger 🍔"
                      placeholderTextColor="#6B7280"
                      onChangeText={handleChange('related_item')}
                      onBlur={handleBlur('related_item')}
                      value={values.related_item}
                      accessibilityLabel="Product name"
                    />
                    {touched.related_item && errors.related_item && (
                      <Text className="text-red-500 text-xs mt-1">{errors.related_item}</Text>
                    )}
                  </View>


                  {/* Ad Type Toggle */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <MaterialIcons name="category" size={22} color="#ac94f4" className="mr-2" />
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Type of Ad</Text>
                    </View>
                    <View className="flex-col justify-between gap-2">
                      {[
                        { lable: "Product", type: 'product', emoji: '🛍️', desc: 'Highlight a specific dish' },
                        { lable: "Offer", type: 'offer', emoji: '🎉', desc: 'Discount or combo deal' },
                        { lable: "Event", type: 'event', emoji: '🎈', desc: 'Festival or special occasion' },
                      ].map(({ lable, type, emoji, desc }) => (
                        <TouchableOpacity
                          key={type}
                          className={`flex-1 p-3 rounded-lg border ${values.ads_type === type ? 'bg-primary-100 border-gray-400' : 'bg-gray-100 dark:bg-white border-gray-300 dark:border-gray-300'}`}
                          onPress={() => setFieldValue('ads_type', type)}
                          accessibilityLabel={`Select ${type} ad type`}
                        >
                          <Text className={`text-left text-base font-semibold ${values?.ads_type === type ? "text-white dark:text-white" : "text-gray-900 dark:text-gray-900"}`}>{emoji} {lable}</Text>
                          <Text className={`text-left text-xs  mt-1 ${values?.ads_type === type ? "text-white dark:text-white" : "text-gray-900 dark:text-gray-900"}`}>{desc}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {touched.ads_type && errors.ads_type && (
                      <Text className="text-red-500 text-xs mt-1">{errors.ads_type}</Text>
                    )}
                  </View>

                  {/* Short Caption */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="chatbubble-ellipses-outline" size={22} color="#ac94f4" className="mr-2" />
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Short Caption</Text>
                    </View>
                    <TextInput
                      className="border border-gray-300 dark:border-gray-300 bg-gray-100 dark:bg-white rounded-lg p-3 min-h-[100px] text-base text-gray-800 dark:text-gray-900"
                      placeholder="e.g., Get 50% off this weekend! 🎁"
                      placeholderTextColor="#6B7280"
                      onChangeText={handleChange('caption')}
                      onBlur={handleBlur('caption')}
                      value={values.caption}
                      multiline
                      textAlignVertical="top"
                      accessibilityLabel="Ad caption"
                    />
                    {touched.caption && errors.caption && (
                      <Text className="text-red-500 text-xs mt-1">{errors.caption}</Text>
                    )}
                  </View>

                  {/* Offer Schedule */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <MaterialIcons name="event" size={22} color="#ac94f4" className="mr-2" />
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Offer Schedule</Text>
                    </View>
                    <View className="flex-row justify-between bg-gray-100 dark:bg-white p-4 rounded-lg mb-2">
                      <Text className="text-sm font-medium text-gray-900 dark:text-gray-900">Starts</Text>
                      <View className="w-px bg-primary-100 dark:bg-primary-100" />
                      <Text className="text-sm font-medium text-gray-900 dark:text-gray-900">Ends</Text>
                    </View>
                    <View className="flex-row justify-between gap-2">
                      <View className="flex-1">
                        <TouchableOpacity
                          className="border border-gray-300 dark:border-gray-300 bg-gray-100 dark:bg-white rounded-lg p-3 flex-row justify-between items-center"
                          onPress={() => setShowStartDatePicker(true)}
                          accessibilityLabel="Select start date"
                        >
                          <Text className="text-base text-gray-800 dark:text-gray-900">
                            {values.offer_starts_at ? new Date(values.offer_starts_at).toLocaleDateString() : 'Start Date'}
                          </Text>
                          <MaterialIcons name="calendar-today" size={20} color="#ac94f4" />
                        </TouchableOpacity>
                        <DateTimePickerModal
                          isVisible={showStartDatePicker}
                          mode="date"
                          onConfirm={date => {
                            setFieldValue('offer_starts_at', date);
                            setShowStartDatePicker(false);
                          }}
                          onCancel={() => setShowStartDatePicker(false)}
                          accentColor="#ac94f4"
                          textColor="#ac94f4"
                        />
                      </View>
                      <View className="flex-1">
                        <TouchableOpacity
                          className="border border-gray-300 dark:border-gray-300 bg-gray-100 dark:bg-white rounded-lg p-3 flex-row justify-between items-center"
                          onPress={() => setShowEndDatePicker(true)}
                          accessibilityLabel="Select end date"
                        >
                          <Text className="text-base text-gray-800 dark:text-gray-900">
                            {values.offer_ends_at ? new Date(values.offer_ends_at).toLocaleDateString() : 'End Date'}
                          </Text>
                          <MaterialIcons name="calendar-today" size={20} color="#ac94f4" />
                        </TouchableOpacity>
                        <DateTimePickerModal
                          isVisible={showEndDatePicker}
                          mode="date"
                          onConfirm={date => {
                            setFieldValue('offer_ends_at', date);
                            setShowEndDatePicker(false);
                          }}
                          onCancel={() => setShowEndDatePicker(false)}
                          accentColor="#ac94f4"
                          textColor="#ac94f4"
                        />
                      </View>
                    </View>
                    <View className="flex-row justify-between gap-2 mt-2">
                      <View className="flex-1">
                        <TouchableOpacity
                          className="border border-gray-300 dark:border-gray-300 bg-gray-100 dark:bg-white rounded-lg p-3 flex-row justify-between items-center"
                          onPress={() => setShowStartTimePicker(true)}
                          accessibilityLabel="Select start time"
                        >
                          <Text className="text-base text-gray-800 dark:text-gray-900">
                            {values.offer_start_time ? new Date(values.offer_start_time).toLocaleTimeString() : 'Start Time'}
                          </Text>
                          <MaterialIcons name="access-time" size={20} color="#ac94f4" />
                        </TouchableOpacity>
                        <DateTimePickerModal
                          isVisible={showStartTimePicker}
                          mode="time"
                          is24Hour={false}
                          onConfirm={time => {
                            setFieldValue('offer_start_time', time);
                            setShowStartTimePicker(false);
                          }}
                          onCancel={() => setShowStartTimePicker(false)}
                          accentColor="#ac94f4"
                          textColor="#ac94f4"
                        />
                      </View>
                      <View className="flex-1">
                        <TouchableOpacity
                          className="border border-gray-300 dark:border-gray-300 bg-gray-100 dark:bg-white rounded-lg p-3 flex-row justify-between items-center"
                          onPress={() => setShowEndTimePicker(true)}
                          accessibilityLabel="Select end time"
                        >
                          <Text className="text-base text-gray-800 dark:text-gray-900">
                            {values.offer_end_time ? new Date(values.offer_end_time).toLocaleTimeString() : 'End Time'}
                          </Text>
                          <MaterialIcons name="access-time" size={20} color="#ac94f4" />
                        </TouchableOpacity>
                        <DateTimePickerModal
                          isVisible={showEndTimePicker}
                          mode="time"
                          is24Hour={false}
                          onConfirm={time => {
                            setFieldValue('offer_end_time', time);
                            setShowEndTimePicker(false);
                          }}
                          onCancel={() => setShowEndTimePicker(false)}
                          accentColor="#ac94f4"
                          textColor="#ac94f4"
                        />
                      </View>
                    </View>
                    {touched.offer_starts_at && errors.offer_starts_at && (
                      <Text className="text-red-500 text-xs mt-1">{errors.offer_starts_at}</Text>
                    )}
                    {touched.offer_ends_at && errors.offer_ends_at && (
                      <Text className="text-red-500 text-xs mt-1">{errors.offer_ends_at}</Text>
                    )}
                    {touched.offer_start_time && errors.offer_start_time && (
                      <Text className="text-red-500 text-xs mt-1">{errors.offer_start_time}</Text>
                    )}
                    {touched.offer_end_time && errors.offer_end_time && (
                      <Text className="text-red-500 text-xs mt-1">{errors.offer_end_time}</Text>
                    )}
                  </View>

                  {/* Budget */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <FontAwesome name="money" size={22} color="#ac94f4" className="mr-2" />
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Budget</Text>
                    </View>
                    <TextInput
                      className="border border-gray-300 dark:border-gray-300 bg-gray-100 dark:bg-white rounded-lg p-3 text-base text-gray-800 dark:text-gray-900"
                      placeholder="e.g., 100 💰"
                      placeholderTextColor="#6B7280"
                      onChangeText={handleChange('budget')}
                      onBlur={handleBlur('budget')}
                      value={values.budget}
                      keyboardType="numeric"
                      accessibilityLabel="Ad budget"
                    />
                    {touched.budget && errors.budget && (
                      <Text className="text-red-500 text-xs mt-1">{errors.budget}</Text>
                    )}
                  </View>



                  {/* Offer Tag */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <FontAwesome name="tag" size={22} color="#ac94f4" className="mr-2" />
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Offer Tag</Text>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                      {['Fresh Arrived', 'Buy 1 Get 1 Free', '50% Off'].map(tag => (
                        <TouchableOpacity
                          key={tag}
                          className={`rounded-full px-3 py-2 ${values.offer_tag === tag ? 'bg-primary-100' : 'bg-gray-100 dark:bg-white'}`}
                          onPress={() => setFieldValue('offer_tag', tag)}
                          accessibilityLabel={`Select ${tag} offer tag`}
                        >
                          <Text className={`text-sm font-medium ${values.offer_tag === tag ? 'text-white' : 'text-gray-900 dark:text-gray-900'}`}>
                            {tag}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {touched.offer_tag && errors.offer_tag && (
                      <Text className="text-red-500 text-xs mt-1">{errors.offer_tag}</Text>
                    )}
                  </View>

                  {/* Promotion Tag */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <FontAwesome name="star" size={22} color="#ac94f4" className="mr-2" />
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Promotion Tag</Text>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                      {['Limited Time', 'Flash Sale', 'Exclusive Offer'].map(tag => (
                        <TouchableOpacity
                          key={tag}
                          className={`rounded-full px-3 py-2 ${values.promotion_tag === tag ? 'bg-primary-100' : 'bg-gray-100 dark:bg-white'}`}
                          onPress={() => setFieldValue('promotion_tag', tag)}
                          accessibilityLabel={`Select ${tag} promotion tag`}
                        >
                          <Text className={`text-sm font-medium ${values.promotion_tag === tag ? 'text-white' : 'text-gray-900 dark:text-gray-900'}`}>
                            {tag}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {touched.promotion_tag && errors.promotion_tag && (
                      <Text className="text-red-500 text-xs mt-1">{errors.promotion_tag}</Text>
                    )}
                  </View>

                  {/* Price & Discounted Price */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <FontAwesome name="rupee" size={22} color="#ac94f4" className="mr-2" />
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Pricing</Text>
                    </View>
                    <View className="flex-row justify-between gap-2">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Original Price</Text>
                        <TextInput
                          className="border border-gray-300 dark:border-gray-300 bg-gray-100 dark:bg-white rounded-lg p-3 text-base text-gray-800 dark:text-gray-900"
                          placeholder="e.g., 20 "
                          placeholderTextColor="#6B7280"
                          onChangeText={handleChange('original_price')}
                          onBlur={handleBlur('original_price')}
                          value={values.original_price}
                          keyboardType="numeric"
                          accessibilityLabel="Original price"
                        />
                        {touched.original_price && errors.original_price && (
                          <Text className="text-red-500 text-xs mt-1">{errors.original_price}</Text>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-900 dark:text-gray-900 mb-1">Discounted Price</Text>
                        <TextInput
                          className="border border-gray-300 dark:border-gray-300 bg-gray-100 dark:bg-white rounded-lg p-3 text-base text-gray-800 dark:text-gray-900"
                          placeholder="e.g., 15 "
                          placeholderTextColor="#6B7280"
                          onChangeText={handleChange('discounted_price')}
                          onBlur={handleBlur('discounted_price')}
                          value={values.discounted_price}
                          keyboardType="numeric"
                          accessibilityLabel="Discounted price"
                        />
                        {touched.discounted_price && errors.discounted_price && (
                          <Text className="text-red-500 text-xs mt-1">{errors.discounted_price}</Text>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Status Switch */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <MaterialIcons name="toggle-on" size={22} color="#ac94f4" className="mr-2" />
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Ad Status</Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3">
                        <View className={`${values.status ? 'bg-green-500' : 'bg-red-400'} w-4 h-4 rounded-full`} />
                        <Text className="text-lg font-semibold text-gray-900 dark:text-gray-900">
                          {values.status ? 'Live' : 'Offline'}
                        </Text>
                      </View>
                      <Switch
                        value={values.status}
                        onValueChange={value => setFieldValue('status', value)}
                        trackColor={{ false: '#EF4444', true: '#10B981' }}
                        thumbColor="#f4f3f4"
                        accessibilityLabel="Toggle ad status"
                        size="small"
                      />
                    </View>
                    {touched.status && errors.status && (
                      <Text className="text-red-500 text-xs mt-1">{errors.status}</Text>
                    )}
                  </View>

                  {/* Ad Preview */}
                  <View className="bg-white dark:bg-white rounded-lg p-4 mb-4" style={styles.shadow}>
                    <View className="flex-row items-center mb-2">
                      <MaterialIcons name="visibility" size={22} color="#ac94f4" className="mr-2" />
                      <Text className="text-base font-semibold text-gray-900 dark:text-gray-900">Ad Preview</Text>
                    </View>
                    <View className="border border-gray-300 dark:border-gray-300 rounded-lg p-4 bg-gray-100 dark:bg-white">
                      <Text className="text-lg font-bold text-gray-900 dark:text-gray-900">
                        {values.ad_title || 'Your Ad Title '}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-sm text-gray-600 dark:text-gray-400">{values.ads_type || 'Ad Type'}</Text>
                        <Text className="text-sm text-gray-800 dark:text-gray-800 ml-2">
                          {values.ads_type === 'Promote Product' ? '🛍️' : values.ads_type === 'Special Offer' ? '🎉' : '🎈'}
                        </Text>
                      </View>
                      {images.length > 0 && (
                        <Image source={{ uri: images[0].uri }} className="w-full h-48 rounded-lg mt-2" resizeMode="cover" accessibilityLabel="Ad preview image" />
                      )}
                      <Text className="text-base text-gray-800 dark:text-gray-900 mt-2">
                        {values.caption || 'Your short caption goes here!'}
                      </Text>
                      <View className="flex-col justify-between mt-2">
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                          {values.offer_starts_at ? new Date(values.offer_starts_at).toLocaleDateString() : 'Start Date'} •{' '}
                          {values.offer_start_time ? new Date(values.offer_start_time).toLocaleTimeString() : 'Start Time'}
                        </Text>
                        {/* <Text className='flex-row items-center mx-1'>|</Text> */}
                        <Text className="text-sm text-gray-600 dark:text-gray-400">
                          {values.offer_ends_at ? new Date(values.offer_ends_at).toLocaleDateString() : 'End Date'} •{' '}
                          {values.offer_end_time ? new Date(values.offer_end_time).toLocaleTimeString() : 'End Time'}
                        </Text>
                      </View>
                      <View className="flex-row justify-between mt-2">
                        <Text className="text-sm font-medium text-gray-800 dark:text-gray-800">
                          Price: ₹{values.original_price || '0'} {values.discounted_price ? `→ ₹${values.discounted_price}` : ''}
                        </Text>
                        <Text className="text-sm font-medium text-gray-800 dark:text-gray-800">
                          Budget: ₹{values.budget || '0'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Submit Button */}
                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting || isFetching}
                    className={`rounded-lg p-4 items-center my-4 ${isSubmitting || isFetching ? 'bg-primary-100/50' : 'bg-primary-100'}`}
                    accessibilityLabel={adDetails ? 'Update ad' : 'Create ad'}
                  >
                    <Text className="text-white text-base font-bold">
                      {isSubmitting ? 'Saving...' : adDetails ? 'Update Ad ' : 'Create Ad '}
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

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 5.84,
    elevation: 2,
  },
});

export default CreateAdScreen;