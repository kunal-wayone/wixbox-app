// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   ToastAndroid,
//   ActivityIndicator,
// } from 'react-native';
// import { useIsFocused, useNavigation } from '@react-navigation/native';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { Post } from '../../utils/apiUtils';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../../store/store';
// import { removeFromCart } from '../../store/slices/cartSlice';
// import DateTimePickerModal from 'react-native-modal-datetime-picker';
// import Icon from 'react-native-vector-icons/MaterialIcons';

// // Validation schema using Yup
// const validationSchema = Yup.object().shape({
//   customerName: Yup.string().required('Customer name is required'),
//   email: Yup.string().email('Invalid email').required('Email is required'),
//   phone: Yup.string()
//     .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
//     .required('Phone number is required'),
//   // orderItems: Yup.array()
//   //   .of(
//   //     Yup.object().shape({
//   //       id: Yup.number().required(),
//   //       quantity: Yup.number().required(),
//   //       price: Yup.number().required(),
//   //       name: Yup.string().required(),
//   //     })
//   //   )
//   //   .min(1, 'At least one order item is required'),
//   arrivedAt: Yup.string().required('Arrival time is required'),
// });

// const AddCustomerFormScreen = () => {
//   const navigation = useNavigation<any>();
//   const isFocused = useIsFocused();
//   const dispatch = useDispatch();
//   const cartItems = useSelector((state: RootState) => state.cart.items);
//   const [orderItems, setOrderItems] = useState(cartItems || []);
//   const [showStartTimePicker, setShowStartTimePicker] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     setIsLoading(true);
//     if (isFocused) {
//       setOrderItems(cartItems || []);
//     }
//     setIsLoading(false);
//   }, [isFocused, cartItems]);

//   // Format time to HH:MM
//   const formatTime = (date: any) => {
//     const hours = String(date.getHours()).padStart(2, '0');
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     return `${hours}:${minutes}`;
//   };

//   // Handle form submission
//   const handleAddCustomer = async (values: any, { setSubmitting, resetForm }: any) => {
//     try {
//       // Structure payload as per desired format
//       const payload = {
//         name: values.customerName,
//         email: values.email,
//         phone: values.phone,
//         order: orderItems.map((item: any) => ({
//           id: item.id,
//           quantity: item.quantity,
//           price: Math.floor(Number(item.price)), // removes decimal part
//           name: item.name,
//           image:item?.image
//         })),
//         arrived_at: values.arrivedAt,
//       };

//       // Replace with your actual API endpoint
//       // const response: any = await Post('/user/vendor/place-order', payload, 5000);
//       // console.log(response)
//       // if (!response.success) {
//       //   throw new Error('Failed to add customer');
//       // }

//       ToastAndroid.show('Customer added successfully!', ToastAndroid.SHORT);
//       // resetForm();
//       // setOrderItems([]);
//       // dispatch(removeFromCart('')); // Clear cart if needed
//       navigation.navigate('OrderSummaryScreen', { payload });
//     } catch (error: any) {
//       console.log(error)
//       ToastAndroid.show(
//         error.message || 'Something went wrong. Please try again.',
//         ToastAndroid.SHORT,
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1 }}
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
//     >
//       <ScrollView
//         contentContainerStyle={{
//           flexGrow: 1,
//           padding: 16,
//           backgroundColor: '#fff',
//         }}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="always"
//       >
//         {/* Header with Back Button and Title */}
//         <View className="flex-row items-center border-gray-200">
//           <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
//             <Ionicons name="arrow-back" size={24} color="black" />
//           </TouchableOpacity>
//         </View>
//         <View>
//           <Text
//             style={{
//               textAlign: 'center',
//               fontSize: 20,
//               fontWeight: 'bold',
//               fontFamily: 'Poppins',
//               color: '#374151',
//             }}
//           >
//             Add Customer
//           </Text>

