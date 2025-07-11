// src/components/PaymentComponent.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
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
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({
  amount,
  customer,
  config,
  buttonLabel = 'Pay Now',
  buttonClassName = 'bg-green-600 px-6 py-3 rounded-lg',
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const showToast = (msg: string) => ToastAndroid.show(msg, ToastAndroid.SHORT);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const order = await createRazorpayOrder(amount);
      const options = createRazorpayOptions(amount * 100, order.id, customer, config);
      const data = await openRazorpayCheckout(options);
      setStatus('success');
      setPaymentData(data);
      setShowModal(true);
    } catch (error: any) {
      setStatus('error');
      setPaymentData(error);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    setShowModal(false);
    setTimeout(handlePayment, 300);
  };

  return (
    <View className="items-center justify-center">
      <TouchableOpacity
        disabled={loading}
        className={buttonClassName}
        onPress={handlePayment}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold">{buttonLabel}</Text>
        )}
      </TouchableOpacity>

      {/* Modal */}
      <Modal transparent animationType="fade" visible={showModal}>
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white p-6 rounded-2xl w-11/12 max-w-md items-center">
            {status === 'success' ? (
              <>
                <Text className="text-4xl mb-2">✅</Text>
                <Text className="text-lg font-semibold mb-1">Payment Successful</Text>
                <Text className="text-gray-700 mb-4 text-center">
                  ID: ***{paymentData?.razorpay_payment_id?.slice(-6)}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowModal(false);
                    showToast('Receipt will be shared soon');
                  }}
                  className="bg-blue-600 px-4 py-2 rounded-md">
                  <Text className="text-white font-medium">View Receipt</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-4xl mb-2">❌</Text>
                <Text className="text-lg font-semibold mb-1">Payment Failed</Text>
                <Text className="text-gray-700 mb-4 text-center">
                  {paymentData?.description || 'Something went wrong.'}
                </Text>
                <TouchableOpacity
                  onPress={retry}
                  className="bg-red-500 px-4 py-2 rounded-md">
                  <Text className="text-white font-medium">Retry Payment</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentComponent;
