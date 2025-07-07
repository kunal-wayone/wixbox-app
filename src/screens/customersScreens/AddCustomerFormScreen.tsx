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
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Post } from '../../utils/apiUtils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { removeFromCart } from '../../store/slices/cartSlice';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  customerName: Yup.string().required('Customer name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  // orderItems: Yup.array()
  //   .of(
  //     Yup.object().shape({
  //       id: Yup.number().required(),
  //       quantity: Yup.number().required(),
  //       price: Yup.number().required(),
  //       name: Yup.string().required(),
  //     })
  //   )
  //   .min(1, 'At least one order item is required'),
  arrivedAt: Yup.string().required('Arrival time is required'),
});

const AddCustomerFormScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const route = useRoute<any>();
  const orderDetails = route.params?.orderDetails || null;
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [orderItems, setOrderItems] = useState(cartItems || []);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  console.log(orderDetails)
  useEffect(() => {
    setIsLoading(true);
    if (isFocused) {
      setOrderItems(cartItems || []);
    }
    setIsLoading(false);
  }, [isFocused, cartItems]);

  // Format time to HH:MM
  const formatTime = (date: any) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle form submission
  const handleAddCustomer = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      // Structure payload as per desired format
      const payload = {
        name: values.customerName,
        email: values.email,
        phone: values.phone,
        order: orderItems.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          price: Math.floor(Number(item.price)), // removes decimal part
          name: item.name,
          image: item?.image
        })),
        arrived_at: values.arrivedAt,
      };

      // Replace with your actual API endpoint
      // const response: any = await Post('/user/vendor/place-order', payload, 5000);
      // console.log(response)
      // if (!response.success) {
      //   throw new Error('Failed to add customer');
      // }

      ToastAndroid.show('Customer added successfully!', ToastAndroid.SHORT);
      // resetForm();
      // setOrderItems([]);
      // dispatch(removeFromCart('')); // Clear cart if needed
      navigation.navigate('OrderSummaryScreen', { payload });
    } catch (error: any) {
      console.log(error)
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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          backgroundColor: '#fff',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        {/* Header with Back Button and Title */}
        <View className="flex-row items-center absolute  border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View>
          <Text
            style={{
              textAlign: 'center',
              fontSize: 20,
              fontWeight: 'bold',
              fontFamily: 'Poppins',
              color: '#374151',
            }}
          >
            Add Customer
          </Text>

          <Formik
            initialValues={{
              customerName: orderDetails ? orderDetails?.name : '',
              email: orderDetails ? orderDetails?.email : '',
              phone: orderDetails ? orderDetails?.phone : '',
              orderItems: cartItems || [],
              arrivedAt: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleAddCustomer}
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
                {/* Customer Name */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}
                  >
                    Customer Name
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
                    placeholder="Enter customer name"
                    onChangeText={handleChange('customerName')}
                    onBlur={handleBlur('customerName')}
                    value={values.customerName}
                  />
                  {touched.customerName && errors.customerName && (
                    <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.customerName}
                    </Text>
                  )}
                </View>

                {/* Email */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}
                  >
                    Email
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
                    placeholder="Enter email"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    keyboardType="email-address"
                  />
                  {touched.email && errors.email && (
                    <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.email}
                    </Text>
                  )}
                </View>

                {/* Phone */}
                <View style={{ marginBottom: 12 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                    }}
                  >
                    Phone
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
                    maxLength={10}
                    placeholder="Enter phone number"
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    value={values.phone}
                    keyboardType="phone-pad"
                  />
                  {touched.phone && errors.phone && (
                    <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.phone}
                    </Text>
                  )}
                </View>

                {/* Order Items */}
                <View style={{ marginBottom: 12 }}>
                  <View className="flex-row items-center justify-start gap-10">
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: 4,
                      }}
                    >
                      Item Name
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: 4,
                      }}
                    >
                      Qnt.
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: 4,
                      }}
                    >
                      Price
                    </Text>
                  </View>
                  {isLoading ? (
                    <ActivityIndicator />
                  ) : orderItems.length === 0 ? (
                    <Text>No items added</Text>
                  ) : (
                    <View>
                      {orderItems.map((item, index) => (
                        <View
                          key={item.id || index}
                          style={{
                            marginBottom: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <View className="flex-1 flex-row items-center justify-start gap-10">
                            <Text className='w-24'>
                              {item.name.length > 10 ? `${item.name.slice(0, 10)}...` : item.name}
                            </Text>
                            <Text>{item.quantity}</Text>
                            <Text>₹ {item.price}/-</Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              dispatch(removeFromCart(item.id));
                              const updatedItems = orderItems.filter((_, i) => i !== index);
                              setOrderItems(updatedItems);
                              setFieldValue('orderItems', updatedItems);
                            }}
                            style={{ marginLeft: 8 }}
                          >
                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                      {touched.orderItems && errors.orderItems && (
                        <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                          {errors.orderItems}
                        </Text>
                      )}
                    </View>
                  )}
                  <TouchableOpacity
                    onPress={() => navigation.navigate('AddOrderScreen')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 8,
                      marginTop: 8,
                    }}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="#B68AD4" />
                    <Text style={{ marginLeft: 8, color: '#B68AD4', fontSize: 14 }}>
                      Add Item
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Arrived At */}
                <View style={{ marginBottom: 12 }}>
                  <TouchableOpacity
                    style={{
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 8,
                      padding: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      console.log('Opening time picker');
                      setShowStartTimePicker(true);
                    }}
                  >
                    <Text style={{ fontSize: 16, color: '#374151', flex: 1 }}>
                      {values.arrivedAt || 'Arrived At'}
                    </Text>
                    <Icon name="access-time" size={20} color="#374151" />
                  </TouchableOpacity>
                  <DateTimePickerModal
                    isVisible={showStartTimePicker}
                    mode="time"
                    is24Hour={true}
                    onConfirm={(time) => {
                      console.log('Time selected:', time);
                      setFieldValue('arrivedAt', formatTime(time));
                      setShowStartTimePicker(false);
                    }}
                    onCancel={() => {
                      console.log('Time picker cancelled');
                      setShowStartTimePicker(false);
                    }}
                  />
                  {touched.arrivedAt && errors.arrivedAt && (
                    <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
                      {errors.arrivedAt}
                    </Text>
                  )}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? '#B68AD480' : '#B68AD4',
                    padding: 16,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginTop: 16,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    {isSubmitting ? 'Submitting...' : 'Add Customer'}
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

export default AddCustomerFormScreen;