import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { Fetch, IMAGE_URL, Post } from '../../utils/apiUtils';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { clearCart, removeFromCart } from '../../store/slices/cartSlice';
import PaymentComponent from '../../components/PaymentComponent';
import { SafeAreaView } from 'react-native-safe-area-context';

// Validation schema
const validationSchema = Yup.object().shape({
  discount: Yup.number()
    .min(0, 'Discount cannot be negative')
    .default(0)
    .test('is-valid-number', 'Invalid discount amount', value => !isNaN(value) && value >= 0),
});

const OrderSummaryScreen = () => {
  const navigation = useNavigation();
  const route: any = useRoute();
  const payload = route.params?.payload || {};
  const item = route.params?.item || [];
  const dispatch = useDispatch();
  const cartItems = item.length > 0 ? item : useSelector((state: RootState) => state.cart.items);
  const { totalAmount, totalTax: taxToatal, totalWithTax } = useSelector((state: RootState) => state.cart);
  console.log(totalAmount, taxToatal, totalWithTax, "df")
  const user: any = useSelector((state: RootState) => state.user.data);
  const [dynamicTaxes, setDynamicTaxes] = useState([]);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize tax inputs based on dynamicTaxes
  const [taxInputs, setTaxInputs] = useState<any>([]);

  // Calculate subtotal
  const subTotal = useMemo(
    () => cartItems.reduce((sum: any, item: any) => sum + (item.price || 0) * (item.quantity || 0), 0),
    [cartItems]
  );

  // Calculate total tax
  const totalTax = useMemo(
    () => taxInputs.reduce((sum: any, t: any) => sum + parseFloat(t.value || '0'), 0),
    [taxInputs]
  );

  // Fetch taxes from API
  const fetchTaxes = async () => {
    try {
      const response: any = await Fetch('/user/vendor/taxes', {}, 5000);
      if (response.code !== 200) throw new Error('Failed to fetch taxes');
      setDynamicTaxes(response.data || []);
      // Initialize tax inputs with fetched taxes
      setTaxInputs(
        response.data
          .filter((tax: any) => tax.status === 1)
          .map((tax: any) => ({
            id: tax.id,
            label: tax.name,
            value: '0',
            rate: parseFloat(tax.rate),
            type: tax.type,
          }))
      );
    } catch (error: any) {
      ToastAndroid.show(error.message || 'Failed to load taxes.', ToastAndroid.SHORT);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  // Update tax value with input validation
  const updateTaxValue = useCallback(
    (id, input) => {
      // Allow empty input or valid numbers only
      if (input === '' || /^\d*\.?\d*$/.test(input)) {
        setTaxInputs(prev =>
          prev.map(t => {
            if (t.id !== id) return t;
            const value = input === '' ? '0' : input;
            const numericValue = parseFloat(value) || 0;
            return {
              ...t,
              inputValue: value, // Store raw input for display
              value:
                t.type === 'percentage'
                  ? ((numericValue / 100) * subTotal).toFixed(2)
                  : numericValue.toFixed(2),
            };
          })
        );
      }
    },
    [subTotal]
  );

  // Validate inputs
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

  console.log(cartItems)
  // Render cart item
  const renderCartItem = useCallback(
    ({ item }) => (
      <View className="flex-row items-center bg-white rounded-2xl shadow-md mb-4 p-4">
        <Image
          source={item?.image ? { uri: IMAGE_URL + item.image } : ImagePath.item1}
          className="w-20 h-20 rounded-lg mr-4 border border-gray-200"
          resizeMode="cover"
          onError={() => ToastAndroid.show('Failed to load item image', ToastAndroid.SHORT)}
        />
        <View className="flex-1">
          <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-lg  text-gray-900 mb-1">
            {item.name || 'Unknown Item'}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600 bg-blue-100 px-2 py-1 rounded-md">
              ₹{(item.price || 0).toFixed(2)}
            </Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600 bg-emerald-100 px-2 py-1 rounded-md">
              Qty: {item.quantity || 0}
            </Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-700 font-medium mt-1">
              Subtotal: ₹{((item.price || 0) * (item.quantity || 0)).toFixed(2)}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="ml-3 bg-red-100 p-2 rounded-full"
          onPress={() => dispatch(removeFromCart(item.id))}
        >
          <Ionicons name="trash-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
    ),
    [dispatch]
  );

  // Handle place order
  const handlePlaceOrder = useCallback(
    async (values, resetForm) => {
      if (!validateInputs()) {
        return { success: false, orderId: '' };
      }

      try {
        setIsLoading(true);
        const discount = parseFloat(values.discount || '0') || 0;
        const tax = parseFloat(values.service_tax || '0') || 0;
        const totalAmount = subTotal - discount + totalTax + tax;

        if (totalAmount <= 0) {
          ToastAndroid.show('Total amount must be greater than zero', ToastAndroid.LONG);
          return { success: false, orderId: '' };
        }

        const shopId = cartItems[0]?.shop_id;
        if (!shopId) {
          ToastAndroid.show('Invalid shop ID', ToastAndroid.LONG);
          return { success: false, orderId: '' };
        }

        const jsonPayload = {
          name: payload.name.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          sub_total: parseFloat(subTotal.toFixed(2)),
          discount: Math.floor(discount),
          total_amount: Math.floor(totalAmount),
          arrived_at: payload.arrived_at.trim(),
          tax: taxInputs.map((tax: any) => ({
            id: tax.id,
            name: tax.label,
            amount: parseFloat(tax.value || '0'),
            type: tax.type,
            rate: tax.rate,
            input_value: parseFloat(tax.inputValue || '0'),
          })),
          service_tax: 0,
          shop_id: shopId,
          order: cartItems
            .filter(item => item?.id && item?.name && item?.quantity && item?.price)
            .map(item => ({
              id: item.id,
              quantity: item.quantity,
              price: Math.floor(item.price),
              sub_total: Math.floor(Number(item.price) * item.quantity),
              name: item.name,
              shop_id: item.shop_id,
              image: item.image || '',
            })),
        };
        const url = user?.role === "user" ? '/user/place-order-user' : '/user/vendor/place-order'

        const response: any = await Post(url, jsonPayload, 10000);
        console.log(response)
        if (!response?.success) {
          ToastAndroid.show(response?.message || 'Failed to place order.', ToastAndroid.LONG);
          return { success: false, orderId: '' };
        }

        resetForm();
        ToastAndroid.show('Order placed successfully!', ToastAndroid.LONG);
        return { success: true, orderId: response?.order?.id || '' };
      } catch (error: any) {
        ToastAndroid.show(
          error.message === 'Network Error'
            ? 'Network error. Please check your internet connection.'
            : error.message || 'Something went wrong.',
          ToastAndroid.LONG
        );
        return { success: false, orderId: '' };
      } finally {
        setIsLoading(false);
      }
    },
    [cartItems, payload, subTotal, totalTax, taxInputs, validateInputs]
  );

  // Handle payment
  const orderPayment = useCallback(
    async (orderId, paymentData, totalAmount) => {
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

        const response = await Post('/user/order-payments', paymentPayload, 10000);
        if (!response.success) {
          throw new Error(response.message || 'Failed to save payment transaction');
        }

        setShowThankYouModal(true);
        dispatch(clearCart());
      } catch (error) {
        ToastAndroid.show(error.message || 'Failed to save payment transaction', ToastAndroid.LONG);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [dispatch]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View className="flex-1 bg-white">
        {isLoading && (
          <View className="absolute bg-black/80 top-0 z-50 h-full w-full">
            <ActivityIndicator className="m-auto" size="large" color="#ac94f4" />
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
              <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-xl text-center text-gray-800 mb-4">
                Thank You!
              </Text>
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-gray-600 text-center mb-6">
                Your order has been placed successfully.
              </Text>
              <TouchableOpacity
                className="bg-primary-80 py-3 rounded-xl"
                onPress={() => {
                  setShowThankYouModal(false);
                  navigation.replace('AddCustomerScreen');
                }}
              >
                <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-white text-center ">Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="px-4">
          <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-xl  text-center text-gray-700 my-4">
            Order Summary
          </Text>

          <View className="mb-4">
            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-lg  text-gray-700 mb-1">Customer Details</Text>
            <View className="bg-primary-10 rounded-xl p-3">
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-gray-800">Name: {payload?.name || 'N/A'}</Text>
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-gray-800">Email: {payload?.email || 'N/A'}</Text>
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-gray-800">Phone: {payload?.phone || 'N/A'}</Text>
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-gray-800">
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
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-center text-gray-500 my-4">Your cart is empty</Text>
            }
          />

          <Formik
            initialValues={{
              discount: '0',
              service_tax: '0',
              sub_total: subTotal.toFixed(2),
              total_amount: subTotal.toFixed(2),
            }}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={handlePlaceOrder}
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
                () => subTotal - parseFloat(values.discount || '0') + totalTax + taxToatal + parseFloat(values?.service_tax || '0'),
                [subTotal, totalTax, values.discount, values.service_tax]
              );

              return (
                <>
                  <View className="flex-row justify-between my-2">
                    <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base text-gray-700">Sub Total:</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-gray-800">₹ {subTotal.toFixed(2)}</Text>
                  </View>

                  <View className="">
                    <View className="mb-3 flex-row justify-between items-center">
                      <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm font-medium text-gray-700">
                        Tax
                      </Text>
                      <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-500">
                        ₹{taxToatal}
                      </Text>
                    </View>
                    {/* {dynamicTaxes.length === 0 && (
                      <Text style={{fontFamily:'Raleway-Regular'}} className="text-sm text-gray-500">No active taxes available</Text>
                    )}
                    {dynamicTaxes
                      .filter(tax => tax.status === 1) // Show only taxes with status 1
                      .map(tax => (
                        <View key={tax.id} className="mb-3 flex-row justify-between items-center">
                          <Text style={{fontFamily:'Raleway-Regular'}} className="text-sm font-medium text-gray-700">
                            {tax.name} ({tax.rate}
                            {tax.type === 'percentage' ? '%' : ' ₹'})
                          </Text>
                          <Text style={{fontFamily:'Raleway-Regular'}} className="text-sm text-gray-500">
                            ₹{parseFloat((subTotal * tax.rate) / 100 || '0').toFixed(2)}
                          </Text>
                        </View>
                      ))} */}
                  </View>

                  {user?.role !== 'user' && (
                    <View>
                      <View className="mb-4 flex-row items-center justify-between">
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-sm text-gray-700 mb-1">Discount (₹)</Text>
                        <TextInput
                          className="border border-gray-300 w-1/4 rounded-lg px-4 py-2 text-base"
                          placeholder="0.00"
                          keyboardType="numeric"
                          value={values.discount}
                          onChangeText={(text) => {
                            if (text === '' || /^\d*\.?\d*$/.test(text)) {
                              handleChange('discount')(text);
                              setFieldValue(
                                'total_amount',
                                (subTotal - parseFloat(text || '0') + totalTax).toFixed(2)
                              );
                            }
                          }}
                          onBlur={handleBlur('discount')}
                        />
                        {touched.discount && errors.discount && (
                          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.discount}</Text>
                        )}
                      </View>

                      <View className="mb-4 flex-row items-center justify-between ">
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-sm text-gray-700 mb-1">Service Charge (₹)</Text>
                        <TextInput
                          className="border border-gray-300 w-1/4 rounded-lg px-4 py-2 text-base"
                          placeholder="0.00"
                          keyboardType="numeric"
                          value={values.service_tax}
                          onChangeText={(text) => {
                            if (text === '' || /^\d*\.?\d*$/.test(text)) {
                              console.log(text)
                              handleChange('service_tax')(text);
                              setFieldValue(
                                'total_amount',
                                (subTotal + parseFloat(text || '0') + totalTax).toFixed(2)
                              );
                            }
                          }}
                          onBlur={handleBlur('service_tax')}
                        />
                        {touched.service_tax && errors.service_tax && (
                          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-red-500 text-xs mt-1">{errors.service_tax}</Text>
                        )}
                      </View>

                    </View>
                  )}


                  <View className="border-t border-gray-200 pt-3 flex-row justify-between mb-6">
                    <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-lg text-gray-700">Total:</Text>
                    <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-lg text-gray-900">₹ {totalAmount.toFixed(2)}</Text>
                  </View>

                  <PaymentComponent
                    amount={totalAmount || 0}
                    customer={{
                      name: payload?.name?.trim() || 'Customer',
                      email: payload?.email?.trim() || 'customer@example.com',
                      phone: payload?.phone?.trim() || '0000000000',
                    }}
                    config={{
                      name: 'WisBox Store',
                      currency: 'INR',
                      description: 'For Order Booking Payment',
                      theme: {
                        color: '#ac94f4',
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
    </SafeAreaView >
  );
};

export default OrderSummaryScreen;