//           <Formik
//             initialValues={{
//               customerName: '',
//               email: '',
//               phone: '',
//               orderItems: cartItems || [],
//               arrivedAt: '',
//             }}
//             validationSchema={validationSchema}
//             onSubmit={handleAddCustomer}
//           >
//             {({
//               handleChange,
//               handleBlur,
//               handleSubmit,
//               values,
//               errors,
//               touched,
//               setFieldValue,
//               isSubmitting,
//             }: any) => (
//               <View style={{ marginTop: 16 }}>
//                 {/* Customer Name */}
//                 <View style={{ marginBottom: 12 }}>
//                   <Text
//                     style={{
//                       fontSize: 14,
//                       fontWeight: '500',
//                       color: '#374151',
//                       marginBottom: 4,
//                     }}
//                   >
//                     Customer Name
//                   </Text>
//                   <TextInput
//                     style={{
//                       borderWidth: 1,
//                       borderColor: '#D1D5DB',
//                       backgroundColor: '#F3F4F6',
//                       borderRadius: 8,
//                       padding: 12,
//                       fontSize: 16,
//                     }}
//                     placeholder="Enter customer name"
//                     onChangeText={handleChange('customerName')}
//                     onBlur={handleBlur('customerName')}
//                     value={values.customerName}
//                   />
//                   {touched.customerName && errors.customerName && (
//                     <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
//                       {errors.customerName}
//                     </Text>
//                   )}
//                 </View>

//                 {/* Email */}
//                 <View style={{ marginBottom: 12 }}>
//                   <Text
//                     style={{
//                       fontSize: 14,
//                       fontWeight: '500',
//                       color: '#374151',
//                       marginBottom: 4,
//                     }}
//                   >
//                     Email
//                   </Text>
//                   <TextInput
//                     style={{
//                       borderWidth: 1,
//                       borderColor: '#D1D5DB',
//                       backgroundColor: '#F3F4F6',
//                       borderRadius: 8,
//                       padding: 12,
//                       fontSize: 16,
//                     }}
//                     placeholder="Enter email"
//                     onChangeText={handleChange('email')}
//                     onBlur={handleBlur('email')}
//                     value={values.email}
//                     keyboardType="email-address"
//                   />
//                   {touched.email && errors.email && (
//                     <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
//                       {errors.email}
//                     </Text>
//                   )}
//                 </View>

//                 {/* Phone */}
//                 <View style={{ marginBottom: 12 }}>
//                   <Text
//                     style={{
//                       fontSize: 14,
//                       fontWeight: '500',
//                       color: '#374151',
//                       marginBottom: 4,
//                     }}
//                   >
//                     Phone
//                   </Text>
//                   <TextInput
//                     style={{
//                       borderWidth: 1,
//                       borderColor: '#D1D5DB',
//                       backgroundColor: '#F3F4F6',
//                       borderRadius: 8,
//                       padding: 12,
//                       fontSize: 16,
//                     }}
//                     maxLength={10}
//                     placeholder="Enter phone number"
//                     onChangeText={handleChange('phone')}
//                     onBlur={handleBlur('phone')}
//                     value={values.phone}
//                     keyboardType="phone-pad"
//                   />
//                   {touched.phone && errors.phone && (
//                     <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
//                       {errors.phone}
//                     </Text>
//                   )}
//                 </View>

