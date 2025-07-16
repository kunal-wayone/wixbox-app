import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from 'react-native';
import { createRazorpayOrder, createRazorpayOptions, openRazorpayCheckout } from '../utils/payments/razorpay';

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface ThemeOptions {
  color?: string;
  hide_topbar?: boolean;
  backdrop_color?: string;
}

interface RazorpayConfig {
  name: string;
  currency: string;
  description: string;
  image?: string;
  theme?: ThemeOptions;
}

interface PaymentComponentProps {
  amount: number;
  customer: CustomerInfo;
  config: RazorpayConfig;
  buttonLabel?: string;
  buttonClassName?: string;
  onPaymentSuccess?: (paymentData: { razorpay_payment_id: string }, orderId: string) => void;
  onPaymentFailure?: (error: { code?: string; description?: string }) => void;
  onPaymentCancel?: () => void;
  handleSubmit?: () => Promise<{ success: boolean; orderId: string }>;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({
  amount,
  customer,
  config,
  buttonLabel = 'Pay Now',
  buttonClassName = 'bg-green-600 px-6 py-3 rounded-lg',
  onPaymentSuccess,
  onPaymentFailure,
  onPaymentCancel,
  handleSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | 'cancelled' | null>(null);
  const [paymentData, setPaymentData] = useState<{ razorpay_payment_id?: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const showToast = useCallback((msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.LONG);
    } else {
      // Add iOS-compatible toast solution here, e.g., react-native-toast-message
      console.log(msg); // Fallback for iOS
    }
  }, []);

  const validateInputs = useCallback(() => {
    if (!amount || amount <= 0) {
      showToast('Invalid payment amount');
      return false;
    }
    if (!customer.name || !customer.email || !customer.phone) {
      showToast('Please provide complete customer information');
      return false;
    }
    if (!config.name || !config.currency || !config.description) {
      showToast('Invalid payment configuration');
      return false;
    }
    return true;
  }, [amount, customer, config, showToast]);

  const handlePayment = useCallback(async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      setStatus(null);
      setErrorMessage('');

      let orderId: string | undefined;
      if (handleSubmit) {
        const orderResult = await handleSubmit();
        if (!orderResult?.success) {
          showToast('Order not placed');
          throw new Error('Failed to place order: Invalid response');
        }
        orderId = orderResult.orderId;
      }

      const order = await createRazorpayOrder(amount);
      if (!order?.id) {
        throw new Error('Failed to create order: Invalid response');
      }

      const options = createRazorpayOptions(amount * 100, order.id, customer, config);
      const data = await openRazorpayCheckout(options);

      if (data?.razorpay_payment_id) {
        setStatus('success');
        setPaymentData(data);
        setShowModal(true);
        onPaymentSuccess?.(data, orderId || order.id);
        showToast('Payment completed successfully!');
      } else {
        throw new Error('Invalid payment response');
      }
    } catch (error: any) {
      let errorMsg = 'Something went wrong';

      if (error?.code === 'PAYMENT_CANCELLED') {
        setStatus('cancelled');
        errorMsg = 'Payment was cancelled by user';
        onPaymentCancel?.();
      } else if (error?.code === 'NETWORK_ERROR') {
        errorMsg = 'Network connection failed. Please check your internet';
        onPaymentFailure?.(error);
      } else if (error?.description) {
        errorMsg = error.description;
        onPaymentFailure?.(error);
      } else {
        onPaymentFailure?.(error);
      }

      setStatus('error');
      setErrorMessage(errorMsg);
      setPaymentData(error);
      setShowModal(true);
      showToast(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [amount, customer, config, showToast, validateInputs, onPaymentSuccess, onPaymentFailure, onPaymentCancel, handleSubmit]);

  const retry = useCallback(() => {
    setShowModal(false);
    setTimeout(handlePayment, 300);
  }, [handlePayment]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setPaymentData(null);
    setErrorMessage('');
  }, []);

  return (
    <View className="items-center justify-center">
      <TouchableOpacity
        disabled={loading}
        className={`${buttonClassName} ${loading ? 'opacity-50' : ''}`}
        onPress={handlePayment}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-semibold">{buttonLabel}</Text>
        )}
      </TouchableOpacity>

      <Modal transparent animationType="fade" visible={showModal}>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white p-6 rounded-2xl w-11/12 max-w-md items-center">
            {status === 'success' ? (
              <>
                <Text className="text-4xl mb-2">✅</Text>
                <Text className="text-lg font-semibold mb-1">Payment Successful</Text>
                <Text className="text-gray-700 mb-4 text-center">
                  ID: ***{paymentData?.razorpay_payment_id?.slice(-6) || 'N/A'}
                </Text>
                <Text className="text-gray-600 mb-4 text-center">
                  Amount: {amount.toFixed(2)} {config.currency}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    closeModal();
                    showToast('Receipt will be shared on Mail');
                  }}
                  className="bg-blue-600 px-4 py-2 rounded-md"
                >
                  <Text className="text-white font-medium">View Receipt</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-4xl mb-2">{status === 'cancelled' ? '⚠️' : '❌'}</Text>
                <Text className="text-lg font-semibold mb-1">
                  {status === 'cancelled' ? 'Payment Cancelled' : 'Payment Failed'}
                </Text>
                <Text className="text-gray-700 mb-4 text-center">
                  {errorMessage}
                </Text>
                <View className="flex-row items-center justify-center gap-4">
                  <TouchableOpacity
                    onPress={retry}
                    className="bg-red-500 px-4 py-2 rounded-md"
                  >
                    <Text className="text-white font-medium">Retry Payment</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={closeModal}
                    className="bg-gray-300 px-4 py-2 rounded-md"
                  >
                    <Text className="text-white font-medium">Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentComponent;