import React, { useState, useEffect } from 'react';
import {
  View, Text, Dimensions, Image, TouchableOpacity,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
  ToastAndroid, Modal, FlatList, StyleSheet,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import IconM from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MultiSelect from 'react-native-multiple-select';
import { fetchUser } from '../../store/slices/userSlice';
import { TokenStorage, Post, IMAGE_URL, Fetch } from '../../utils/apiUtils';
import { convertShiftData, revertShiftData } from '../../utils/tools/shiftConverter';
import { ImagePath } from '../../constants/ImagePath';
import { states } from '../../utils/data/constant';
import ShiftCard from '../../components/common/ShiftCard';
import { getCurrentLocationWithAddress } from '../../utils/tools/locationServices';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('screen');
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const validationSchema = Yup.object().shape({
  business_name: Yup.string().required('Business name is required'),
  phone: Yup.string().matches(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number').required(),
  address: Yup.string().required('Address is required'),
  zip_code: Yup.string().required('Zip Code is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  about_business: Yup.string().required('About shop is required'),
  single_shift: Yup.string().required('Opening days selection is required'),
  dine_in_service: Yup.string().required('Dine-in service selection is required'),
});

const CreateShopScreen = ({ route }: any) => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { data: user } = useSelector((state: any) => state.user);
  const shopId = route?.params?.shopId ?? null;
  const [loading, setLoading] = useState<any>(false);
  const [images, setImages] = useState<any>([]);
  const [viewImageModal, setViewImageModal] = useState<any>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [isLocation, setIsLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(user?.shop?.shop_category ?? [])
  const [schedules, setSchedules] = useState<any>(daysOfWeek.map(day => ({
    day, status: false, shift1: { from: '', to: '' }, shift2: { from: '', to: '' }, state: 'active'
  })));
  const [paymentMethods, setPaymentMethods] = useState<any>({ cash: false, card: false, upi: false });
  const [apiErrors, setApiErrors] = useState("");



  const handleSameForAll = (values: any) => {
    // Find the first filled shift (you can change to pick Monday explicitly if needed)
    const reference = schedules.find((s: any) => s.shift1.from && s.shift1.to);

    if (!reference) return;

    const updated = schedules.map((s: any) => ({
      ...s,
      shift1: { ...reference.shift1 },
      shift2:
        values.single_shift !== 'Single Shift'
          ? { ...reference.shift2 }
          : { from: '', to: '' },
      status: reference.status, // ✅ Update status (Switch)
    }));

    setSchedules(updated);
  };


  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response: any = await Fetch(
        `/user/admin-category?per_page=1000&page=1`,
        {},
        5000
      );
      console.log(response)
      if (!response?.success) {
        console.error('Fetch categories error:', response?.message);
        throw new Error(response?.message || 'Failed to fetch categories');
      }

      setCategories(response?.data || []);
    } catch (error: any) {
      console.log(error)
      console.error('Unexpected error while fetching categories:', error);
      // Optionally show an alert or toast
    } finally {
      setLoading(false)
    }
  };


  const getLiveLocation = async (setFieldValue: any) => {
    try {
      setIsLocation(true); // Start loading
      setApiErrors("")
      const location = await getCurrentLocationWithAddress(setLocationData, dispatch, user);
      console.log(locationData, location)
      if (location?.address) {
        // Update Formik fields
        const address = `${location.address.landmark}, ${location.address.locality}`;
        setFieldValue('address', address);
        setFieldValue('zip_code', location.address.pincode || '');
        setFieldValue('city', location.address.city || '');
        setFieldValue('state', location.address.state || '');
        // setLocationData(location);

        // Log to verify updates
        console.log('Updated Formik values:', {
          address,
          zip_code: location.address.pincode,
          city: location.address.city,
          state: location.address.state,
        });
      } else {
        console.warn('No address data found in location:', location);
        ToastAndroid.show('No address data available', ToastAndroid.SHORT);
      }
    } catch (error: any) {
      setApiErrors(error)
      console.error("Failed to get location:", error);
      ToastAndroid.show('Failed to fetch location', ToastAndroid.SHORT);
    } finally {
      setIsLocation(false); // Stop loading
    }
  };

  useEffect(() => {
    if (shopId) dispatch(fetchUser());
  }, [shopId]);

  useEffect(() => {
    if (!shopId || !user?.shop) return;

    const remoteImgs = (user.shop.restaurant_images || []).map((url: any) => ({
      id: `remote_${url}`, uri: IMAGE_URL + url, remote: true,
    }));
    setImages(remoteImgs);


    if (user.shop.shift_details) {
      setSchedules(revertShiftData(user?.shop?.shift_details && JSON.parse(user?.shop?.shift_details)));
    }

    setPaymentMethods({
      cash: !!user.shop.payment_cash,
      card: !!user.shop.payment_card,
      upi: !!user.shop.payment_upi,
    });
  }, [user?.shop]);

  const handleShiftChange = (index: any) => (updated: any) => {
    setSchedules((prev: any) => {
      const copy = [...prev];
      copy[index] = updated;
      return copy;
    });
  };

  const handleImageUpload = async () => {
    if (images.filter((img: any) => !img.remote).length >= 5) {
      return ToastAndroid.show('Maximum 5 images allowed!', ToastAndroid.SHORT);
    }

    const res = await ImagePicker.launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (res.assets?.[0]?.uri) {
      const asset = res.assets[0];
      setImages((prev: any) => [...prev, {
        id: `local_${Date.now()}`,
        uri: asset.uri,
        fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
        type: asset?.type ?? 'image/jpeg',
        remote: false,
      }]);
    }
  };

  const handleRemoveImage = (id: any) => setImages((prev: any) => prev.filter((img: any) => img.id !== id));

  const handleSubmit = async (values: any, { setSubmitting, resetForm, setErrors }: any) => {
    try {
      setSubmitting(true);
      setIsLoading(true)
      const formData = new FormData();

      formData.append('business_name', values.business_name);
      formData.append('phone', values.phone);
      formData.append('gst', values.gst);
      formData.append('address', values.address);
      formData.append('zip_code', values.zip_code);
      formData.append('city', values.city);
      formData.append('state', values.state);
      formData.append('longitude', shopId ? user?.shop?.longitude : locationData?.longitude);
      formData.append('latitude', shopId ? user?.shop?.latitude : locationData?.latitude);
      formData.append('about_business', values.about_business);
      formData.append('single_shift', values.single_shift === 'Single Shift' ? 1 : 0);
      formData.append('dine_in_service', values.dine_in_service === 'yes' ? 1 : 0);
      formData.append('shift_details', JSON.stringify(convertShiftData(schedules)));
      formData.append('payment_cash', paymentMethods.cash ? 1 : 0);
      formData.append('payment_card', paymentMethods.card ? 1 : 0);
      formData.append('payment_upi', paymentMethods.upi ? 1 : 0);

      selectedCategory?.forEach((category: any, index: any) => {
        formData.append(`shop_category[${index}]`, category)
      })

      if (shopId) formData.append('_method', 'PUT');
      images.forEach((img: any, index: any) => {
        formData.append('business_image[]', {
          uri: Platform.OS === 'ios' ? img.uri.replace('file://', '') : img.uri,
          name: img.fileName || `photo_${index}.jpg`,
          type: img?.type || 'image/jpeg',
        });
      });
      const response: any = await Post('/user/shop', formData, 5000);
      if (!response.success) throw new Error(response.message || 'Failed to save shop.');

      ToastAndroid.show(shopId ? 'Shop updated' : 'Shop created', ToastAndroid.SHORT);
      if (!shopId) {
        resetForm();
        setImages([]);
        setSchedules(daysOfWeek.map(day => ({
          day, status: false, shift1: { from: '', to: '' }, shift2: { from: '', to: '' }, state: 'active',
        })));
      }

      if (values?.dine_in_service === "yes") {
        shopId ?
          navigation.navigate('AddDineInServiceScreen', { shopId }) : navigation.replace("AddDineInServiceScreen")
      } else {
        navigation.replace("HomeScreen")
      }
    } catch (error: any) {
      ToastAndroid.show(error.message || 'Something went wrong', ToastAndroid.SHORT);
      if (error.errors) {
        const formattedErrors: any = {};
        for (const key in error.errors) {
          formattedErrors[key] = error.errors[key][0];
        }
        setErrors(formattedErrors);
        setApiErrors(error?.errors?.latitude || "Live location is Requied")
      }
    } finally {
      setIsLoading(false)
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchCategories();
    }
  }, [isFocused]);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {(isLocation || isLoading) && (
          <View className='w-screen h-screen bg-black/50 absolute left-0 top-0 z-[100000] '>
            <ActivityIndicator className='m-auto' color={"#B68AD4"} size={"large"} />
          </View>
        )}
        <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          <Image
            source={ImagePath.signBg}
            style={{
              position: 'absolute',
              top: '-2%',
              left: '-2%',
              width: 208,
              height: 176,
              tintColor: "#ac94f4"
            }}
            resizeMode="contain"
          />
          <View style={{ marginTop: 40 }}>
            <MaskedView
              maskElement={
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 30,
                    fontWeight: 'bold',
                    fontFamily: 'Poppins',
                  }}>
                  {shopId ? 'Edit Your Shop' : 'Create Your Shop'}
                </Text>
              }>
              <LinearGradient
                colors={['#ac94f4', '#7248B3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 30,
                    fontWeight: 'bold',
                    fontFamily: 'Poppins',
                    opacity: 0,
                  }}>
                  {shopId ? 'Edit Your Shop' : 'Create Your Shop'}
                </Text>
              </LinearGradient>
            </MaskedView>
            <Text
              style={{ textAlign: 'center', marginVertical: 8, color: '#4B5563' }}>
              {shopId
                ? 'Update your shop details.'
                : 'Set up your shop details to get started.'}
            </Text>

            {loading && shopId ? (
              <View>
                <Text className='text-center'>Loading shop data...</Text>
                <ActivityIndicator size={"large"} color={"#B68AD4"} />
              </View>
            ) : (
              <Formik
                initialValues={{
                  business_name: shopId ? user?.shop?.restaurant_name : '',
                  shop_category: shopId ? user?.shop?.shop_category : [],
                  phone: shopId ? user?.shop?.phone : '',
                  gst: shopId ? user?.shop?.gst : '',
                  address: shopId ? user?.shop?.address : '',
                  zip_code: shopId ? user?.shop?.zip_code : '',
                  city: shopId ? user?.shop?.city : '',
                  state: shopId ? user?.shop?.state : '',
                  about_business: shopId ? user?.shop?.about_business : '',
                  single_shift: shopId ? (user?.shop?.single_shift ? "Single Shift" : "Double Shift") : '',
                  dine_in_service: shopId ? (user?.shop?.dine_in_service ? "yes" : "no") : '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
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
                  <View style={{ marginTop: 16 }}>
                    {/* Business Name */}
                    <View style={{ marginBottom: 12 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: 4,
                        }}>
                        Business Name
                      </Text>
                      <View style={{ position: 'relative' }}>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: '#D1D5DB',
                            backgroundColor: '#F3F4F6',
                            borderRadius: 8,
                            padding: 12,
                            paddingLeft: 40,
                            fontSize: 16,
                          }}
                          className='text-gray-900'
                          placeholder="Shop Name"
                          placeholderTextColor={"gray"}
                          onChangeText={handleChange('business_name')}
                          onBlur={handleBlur('business_name')}
                          value={values.business_name}
                          accessible
                          accessibilityLabel="Business name input"
                        />
                        <Icon
                          name="storefront-outline"
                          size={20}
                          color="#4B5563"
                          style={{ position: 'absolute', left: 12, top: 12 }}
                        />
                      </View>
                      {touched.business_name && errors.business_name && (
                        <Text
                          style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.business_name}
                        </Text>
                      )}
                    </View>

                    <View>
                      <MultiSelect
                        hideTags={false}
                        items={categories}
                        uniqueKey="id"
                        onSelectedItemsChange={(selected) => {
                          setSelectedCategory(selected)
                        }}
                        selectedItems={selectedCategory}
                        selectText="Select shop category"
                        searchInputPlaceholderText="Search Categories..."
                        tagRemoveIconColor="#CCC"
                        tagBorderColor="#CCC"
                        tagTextColor="#000"
                        selectedItemTextColor="#000"
                        selectedItemIconColor="#000"
                        itemTextColor="#000"
                        displayKey="name"
                        searchInputStyle={{ color: '#000' }}
                        submitButtonColor="#ac94f4"
                        submitButtonText="Confirm"
                        styleMainWrapper={{
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          padding: 10,
                          minHeight: 100,
                        }}
                        styleDropdownMenuSubsection={{
                          paddingLeft: 0,
                          paddingRight: 0,
                          height: 50,
                          backgroundColor: 'transparent',
                          borderBottomWidth: 0,
                        }}
                      />

                      {touched.shop_category && selectedCategory?.length === 0 && (
                        <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.shop_category}
                        </Text>
                      )}
                    </View>

                    {/* Store Image Upload */}
                    <View style={{ marginBottom: 12 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: 4,
                        }}>
                        Store Images
                      </Text>
                      <TouchableOpacity
                        onPress={handleImageUpload}
                        style={{
                          borderWidth: 2,
                          borderColor: '#D1D5DB',
                          borderStyle: 'dashed',
                          borderRadius: 8,
                          height: 100,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#F9FAFB',
                        }}
                        accessible
                        accessibilityLabel="Upload store images">
                        <Icon
                          name="add-circle-outline"
                          size={30}
                          color="#4B5563"
                        />
                        <Text
                          style={{ color: '#4B5563', fontSize: 14, marginTop: 4 }}>
                          Upload store front and other images
                        </Text>
                      </TouchableOpacity>
                      {images.length > 0 && (
                        <FlatList
                          horizontal
                          data={images}
                          keyExtractor={(item, index) => index.toString()}
                          renderItem={({ item }) => (
                            <View
                              style={{
                                marginTop: 8,
                                marginRight: 8,
                                position: 'relative',
                              }}>
                              <TouchableOpacity
                                onPress={() => setViewImageModal(item.uri)}
                                accessible
                                accessibilityLabel="View uploaded image">
                                <Image
                                  source={{ uri: item.uri }}
                                  style={{ width: 80, height: 80, borderRadius: 8 }}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={{ position: 'absolute', top: -8, right: -8 }}
                                onPress={() => handleRemoveImage(item.id)}
                                accessible
                                accessibilityLabel="Remove uploaded image">
                                <Icon
                                  name="close-circle"
                                  size={24}
                                  color="#EF4444"
                                />
                              </TouchableOpacity>
                            </View>
                          )}
                          style={{ marginTop: 8 }}
                        />
                      )}
                    </View>

                    {/* Phone Number */}
                    <View style={{ marginBottom: 12 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: 4,
                        }}>
                        Phone Number
                      </Text>
                      <View style={{ position: 'relative' }}>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: '#D1D5DB',
                            backgroundColor: '#F3F4F6',
                            borderRadius: 8,
                            padding: 12,
                            paddingLeft: 40,
                            fontSize: 16,
                          }}
                          className='text-gray-900'
                          placeholderTextColor={"#252525"}
                          placeholder="Enter phone number"
                          onChangeText={handleChange('phone')}
                          onBlur={handleBlur('phone')}
                          value={values.phone}
                          keyboardType="number-pad"
                          maxLength={10}
                          accessible
                          accessibilityLabel="Phone number input"
                        />
                        <Icon
                          name="call-outline"
                          size={20}
                          color="#4B5563"
                          style={{ position: 'absolute', left: 12, top: 12 }}
                        />
                      </View>
                      {touched.phone && errors.phone && (
                        <Text
                          style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.phone}
                        </Text>
                      )}
                    </View>

                    {/* GST ID */}
                    <View style={{ marginBottom: 12 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: 4,
                        }}>
                        GST ID
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
                        className='text-gray-900'
                        placeholderTextColor={"#252525"}
                        placeholder="Enter GST ID"
                        onChangeText={handleChange('gst')}
                        onBlur={handleBlur('gst')}
                        value={values.gst}
                        accessible
                        accessibilityLabel="GST ID input"
                      />
                      {touched.gst && errors.gst && (
                        <Text
                          style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.gst}
                        </Text>
                      )}
                    </View>

                    {/* Address Fields */}
                    <View style={{ marginBottom: 12 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: 4,
                        }}>
                        Address
                      </Text>
                      <TouchableOpacity
                        onPress={() => getLiveLocation(setFieldValue)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 12,
                        }}
                        accessible
                        accessibilityLabel="Pin your location">
                        <Icon name="location-outline" size={20} color="#4B5563" />
                        <Text
                          style={{
                            color: '#ac94f4',
                            fontSize: 14,
                            marginLeft: 4,
                            textDecorationLine: 'underline',
                          }}>
                          Pin your location
                        </Text>
                      </TouchableOpacity>
                      {apiErrors && (
                        <Text
                          className='text-center'
                          style={{ color: '#EF4444', fontSize: 12, }}>
                          {"Please enable location services, Try agian"}
                        </Text>
                      )}
                      <View style={{ marginVertical: 8 }}>
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: '#D1D5DB',
                            backgroundColor: '#F3F4F6',
                            borderRadius: 8,
                            padding: 12,
                            fontSize: 16,
                          }}
                          className='text-gray-900'
                          placeholderTextColor={"#252525"}
                          placeholder="Enter your city"
                          onChangeText={handleChange('city')}
                          onBlur={handleBlur('city')}
                          value={values.city}
                          accessible
                          accessibilityLabel="City"
                        />
                      </View>
                      {touched.city && errors.city && (
                        <Text
                          style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.city}
                        </Text>
                      )}
                      <View
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          marginVertical: 8,
                        }}>
                        <Picker
                          selectedValue={values.state}
                          onValueChange={(value) => setFieldValue('state', value)}
                          style={{ fontSize: 16, height: 50, color: "#000" }}
                          accessible
                          accessibilityLabel="Select state">
                          <Picker.Item label="Select State" value="" />
                          {states.map((state) => (
                            <Picker.Item key={state?.id} label={state?.name} value={state?.name} />
                          ))}
                        </Picker>
                      </View>
                      {touched.state && errors.state && (
                        <Text
                          style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.state}
                        </Text>
                      )}
                      <TextInput
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 16,
                          marginBottom: 12,
                        }}
                        className='text-gray-900'
                        placeholderTextColor={"#252525"}
                        placeholder="Enter your address"
                        onChangeText={handleChange('address')}
                        onBlur={handleBlur('address')}
                        value={values.address}
                        accessible
                        accessibilityLabel="Address input"
                      />
                      {touched.address && errors.address && (
                        <Text
                          style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.address}
                        </Text>
                      )}
                      <TextInput
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 16,
                          marginBottom: 12,
                        }}
                        className='text-gray-900'
                        placeholderTextColor={"#252525"}
                        placeholder="Enter your zip code"
                        onChangeText={handleChange('zip_code')}
                        onBlur={handleBlur('zip_code')}
                        value={values.zip_code}
                        keyboardType="numeric"
                        accessible
                        accessibilityLabel="Zip Code"
                      />
                      {touched.zip_code && errors.zip_code && (
                        <Text
                          style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.zip_code}
                        </Text>
                      )}
                    </View>

                    {/* About Shop */}
                    <View style={{ marginBottom: 12 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: 4,
                        }}>
                        About Shop
                      </Text>
                      <TextInput
                        style={{
                          borderWidth: 1,
                          borderColor: '#D1D5DB',
                          backgroundColor: '#F3F4F6',
                          borderRadius: 8,
                          padding: 12,
                          fontSize: 16,
                          height: 100,
                          textAlignVertical: 'top',
                        }}
                        className='text-gray-900'
                        placeholderTextColor={"gray"}
                        placeholder="Describe your shop"
                        onChangeText={handleChange('about_business')}
                        onBlur={handleBlur('about_business')}
                        value={values.about_business}
                        multiline
                        accessible
                        accessibilityLabel="About shop textarea"
                      />
                      {touched.about_business && errors.about_business && (
                        <Text
                          style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.about_business}
                        </Text>
                      )}
                    </View>

                    {/* Opening Days */}
                    <View style={{ marginBottom: 12 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: 4,
                        }}>
                        Opening Days
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <TouchableOpacity
                          className="bg-gray-100"
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: values.single_shift === 'Single Shift' ? '#F97316' : '#D1D5DB',
                            borderRadius: 8,
                            padding: 12,
                            marginRight: 8,
                            alignItems: 'center',
                          }}
                          onPress={() => handleChange('single_shift')('Single Shift')}
                          accessible
                          accessibilityLabel="Select Single Shift">
                          <Text style={{ fontSize: 14, color: '#374151' }}>
                            Single Shift
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-gray-100"
                          style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: values.single_shift === 'Double Shift' ? '#F97316' : '#D1D5DB',
                            borderRadius: 8,
                            padding: 12,
                            alignItems: 'center',
                          }}
                          onPress={() => handleChange('single_shift')('Double Shift')}
                          accessible
                          accessibilityLabel="Select Double Shift">
                          <Text style={{ fontSize: 14, color: '#374151' }}>
                            Double Shift
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {touched.single_shift && errors.single_shift && (
                        <Text
                          style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.single_shift}
                        </Text>
                      )}
                      <TouchableOpacity
                        style={styles.sameForAllButton}
                        onPress={handleSameForAll}
                      >
                        <Text style={styles.sameForAllText}> Same Shift for All</Text>
                      </TouchableOpacity>

                      {schedules.map((data: any, index: any) => (
                        <ShiftCard
                          key={data.day}
                          shift={values.single_shift !== 'Single Shift' ? 2 : 1}
                          data={data}
                          onChange={handleShiftChange(index)}
                        />
                      ))}
                    </View>

                    {/* Dine-in Service */}
                    <View style={{ marginBottom: 12 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: 10,
                        }}>
                        Are you Providing Dine-in Service?
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          gap: 5
                        }}>
                        <TouchableOpacity
                          className="bg-gray-100"
                          style={{
                            borderWidth: 1,
                            borderColor: values.dine_in_service === 'yes' ? '#ac94f4' : '#D1D5DB',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 5,
                            alignItems: 'center',
                          }}
                          onPress={() => handleChange('dine_in_service')('yes')}
                          accessible
                          accessibilityLabel="Yes Dine-in Service">
                          <Text style={{ fontSize: 14, color: '#374151' }}>
                            Yes
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="bg-gray-100"
                          style={{
                            borderWidth: 1,
                            borderColor: values.dine_in_service === 'no' ? '#ac94f4' : '#D1D5DB',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 5,
                            marginRight: 8,
                            alignItems: 'center',
                          }}
                          onPress={() => handleChange('dine_in_service')('no')}
                          accessible
                          accessibilityLabel="No Dine-in Service">
                          <Text style={{ fontSize: 14, color: '#374151' }}>No</Text>
                        </TouchableOpacity>
                      </View>
                      {touched.dine_in_service && errors.dine_in_service && (
                        <Text
                          style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.dine_in_service}
                        </Text>
                      )}
                    </View>

                    {/* Payment Methods */}
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: 8,
                      }}>
                      Payment Acceptance By
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 16, marginBottom: 16 }}>
                      <TouchableOpacity
                        onPress={() => setPaymentMethods({ ...paymentMethods, cash: !paymentMethods.cash })}
                        style={styles.checkboxContainer}>
                        <View
                          style={[styles.checkbox, paymentMethods.cash && styles.checkboxSelected]}>
                          {paymentMethods.cash && <IconM name="check" size={13} color="#fff" />}
                        </View>
                        <Text style={styles.checkboxText}>Cash</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setPaymentMethods({ ...paymentMethods, card: !paymentMethods.card })}
                        style={styles.checkboxContainer}>
                        <View
                          style={[styles.checkbox, paymentMethods.card && styles.checkboxSelected]}>
                          {paymentMethods.card && <IconM name="check" size={13} color="#fff" />}
                        </View>
                        <Text style={styles.checkboxText}>Card</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setPaymentMethods({ ...paymentMethods, upi: !paymentMethods.upi })}
                        style={styles.checkboxContainer}>
                        <View
                          style={[styles.checkbox, paymentMethods.upi && styles.checkboxSelected]}>
                          {paymentMethods.upi && <IconM name="check" size={13} color="#fff" />}
                        </View>
                        <Text style={styles.checkboxText}>UPI</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      disabled={isSubmitting}
                      style={{ marginTop: 16 }}
                      accessible
                      accessibilityLabel={shopId ? 'Update shop button' : 'Create shop button'}>
                      <LinearGradient
                        colors={['#ac94f4', '#7248B3']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ padding: 16, borderRadius: 10, alignItems: 'center' }}>
                        <Text
                          style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                          {isSubmitting
                            ? shopId
                              ? 'Updating...'
                              : 'Creating...'
                            : shopId
                              ? 'Update Shop'
                              : 'Create Shop'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            )}
          </View>
        </ScrollView>

        {/* Image View Modal */}
        {viewImageModal && (
          <Modal
            visible={!!viewImageModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setViewImageModal(null)}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              }}>
              <View
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  padding: 16,
                  alignItems: 'center',
                }}>
                <Image
                  source={{ uri: viewImageModal }}
                  style={{
                    width: width * 0.8,
                    height: width * 0.8,
                    borderRadius: 8,
                  }}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', top: 8, right: 8 }}
                  onPress={() => setViewImageModal(null)}
                  accessible
                  accessibilityLabel="Close image modal">
                  <Icon name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )
        }
      </KeyboardAvoidingView >
    </SafeAreaView>
  );
};

export default CreateShopScreen;

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 15,
    height: 15,
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#ac94f4',
    borderColor: '#ac94f4',
  },
  checkboxText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Raleway-Regular',
  },
  sameForAllButton: {
    marginTop: 10,
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  sameForAllText: {
    padding: 4,
    textAlign: "center",
    color: '#000',
    fontFamily: 'Raleway-SemiBold',
  },
});