//                 {/* Order Items */}
//                 <View style={{ marginBottom: 12 }}>
//                   <View className="flex-row items-center justify-start gap-10">
//                     <Text
//                       style={{
//                         fontSize: 14,
//                         fontWeight: '500',
//                         color: '#374151',
//                         marginBottom: 4,
//                       }}
//                     >
//                       Item Name
//                     </Text>
//                     <Text
//                       style={{
//                         fontSize: 14,
//                         fontWeight: '500',
//                         color: '#374151',
//                         marginBottom: 4,
//                       }}
//                     >
//                       Qnt.
//                     </Text>
//                     <Text
//                       style={{
//                         fontSize: 14,
//                         fontWeight: '500',
//                         color: '#374151',
//                         marginBottom: 4,
//                       }}
//                     >
//                       Price
//                     </Text>
//                   </View>
//                   {isLoading ? (
//                     <ActivityIndicator />
//                   ) : orderItems.length === 0 ? (
//                     <Text>No items added</Text>
//                   ) : (
//                     <View>
//                       {orderItems.map((item, index) => (
//                         <View
//                           key={item.id || index}
//                           style={{
//                             marginBottom: 8,
//                             flexDirection: 'row',
//                             alignItems: 'center',
//                           }}
//                         >
//                           <View className="flex-1 flex-row items-center justify-start gap-14">
//                             <Text className='w-16'>
//                               {item.name.length > 12 ? `${item.name.slice(0, 12)}...` : item.name}
//                             </Text>
//                             <Text>{item.quantity}</Text>
//                             <Text>₹ {item.price}/-</Text>
//                           </View>
//                           <TouchableOpacity
//                             onPress={() => {
//                               dispatch(removeFromCart(item.id));
//                               const updatedItems = orderItems.filter((_, i) => i !== index);
//                               setOrderItems(updatedItems);
//                               setFieldValue('orderItems', updatedItems);
//                             }}
//                             style={{ marginLeft: 8 }}
//                           >
//                             <Ionicons name="trash-outline" size={18} color="#EF4444" />
//                           </TouchableOpacity>
//                         </View>
//                       ))}
//                       {touched.orderItems && errors.orderItems && (
//                         <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
//                           {errors.orderItems}
//                         </Text>
//                       )}
//                     </View>
//                   )}
//                   <TouchableOpacity
//                     onPress={() => navigation.navigate('AddOrderScreen')}
//                     style={{
//                       flexDirection: 'row',
//                       alignItems: 'center',
//                       padding: 8,
//                       marginTop: 8,
//                     }}
//                   >
//                     <Ionicons name="add-circle-outline" size={20} color="#B68AD4" />
//                     <Text style={{ marginLeft: 8, color: '#B68AD4', fontSize: 14 }}>
//                       Add Item
//                     </Text>
//                   </TouchableOpacity>
//                 </View>

//                 {/* Arrived At */}
//                 <View style={{ marginBottom: 12 }}>
//                   <TouchableOpacity
//                     style={{
//                       borderWidth: 1,
//                       borderColor: '#D1D5DB',
//                       backgroundColor: '#F3F4F6',
//                       borderRadius: 8,
//                       padding: 12,
//                       flexDirection: 'row',
//                       alignItems: 'center',
//                     }}
//                     onPress={() => {
//                       console.log('Opening time picker');
//                       setShowStartTimePicker(true);
//                     }}
//                   >
//                     <Text style={{ fontSize: 16, color: '#374151', flex: 1 }}>
//                       {values.arrivedAt || 'Arrived At'}
//                     </Text>
//                     <Icon name="access-time" size={20} color="#374151" />
//                   </TouchableOpacity>
//                   <DateTimePickerModal
//                     isVisible={showStartTimePicker}
//                     mode="time"
//                     is24Hour={true}
//                     onConfirm={(time) => {
//                       console.log('Time selected:', time);
//                       setFieldValue('arrivedAt', formatTime(time));
//                       setShowStartTimePicker(false);
//                     }}
//                     onCancel={() => {
//                       console.log('Time picker cancelled');
//                       setShowStartTimePicker(false);
//                     }}
//                   />
//                   {touched.arrivedAt && errors.arrivedAt && (
//                     <Text style={{ color: '#EF4444', fontSize: 12, marginTop: 4 }}>
//                       {errors.arrivedAt}
//                     </Text>
//                   )}
//                 </View>

