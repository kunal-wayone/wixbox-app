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
  FlatList,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {Formik} from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Ionicons';
import {ImagePath} from '../../constants/ImagePath';
import ShiftCard, {ShiftData} from '../../components/common/ShiftCard';
import * as ImagePicker from 'react-native-image-picker'; // Added for image picking
import { useNavigation } from '@react-navigation/native';

const {width} = Dimensions.get('screen');

// Validation schema
const validationSchema = Yup.object().shape({
  businessName: Yup.string().required('Business name is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Must be a valid 10-digit phone number')
    .required('Phone number is required'),
  gstId: Yup.string()
    // .matches(
    //   /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    //   'Invalid GST ID format',
    // )
    .required('GST ID is required'),
  addressLine1: Yup.string().required('Address Line 1 is required'),
  addressLine2: Yup.string(),
  addressLine3: Yup.string(),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  aboutShop: Yup.string().required('About shop is required'),
  openingDays: Yup.string().required('Opening days selection is required'),
  dineInService: Yup.string().required('Dine-in service selection is required'),
});

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CreateShopScreen = ({route}: any) => {
  const navigation = useNavigation<any>()
  const [images, setImages] = useState<any>([]);
  const [viewImageModal, setViewImageModal] = useState(null);
  const [schedules, setSchedules] = useState(
    daysOfWeek.map(day => ({
      day,
      isEnabled: false,
      shift1: {from: '', to: ''},
      shift2: {from: '', to: ''},
      state: 'active',
    })),
  );
  const [shopId, setShopId] = useState(route?.params?.shopId || null); // For edit mode
  const [loading, setLoading] = useState(false);

  // Fetch shop data for edit mode
  useEffect(() => {
    if (shopId) {
      fetchShopData();
    }
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://api.example.com/shops/${shopId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${yourAuthToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch shop data');
      }

      const shopData = await response.json();
      setImages(shopData.images || []);
      setSchedules(shopData.schedules || schedules);
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Failed to load shop data',
        ToastAndroid.SHORT,
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle updates to a specific day's shift data
  const handleShiftChange = (index: any) => (updatedData: any) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index] = updatedData;
    setSchedules(updatedSchedules);
  };

  // Image upload handler
  const handleImageUpload = async () => {
    if (images.length >= 5) {
      ToastAndroid.show('Maximum 5 images allowed!', ToastAndroid.SHORT);
      return;
    }

    try {
      const response = await ImagePicker.launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
      });

      if (response.assets && response.assets[0].uri) {
        const newImage = {
          id: Date.now(),
          uri: response.assets[0].uri,
          fileName: response.assets[0].fileName || `image_${Date.now()}`,
          type: response.assets[0].type,
        };
        setImages([...images, newImage]);
        ToastAndroid.show('Image uploaded successfully!', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Failed to upload image', ToastAndroid.SHORT);
    }
  };

  // Remove image
  const handleRemoveImage = (id: any) => {
    setImages(images.filter((img: any) => img.id !== id));
    ToastAndroid.show('Image removed successfully!', ToastAndroid.SHORT);
  };

  // Handle form submission (POST for create, PUT for update)
  const handleSubmit = async (values: any, {setSubmitting, resetForm}: any) => {
    try {
      setSubmitting(true);
navigation.navigate("AddDineInServiceScreen")
      // Prepare form data for images
      const formData = new FormData();
      formData.append('businessName', values.businessName);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('gstId', values.gstId);
      formData.append('addressLine1', values.addressLine1);
      formData.append('addressLine2', values.addressLine2);
      formData.append('addressLine3', values.addressLine3);
      formData.append('city', values.city);
      formData.append('state', values.state);
      formData.append('aboutShop', values.aboutShop);
      formData.append('openingDays', values.openingDays);
      formData.append('dineInService', values.dineInService);
      formData.append('schedules', JSON.stringify(schedules));

      // Append images to form data
      images.forEach((image: any, index: any) => {
        formData.append('images', {
          uri: image.uri,
          name: image.fileName,
          type: image.type,
        });
      });

      const url = shopId
        ? `https://api.example.com/shops/${shopId}`
        : 'https://api.example.com/shops';
      const method = shopId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          // Add authorization header if needed
          // 'Authorization': `Bearer ${yourAuthToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(shopId ? 'Shop update failed' : 'Shop creation failed');
      }

      ToastAndroid.show(
        shopId ? 'Shop updated successfully!' : 'Shop created successfully!',
        ToastAndroid.SHORT,
      );

      if (!shopId) {
        resetForm();
        setImages([]);
        setSchedules(
          daysOfWeek.map(day => ({
            day,
            isEnabled: false,
            shift1: {from: '', to: ''},
            shift2: {from: '', to: ''},
            state: 'active',
          })),
        );
      }
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Something went wrong. Please try again.',
        ToastAndroid.SHORT,
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Mock location pinning
  const handlePinLocation = () => {
    ToastAndroid.show(
      'Location pinning not implemented yet!',
      ToastAndroid.SHORT,
    );
    // Integrate with react-native-maps or geolocation service here
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
        <View style={{marginTop: 40}}>
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
                {shopId ? 'Edit Your Shop' : 'Create Your Shop'}
              </Text>
            </LinearGradient>
          </MaskedView>
          <Text
            style={{textAlign: 'center', marginVertical: 8, color: '#4B5563'}}>
            {shopId
              ? 'Update your shop details.'
              : 'Set up your shop details to get started.'}
          </Text>

          {loading ? (
            <Text>Loading shop data...</Text>
          ) : (
            <Formik
              initialValues={{
                businessName: '',
                phoneNumber: '',
                gstId: '',
                addressLine1: '',
                addressLine2: '',
                addressLine3: '',
                city: '',
                state: '',
                aboutShop: '',
                openingDays: '',
                dineInService: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize // Allow form to reinitialize with fetched data
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isSubmitting,
              }) => (
                <View style={{marginTop: 16}}>
                  {/* Business Name */}
                  <View style={{marginBottom: 12}}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: 4,
                      }}>
                      Business Name
                    </Text>
                    <View style={{position: 'relative'}}>
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
                        placeholder="Shop Name"
                        onChangeText={handleChange('businessName')}
                        onBlur={handleBlur('businessName')}
                        value={values.businessName}
                        accessible
                        accessibilityLabel="Business name input"
                      />
                      <Icon
                        name="storefront-outline"
                        size={20}
                        color="#4B5563"
                        style={{position: 'absolute', left: 12, top: 12}}
                      />
                    </View>
                    {touched.businessName && errors.businessName && (
                      <Text
                        style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                        {errors.businessName}
                      </Text>
                    )}
                  </View>

                  {/* Store Image Upload */}
                  <View style={{marginBottom: 12}}>
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
                        style={{color: '#4B5563', fontSize: 14, marginTop: 4}}>
                        Upload store front and other images
                      </Text>
                    </TouchableOpacity>
                    {images.length > 0 && (
                      <FlatList
                        horizontal
                        data={images}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({item}) => (
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
                                source={{uri: item.uri}}
                                style={{width: 80, height: 80, borderRadius: 8}}
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{position: 'absolute', top: -8, right: -8}}
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
                        style={{marginTop: 8}}
                      />
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
                    <View style={{position: 'relative'}}>
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
                        placeholder="Enter phone number"
                        onChangeText={handleChange('phoneNumber')}
                        onBlur={handleBlur('phoneNumber')}
                        value={values.phoneNumber}
                        keyboardType="number-pad"
                        maxLength={10}
                        accessible
                        accessibilityLabel="Phone number input"
                      />
                      <Icon
                        name="call-outline"
                        size={20}
                        color="#4B5563"
                        style={{position: 'absolute', left: 12, top: 12}}
                      />
                    </View>
                    {touched.phoneNumber && errors.phoneNumber && (
                      <Text
                        style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                        {errors.phoneNumber}
                      </Text>
                    )}
                  </View>

                  {/* GST ID */}
                  <View style={{marginBottom: 12}}>
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
                      placeholder="Enter GST ID"
                      onChangeText={handleChange('gstId')}
                      onBlur={handleBlur('gstId')}
                      value={values.gstId}
                      accessible
                      accessibilityLabel="GST ID input"
                    />
                    {touched.gstId && errors.gstId && (
                      <Text
                        style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                        {errors.gstId}
                      </Text>
                    )}
                  </View>

                  {/* Address Fields */}
                  <View style={{marginBottom: 12}}>
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
                      onPress={handlePinLocation}
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
                          color: '#F97316',
                          fontSize: 14,
                          marginLeft: 4,
                          textDecorationLine: 'underline',
                        }}>
                        Pin your location
                      </Text>
                    </TouchableOpacity>
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
                        selectedValue={values.city}
                        onValueChange={handleChange('city')}
                        style={{
                          fontSize: 16,
                          height: 50,
                        }}
                        accessible
                        accessibilityLabel="Select city">
                        <Picker.Item label="Select City" value="" />
                        <Picker.Item label="Mumbai" value="Mumbai" />
                        <Picker.Item label="Delhi" value="Delhi" />
                        <Picker.Item label="Bangalore" value="Bangalore" />
                      </Picker>
                    </View>
                    {touched.city && errors.city && (
                      <Text
                        style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
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
                        onValueChange={handleChange('state')}
                        style={{
                          fontSize: 16,
                          height: 50,
                        }}
                        accessible
                        accessibilityLabel="Select state">
                        <Picker.Item label="Select State" value="" />
                        <Picker.Item label="Maharashtra" value="Maharashtra" />
                        <Picker.Item label="Delhi" value="Delhi" />
                        <Picker.Item label="Karnataka" value="Karnataka" />
                      </Picker>
                    </View>
                    {touched.state && errors.state && (
                      <Text
                        style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
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
                      placeholder="Address Line 1"
                      onChangeText={handleChange('addressLine1')}
                      onBlur={handleBlur('addressLine1')}
                      value={values.addressLine1}
                      accessible
                      accessibilityLabel="Address Line 1 input"
                    />
                    {touched.addressLine1 && errors.addressLine1 && (
                      <Text
                        style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                        {errors.addressLine1}
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
                      placeholder="Address Line 2 (Optional)"
                      onChangeText={handleChange('addressLine2')}
                      onBlur={handleBlur('addressLine2')}
                      value={values.addressLine2}
                      accessible
                      accessibilityLabel="Address Line 2 input"
                    />
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
                      placeholder="Address Line 3 (Optional)"
                      onChangeText={handleChange('addressLine3')}
                      onBlur={handleBlur('addressLine3')}
                      value={values.addressLine3}
                      accessible
                      accessibilityLabel="Address Line 3 input"
                    />
                  </View>

                  {/* About Shop */}
                  <View style={{marginBottom: 12}}>
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
                      placeholder="Describe your shop"
                      onChangeText={handleChange('aboutShop')}
                      onBlur={handleBlur('aboutShop')}
                      value={values.aboutShop}
                      multiline
                      accessible
                      accessibilityLabel="About shop textarea"
                    />
                    {touched.aboutShop && errors.aboutShop && (
                      <Text
                        style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                        {errors.aboutShop}
                      </Text>
                    )}
                  </View>

                  {/* Opening Days */}
                  <View style={{marginBottom: 12}}>
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
                          borderColor:
                            values.openingDays === 'Single Shift'
                              ? '#F97316'
                              : '#D1D5DB',
                          borderRadius: 8,
                          padding: 12,
                          marginRight: 8,
                          alignItems: 'center',
                        }}
                        onPress={() =>
                          handleChange('openingDays')('Single Shift')
                        }
                        accessible
                        accessibilityLabel="Select Single Shift">
                        <Text style={{fontSize: 14, color: '#374151'}}>
                          Single Shift
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-gray-100"
                        style={{
                          flex: 1,
                          borderWidth: 1,
                          borderColor:
                            values.openingDays === 'Double Shift'
                              ? '#F97316'
                              : '#D1D5DB',
                          borderRadius: 8,
                          padding: 12,
                          alignItems: 'center',
                        }}
                        onPress={() =>
                          handleChange('openingDays')('Double Shift')
                        }
                        accessible
                        accessibilityLabel="Select Double Shift">
                        <Text style={{fontSize: 14, color: '#374151'}}>
                          Double Shift
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {touched.openingDays && errors.openingDays && (
                      <Text
                        style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                        {errors.openingDays}
                      </Text>
                    )}
                    {schedules.map((data, index) => (
                      <ShiftCard
                        key={data.day}
                        shift={values.openingDays !== 'Single Shift' ? 2 : 1}
                        data={data}
                        onChange={handleShiftChange(index)}
                      />
                    ))}
                  </View>

                  {/* Dine-in Service */}
                  <View style={{marginBottom: 12}}>
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
                        gap: 5,
                      }}>
                      <TouchableOpacity
                        className="bg-gray-100"
                        style={{
                          borderWidth: 1,
                          borderColor:
                            values.dineInService === 'yes'
                              ? '#F97316'
                              : '#D1D5DB',
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 5,
                          alignItems: 'center',
                        }}
                        onPress={() => handleChange('dineInService')('yes')}
                        accessible
                        accessibilityLabel="Yes Dine-in Service">
                        <Text style={{fontSize: 14, color: '#374151'}}>
                          Yes
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-gray-100"
                        style={{
                          borderWidth: 1,
                          borderColor:
                            values.dineInService === 'no'
                              ? '#F97316'
                              : '#D1D5DB',
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 5,
                          marginRight: 8,
                          alignItems: 'center',
                        }}
                        onPress={() => handleChange('dineInService')('no')}
                        accessible
                        accessibilityLabel="No Dine-in Service">
                        <Text style={{fontSize: 14, color: '#374151'}}>No</Text>
                      </TouchableOpacity>
                    </View>
                    {touched.dineInService && errors.dineInService && (
                      <Text
                        style={{color: '#EF4444', fontSize: 12, marginTop: 4}}>
                        {errors.dineInService}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                    style={{marginTop: 16}}
                    accessible
                    accessibilityLabel={
                      shopId ? 'Update shop button' : 'Create shop button'
                    }>
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
                        style={{
                          color: '#fff',
                          fontSize: 16,
                          fontWeight: 'bold',
                        }}>
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
                source={{uri: viewImageModal}}
                style={{
                  width: width * 0.8,
                  height: width * 0.8,
                  borderRadius: 8,
                }}
              />
              <TouchableOpacity
                style={{position: 'absolute', top: 8, right: 8}}
                onPress={() => setViewImageModal(null)}
                accessible
                accessibilityLabel="Close image modal">
                <Icon name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
};

export default CreateShopScreen;
