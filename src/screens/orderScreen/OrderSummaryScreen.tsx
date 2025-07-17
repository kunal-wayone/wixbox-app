import React, { useState, useMemo, useCallback } from 'react';
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
  Platform,
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
import PaymentComponent from '../../components/PaymentComponent';

// Validation schema
const validationSchema = Yup.object().shape({
  discount: Yup.number()
    .min(0, 'Discount cannot be negative')
    .default(0)
    .test('is-valid-number', 'Invalid discount amount', value => !isNaN(value) && value >= 0),
});

const OrderSummaryScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const payload = route.params?.payload || null;
  const item = route.params?.item || null;
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const cartItems = item?.length > 0 ? item : useSelector((state: RootState) => state.cart.items);
  const user: any = useSelector((state: RootState) => state.user.data);

  const [taxInputs, setTaxInputs] = useState([{ id: 1, label: 'Service Tax', value: '0' }]);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sub_total = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0),
    [cartItems]
  );

  const totalTax = useMemo(
    () => taxInputs.reduce((sum, t) => sum + parseFloat(t.value || '0'), 0),
    [taxInputs]
  );

  const addTaxField = useCallback(() => {
    setTaxInputs(prev => [
      ...prev,
      { id: prev.length + 1, label: `Service Tax ${prev.length + 1}`, value: '0' },
    ]);
  }, []);

  const removeTaxField = useCallback((id: number) => {
    setTaxInputs(prev => prev.filter(t => t.id !== id));
  }, []);

  const updateTaxValue = useCallback((id: number, value: string) => {
    if (value === '' || !isNaN(parseFloat(value))) {
      setTaxInputs(prev => prev.map(t => (t.id === id ? { ...t, value } : t)));
    }
  }, []);

  const validateInputs = useCallback(() => {
    if (!cartItems || cartItems.length === 0) {
      ToastAndroid.show('Cart is empty', ToastAndroid.LONG);
      return false;
    }
    if (
      !payload?.name?.trim() ||
      !payload?.email?.trim() ||
      !payload?.phone?.trim() ||
      !payload?.arrived_at?.trim()
    ) {
      ToastAndroid.show('Complete customer details are required', ToastAndroid.LONG);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      ToastAndroid.show('Invalid email format', ToastAndroid.LONG);
      return false;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(payload.phone)) {
      ToastAndroid.show('Invalid phone number (must be 10 digits)', ToastAndroid.LONG);
      return false;
    }
    return true;
  }, [cartItems, payload]);

  const renderCartItem = useCallback(
    ({ item }: { item: any }) => (
      <View className="flex-row bg-gray-100 rounded-xl mb-4 p-3">
        {/* <Image
          source={item?.image ? { uri: item.image } : ImagePath.item1}
          className="w-20 h-20 my-auto rounded-lg mr-4"
          resizeMode="cover"
          onError={() => ToastAndroid.show('Failed to load item image', ToastAndroid.SHORT)}
        /> */}
        <View className="flex-row flex-1 justify-between items-center gap-4">
          <View>
            <Text className="text-base font-semibold text-gray-800">{item.name || 'Unknown Item'}</Text>
            <Text className="text-gray-500">Price: ₹{(item.price || 0).toFixed(2)}</Text>
            <Text className="text-gray-500">Qty: {item.quantity || 0}</Text>
            <Text className="text-gray-600 mt-1 font-medium">
              Sub Total: ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            className="p-1 bg-red-100 rounded-md ml-auto w-10"
            onPress={() => dispatch(removeFromCart(item.id))}
          >
            <Ionicons name="trash" size={20} className="m-auto" color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [dispatch]
  );

  const handlePlaceOrder = useCallback(
    async (values: any, resetForm: () => void) => {
      if (!validateInputs()) {
        return { success: false, orderId: '' };
      }

      try {
        setIsLoading(true);
        const discount = parseFloat(values.discount || '0') || 0;
        const totalAmount = sub_total - discount + totalTax;

        if (totalAmount <= 0) {
          ToastAndroid.show('Total amount must be greater than zero', ToastAndroid.LONG);
          return { success: false, orderId: '' };
        }

        const shopId = cartItems[0]?.shop_id;
        if (!shopId) {
          ToastAndroid.show('Invalid shop ID', ToastAndroid.LONG);
          return { success: false, orderId: '' };
        }

        // Construct JSON payload
        const jsonPayload = {
          name: (payload.name || '').trim(),
          email: (payload.email || '').trim(),
          phone: (payload.phone || '').trim(),
          sub_total: parseFloat(sub_total.toFixed(2)),
          discount: Math.floor(discount),
          total_amount: Math.floor(totalAmount),
          arrived_at: (payload.arrived_at || '').trim(),
          service_tax: taxInputs.map((tax: any) => parseFloat(tax.value || '0') || 0),
          shop_id: shopId,
          order: cartItems
            .filter(item => item?.id && item?.name && item?.quantity && item?.price)
            .map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              price: Math.floor(item.price),
              sub_total: Math.floor(Number(item.price) * item.quantity),
              name: item.name,
              shop_id: item.shop_id,
              image: `${item.image}` || ''
            }))
        };

        const response: any = await Post('/user/vendor/place-order', jsonPayload, 10000); // send as JSON

        if (!response?.success) {
          console.error('Order response error:', response);
          ToastAndroid.show(
            response?.message || 'Failed to place order. Please try again.',
            ToastAndroid.LONG
          );
          return { success: false, orderId: '' };
        }

        resetForm();
        ToastAndroid.show('Order placed successfully!', ToastAndroid.LONG);
        return { success: true, orderId: response?.data?.id || '' };
      } catch (error: any) {
        console.error('Order error:', {
          message: error.message,
          code: error.code,
          response: error.response?.data,
          status: error.response?.status,
        });
        ToastAndroid.show(
          error.message === 'Network Error'
            ? 'Network error. Please check your internet connection.'
            : error?.message || 'Something went wrong. Please try again.',
          ToastAndroid.LONG
        );
        return { success: false, orderId: '' };
      } finally {
        setIsLoading(false);
      }
    },
    [cartItems, payload, sub_total, totalTax, taxInputs, validateInputs]
  );


  const orderPayment = useCallback(
    async (orderId: string, paymentData: any, totalAmount: number) => {
      setIsLoading(true);
      try {
        const paymentPayload = {
          order_id: orderId,
          status: 'completed',
          transaction_data: {
            razorpay_order_id: paymentData?.razorpay_order_id,
            razorpay_payment_id: paymentData?.razorpay_payment_id,
            razorpay_signature: paymentData?.razorpay_signature,
            amount: totalAmount.toFixed(2),
            currency: 'INR',
          },
        };

        const response: any = await Post('/user/order-payments', paymentPayload, 10000);
        if (!response.success) {
          throw new Error(response.message || 'Failed to save payment transaction');
        }

        setShowThankYouModal(true);
        dispatch(clearCart());
      } catch (error: any) {
        console.error('Payment error:', {
          message: error.message,
          response: error.response?.data,
        });
        ToastAndroid.show(
          error.message || 'Failed to save payment transaction',
          ToastAndroid.LONG
        );
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  return (
    <View className="flex-1 bg-white">
      {isLoading && (
        <View className="absolute bg-black/80 top-0 z-50 h-full w-full">
          <ActivityIndicator className="m-auto" size="large" color="#B68AD4" />
        </View>
      )}

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
                navigation.replace('AddCustomerScreen');
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

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-700 mb-1">Customer Details</Text>
          <View className="bg-primary-10 rounded-xl p-3">
            <Text className="text-base text-gray-800">Name: {payload?.name || 'N/A'}</Text>
            <Text className="text-base text-gray-800">Email: {payload?.email || 'N/A'}</Text>
            <Text className="text-base text-gray-800">Phone: {payload?.phone || 'N/A'}</Text>
            <Text className="text-base text-gray-800">
              Arrival Date: {payload?.arrived_at || 'N/A'}
            </Text>
          </View>
        </View>

        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 my-4">Your cart is empty</Text>
          }
        />

        <Formik
          initialValues={{
            discount: '0',
            sub_total: sub_total.toFixed(2),
            total_amount: sub_total.toFixed(2),
          }}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handlePlaceOrder} // Empty onSubmit as handleSubmit is passed to PaymentComponent
        >
          {({
            handleChange,
            handleBlur,
            resetForm,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }) => {
            const totalAmount = useMemo(
              () => sub_total - parseFloat(values.discount || '0') + totalTax,
              [sub_total, totalTax, values.discount]
            );

            return (
              <>
                <View className="flex-row justify-between my-2">
                  <Text className="text-base font-semibold text-gray-700">Sub Total:</Text>
                  <Text className="text-base text-gray-800">₹ {sub_total.toFixed(2)}</Text>
                </View>

                {user?.role !== 'user' && (
                  <View>
                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-gray-700 mb-1">Discount (₹)</Text>
                      <TextInput
                        className="border border-gray-300 rounded-lg px-4 py-2 text-base"
                        placeholder="Enter discount"
                        keyboardType="numeric"
                        value={values.discount}
                        onChangeText={(text) => {
                          handleChange('discount')(text);
                          setFieldValue(
                            'total_amount',
                            (sub_total - parseFloat(text || '0') + totalTax).toFixed(2)
                          );
                        }}
                        onBlur={handleBlur('discount')}
                      />
                      {touched.discount && errors.discount && (
                        <Text className="text-red-500 text-xs mt-1">{errors.discount}</Text>
                      )}
                    </View>

                    <View className="mb-4">
                      <Text className="text-sm font-semibold text-gray-700 mb-2">
                        Service Taxes (₹)
                      </Text>
                      {taxInputs.map(tax => (
                        <View key={tax.id} className="mb-3">
                          <View className="flex-row items-center">
                            <TextInput
                              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-base mr-2"
                              placeholder="Enter tax amount"
                              keyboardType="numeric"
                              value={tax.value}
                              onChangeText={val => {
                                updateTaxValue(tax.id, val);
                                setFieldValue(
                                  'total_amount',
                                  (sub_total - parseFloat(values.discount || '0') + totalTax).toFixed(2)
                                );
                              }}
                            />
                            {taxInputs.length > 1 && (
                              <TouchableOpacity
                                className="p-2 bg-red-100 rounded-md"
                                onPress={() => {
                                  removeTaxField(tax.id);
                                  setFieldValue(
                                    'total_amount',
                                    (sub_total - parseFloat(values.discount || '0') + totalTax).toFixed(2)
                                  );
                                }}
                              >
                                <Ionicons name="trash" size={20} color="#EF4444" />
                              </TouchableOpacity>
                            )}
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
                  </View>
                )}

                <View className="border-t border-gray-200 pt-3 flex-row justify-between mb-6">
                  <Text className="text-lg font-bold text-gray-700">Total:</Text>
                  <Text className="text-lg font-bold text-gray-900">₹ {totalAmount.toFixed(2)}</Text>
                </View>

                <TouchableOpacity className='p-4 ' onPress={handleSubmit}>
                  <Text>
                    Submit
                  </Text>
                </TouchableOpacity>
                <PaymentComponent
                  amount={totalAmount || 0}
                  customer={{
                    name: payload?.name?.trim() || 'Customer',
                    email: payload?.email?.trim() || 'customer@example.com',
                    phone: payload?.phone?.trim() || '0000000000',
                  }}
                  config={{
                    name: 'WishBox Store',
                    currency: 'INR',
                    description: 'For Order Booking Payment',
                    theme: {
                      color: '#B68AD4',
                      backdrop_color: '#FFFFFF',
                      hide_topbar: false,
                    },
                  }}
                  buttonLabel={`Pay ₹${(totalAmount || 0).toFixed(2)}`}
                  buttonClassName="bg-primary-90 px-6 py-4 w-full rounded-xl"
                  onPaymentSuccess={(paymentData, orderId) => {
                    orderPayment(orderId, paymentData, totalAmount || 0);
                  }}
                  onPaymentFailure={(error) => {
                    ToastAndroid.show(
                      `Payment failed: ${error?.description || 'Unknown error'}`,
                      ToastAndroid.LONG
                    );
                  }}
                  onPaymentCancel={() => {
                    ToastAndroid.show('Payment cancelled. Order not placed.', ToastAndroid.LONG);
                  }}
                  handleSubmit={() => handlePlaceOrder(values, resetForm)}
                />
              </>
            );
          }}
        </Formik>
      </ScrollView>
    </View>
  );
};

export default OrderSummaryScreen;