//                 {/* Submit Button */}
//                 <TouchableOpacity
//                   onPress={() => handleSubmit()}
//                   disabled={isSubmitting}
//                   style={{
//                     backgroundColor: isSubmitting ? '#B68AD480' : '#B68AD4',
//                     padding: 16,
//                     borderRadius: 10,
//                     alignItems: 'center',
//                     marginTop: 16,
//                   }}
//                 >
//                   <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
//                     {isSubmitting ? 'Submitting...' : 'Add Customer'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </Formik>
//         </View>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// export default AddCustomerFormScreen;


import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  ToastAndroid,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ImagePath } from '../../constants/ImagePath';
import { IMAGE_URL, Post } from '../../utils/apiUtils';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { clearCart, removeFromCart } from '../../store/slices/cartSlice';

// Validation schema
const validationSchema = Yup.object().shape({
  discount: Yup.number()
    .min(0, 'Discount cannot be negative')
    .default(0),
});

const OrderSummaryScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const payload = route.params?.payload || null;
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [taxInputs, setTaxInputs] = useState([
    { id: 1, label: 'Service Tax', value: '0' },
  ]);
  purchase: true
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
console.log(payload)
  const sub_total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const totalTax = useMemo(
    () => taxInputs.reduce((sum, t) => sum + parseFloat(t.value || '0'), 0),
    [taxInputs],
  );

  const addTaxField = () => {
    setTaxInputs(prev => [
      ...prev,
      {
        id: prev.length + 1,
        label: `Service Tax ${prev.length + 1}`,
        value: '0',
      },
    ]);
  };

  const removeTaxField = (id: number) => {
    setTaxInputs(prev => prev.filter(t => t.id !== id));
  };

  const updateTaxValue = (id: number, value: string) => {
    setTaxInputs(prev => prev.map(t => (t.id === id ? { ...t, value } : t)));
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View className="flex-row bg-gray-100 rounded-xl mb-4 p-3">
      <Image
        source={{ uri: IMAGE_URL + item.image }}
        className="w-20 h-auto rounded-lg mr-4"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800">{item.name}</Text>
        <Text className="text-gray-500">Price: ₹{item?.price}</Text>
        <Text className="text-gray-500">Qty: {item.quantity}</Text>
        <Text className="text-gray-600 mt-1 font-medium">
          Sub Total: ₹{(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  const handlePlaceOrder = async (values: any, { setSubmitting, resetForm }: any) => {
    setIsLoading(true);
    try {
      if (cartItems.length === 0) {
        throw new Error('Cart is empty');
      }

      if (!payload?.name || !payload?.email || !payload?.phone || !payload?.arrived_at) {
        throw new Error('Customer details are missing');
      }

      const formData = new FormData();
      formData.append('name', payload.name);
      formData.append('email', payload.email);
      formData.append('phone', payload.phone);
      formData.append('discount', values.discount || '0');
      formData.append('sub_total', sub_total.toFixed(2));
      formData.append('total_amount', Number(sub_total - parseFloat(values.discount || '0') + totalTax));
      formData.append('arrived_at', payload.arrived_at);

      taxInputs.forEach((tax, index) => {
        formData.append(`service_tax[${index}]`, tax.value || '0');
      });

      cartItems.forEach((item: any, index: number) => {
        formData.append(`order[${index}][id]`, item.id);
        formData.append(`order[${index}][quantity]`, item.quantity);
        formData.append(`order[${index}][price]`, Math.floor(Number(item.price)));
        formData.append(`order[${index}][sub_total]`, Math.floor(Number(item.price) * item.quantity));
        formData.append(`order[${index}][name]`, item.name);
        formData.append(`order[${index}][image]`, item?.image);
      });

      console.log(values, formData)
      const response: any = await Post('/user/vendor/place-order', formData, 5000);

      if (!response.success) {
        throw new Error(response.message || 'Failed to place order');
      }

      setShowThankYouModal(true);
      dispatch(clearCart());
      resetForm();
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Something went wrong. Please try again.',
        ToastAndroid.LONG,
      );
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Thank You Modal */}
      <Modal
        visible={showThankYouModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThankYouModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-6 rounded-xl w-4/5">
            <Text className="text-xl font-bold text-center text-gray-800 mb-4">
              Thank You!
            </Text>
            <Text className="text-base text-gray-600 text-center mb-6">
              Your order has been placed successfully.
            </Text>
            <TouchableOpacity
              className="bg-primary-80 py-3 rounded-xl"
              onPress={() => {
                setShowThankYouModal(false);
                navigation.navigate('AddCustomerScreen');
              }}
            >
              <Text className="text-white text-center font-bold">Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="px-4">
        <Text className="text-xl font-bold text-center text-gray-700 my-4">
          Order Summary
        </Text>

        {/* Customer Details as Text */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1">Customer Details</Text>
          <View className="bg-gray-100 rounded-lg p-3">
            <Text className="text-base text-gray-800">
              Name: {payload?.name || 'N/A'}
            </Text>
            <Text className="text-base text-gray-800">
              Email: {payload?.email || 'N/A'}
            </Text>
            <Text className="text-base text-gray-800">
              Phone: {payload?.phone || 'N/A'}
            </Text>
            <Text className="text-base text-gray-800">
              Arrival Date: {payload?.arrived_at || 'N/A'}
            </Text>
          </View>
        </View>

        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        <Formik
          initialValues={{
            discount: '0',
            sub_total: sub_total.toFixed(2),
            total_amount: (sub_total - parseFloat('0') + totalTax).toFixed(2),
          }}
          validationSchema={validationSchema}
          onSubmit={handlePlaceOrder}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <>
              {/* Sub Total */}
              <View className="flex-row justify-between my-2">
                <Text className="text-base font-semibold text-gray-700">Sub Total:</Text>
                <Text className="text-base text-gray-800">₹ {sub_total.toFixed(2)}</Text>
              </View>

              {/* Discount */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-1">Discount (₹)</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-2 text-base"
                  placeholder="Enter discount"
                  keyboardType="numeric"
                  value={values.discount}
                  onChangeText={handleChange('discount')}
                  onBlur={handleBlur('discount')}
                />
                {touched.discount && errors.discount && (
                  <Text className="text-red-500 text-xs mt-1">{errors.discount}</Text>
                )}
              </View>

              {/* Service Tax Inputs */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Service Taxes (₹)</Text>
                {taxInputs.map(tax => (
                  <View key={tax.id} className="mb-3">
                    <View className="flex-row items-center">
                      <TextInput
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-base mr-2"
                        placeholder="Enter tax amount"
                        keyboardType="numeric"
                        value={tax.value}
                        onChangeText={val => updateTaxValue(tax.id, val)}
                      />
                      <TouchableOpacity
                        className="p-2 bg-red-100 rounded-md"
                        onPress={() => removeTaxField(tax.id)}
                      >
                        <Ionicons name="trash" size={20} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-xs text-gray-500 mt-1">{tax.label}</Text>
                  </View>
                ))}
                <TouchableOpacity
                  className="mt-2 bg-gray-200 rounded-lg py-2 items-center"
                  onPress={addTaxField}
                >
                  <Text className="text-sm text-gray-700 font-medium">+ Add Tax</Text>
                </TouchableOpacity>
              </View>

              {/* Total */}
              <View className="border-t border-gray-200 pt-3 flex-row justify-between mb-6">
                <Text className="text-lg font-bold text-gray-700">Total:</Text>
                <Text className="text-lg font-bold text-gray-900">
                  ₹ {(sub_total - parseFloat(values.discount || '0') + totalTax).toFixed(2)}
                </Text>
              </View>

              {/* Checkout Button */}
              <TouchableOpacity
                className="bg-primary-80 w-full py-4 rounded-xl items-center"
                onPress={() => handleSubmit()}
                disabled={isSubmitting || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white text-base font-bold">Place Order</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </ScrollView>
    </View>
  );
};

export default OrderSummaryScreen;