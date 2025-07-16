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
  orderItems: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.number().required(),
        quantity: Yup.number().required(),
        price: Yup.number().required(),
        name: Yup.string().required(),
      })
    )
    .min(1, 'At least one order item is required'),
  arrivedAt: Yup.string().required('Arrival time is required'),
});

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

interface User {
  name: string;
  email: string;
  phone: string;
  role: string;
}

const AddCustomerFormScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const route = useRoute<any>();
  const orderDetails = route?.params?.orderDetails ?? null;
  const item = route?.params?.item ?? null;
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const user: any | null = useSelector((state: RootState) => state.user.data);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(item || cartItems || []);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'Own' | 'Other'>(
    user?.role === 'user' ? 'Own' : 'Other' // Default to 'Own' for users, 'Other' for others
  );

  // Update orderItems when cartItems or focus changes
  useEffect(() => {
    if (isFocused) {
      setOrderItems(item || cartItems || []);
    }
  }, [isFocused, cartItems]);

  // Radio button component
  const RadioButton = ({ label, value }: { label: string; value: 'Own' | 'Other' }) => {
    const selected = selectedOption === value;
    return (
      <TouchableOpacity
        onPress={() => setSelectedOption(value)}
        className="flex-row items-center mb-2"
      >
        <View
          className={`w-5 h-5 rounded-full border-2 ${selected ? 'border-primary-90' : 'border-gray-400'
            } items-center justify-center`}
        >
          {selected && <View className="w-2.5 h-2.5 rounded-full bg-primary-90" />}
        </View>
        <Text className="ml-1 text-lg text-black">{label}</Text>
      </TouchableOpacity>
    );
  };

  // Format time to HH:MM
  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handle form submission
  const handleAddCustomer = async (values: any, { setSubmitting, resetForm }: any) => {
    try {
      const payload = {
        name: values.customerName,
        email: values.email,
        phone: values.phone,
        order: orderItems.map((item: OrderItem) => ({
          id: item.id,
          quantity: item.quantity,
          price: Math.floor(Number(item.price)),
          name: item.name,
          image: item.image,
        })),
        arrived_at: values.arrivedAt,
      };

      // Uncomment and adjust API call as needed
      // const response = await Post('/user/vendor/place-order', payload, 5000);
      // if (!response.success) {
      //   throw new Error('Failed to add customer');
      // }

      // ToastAndroid.show('Customer added successfully!', ToastAndroid.SHORT);
      // resetForm();
      // setOrderItems([]);
      // dispatch(removeFromCart('')); // Clear cart
      navigation.navigate('OrderSummaryScreen', { payload, item });
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Something went wrong. Please try again.',
        ToastAndroid.SHORT
      );
    } finally {
      setSubmitting(false);
    }
  };
  console.log(item)
  // Initial form values based on selectedOption
  const getInitialValues = () => ({
    customerName: orderDetails?.name || (selectedOption === 'Own' && user ? user.name : ''),
    email: orderDetails?.email || (selectedOption === 'Own' && user ? user.email : ''),
    phone: orderDetails?.phone || (selectedOption === 'Own' && user ? user.phone : ''),
    orderItems: item || cartItems || [],
    arrivedAt: '',
  });

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
        <View className="flex-row items-center border-gray-200">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 absolute">
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
            {user?.role === 'user' ? 'Order Details' : 'Order Details'}
          </Text>
        </View>

        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          enableReinitialize // Reinitialize form when selectedOption or orderDetails changes
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
              {user?.role === 'user' && (
                <View className="pz-4 flex-row gap-4">
                  <RadioButton label="Own" value="Own" />
                  <RadioButton label="Others" value="Other" />
                </View>
              )}

              {/* Order Items */}
              <View style={{ marginBottom: 12 }} className='bg-primary-10 p-2 rounded-xl '>
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

                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: 4,
                      textAlign: "right"
                    }}
                    className='flex-1 mr-2'
                  >
                    Action
                  </Text>
                </View>
                {orderItems?.length === 0 ? (
                  <Text>No items added</Text>
                ) : (
                  <View>
                    {orderItems.map((item: any, index: any) => (
                      <View
                        key={item.id || index}
                        style={{
                          marginBottom: 8,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <View className="flex-1 flex-row items-center justify-start gap-10">
                          <Text className="w-24">
                            {item?.name?.length > 10 ? `${item.name.slice(0, 10)}...` : item.name}
                          </Text>
                          <Text>{item?.quantity}</Text>
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
                          className='mr-4'
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
                  onPress={() => {
                    if (user?.role === "user") {
                      navigation.navigate('SearchScreen')
                    } else {
                      navigation.navigate('AddOrderScreen')
                    }
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 8,
                    marginTop: 4,
                  }}
                  className='ml-auto'
                >
                  <Ionicons name="add-circle-outline" size={20} color="#B68AD4" />
                  <Text style={{ marginLeft: 8, color: '#B68AD4', fontSize: 14 }}>
                    Add Item
                  </Text>
                </TouchableOpacity>
              </View>

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
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text style={{ fontSize: 16, color: '#374151', flex: 1 }}>
                    {values.arrivedAt || 'Arrived At'}
                  </Text>
                  <Icon name="access-time" size={20} color="#374151" />
                </TouchableOpacity>
                <DateTimePickerModal
                  isVisible={showStartTimePicker}
                  mode="time"
                  // is24Hour={true}
                  onConfirm={(time) => {
                    setFieldValue('arrivedAt', formatTime(time));
                    setShowStartTimePicker(false);
                  }}
                  onCancel={() => setShowStartTimePicker(false)}
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
                  {isSubmitting
                    ? 'Submitting...'
                    : user?.role === 'user'
                      ? 'Add Details'
                      : 'Add Customer'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddCustomerFormScreen;