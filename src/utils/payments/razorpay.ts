import { Buffer } from 'buffer';
import { ToastAndroid, Platform } from 'react-native';
import { initiatePayment } from './PaymentHandler';

const key_id = 'rzp_test_L96fF7vkpakUq7';
const key_secret = '5F3ivNxJYCVvk25HhXE6CSOG';
const API_BASE_URL = 'https://api.razorpay.com/v1';

export const generateRandomReceiptId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const createRazorpayOrder = async (amount: number) => {
  try {
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount: Amount must be greater than 0');
    }

    const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
    const receiptId = generateRandomReceiptId();

    const payload = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `receipt_${receiptId}`,
      payment_capture: 1,
    };

    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      const error = data?.error || {};
      throw new Error(error.description || `Order creation failed: ${res.statusText}`);
    }

    if (!data?.id) {
      throw new Error('Invalid order response: Order ID missing');
    }

    return data;
  } catch (error: any) {
    const errorMsg = error.message || 'Failed to create payment order';
    if (Platform.OS === 'android') {
      ToastAndroid.show(errorMsg, ToastAndroid.LONG);
    }
    throw error;
  }
};

export const createRazorpayOptions = (
  amount: number,
  orderId: string,
  customerInfo: any,
  options: any,
) => {
  if (!orderId || !customerInfo?.name || !customerInfo?.email || !customerInfo?.phone) {
    throw new Error('Invalid payment options or customer information');
  }

  return {
    key: key_id,
    amount: Math.round(amount),
    currency: options.currency || 'INR',
    name: options.name || 'Payment',
    description: options.description || 'Payment for services',
    image: options.image || '',
    order_id: orderId,
    prefill: {
      name: customerInfo.name.trim(),
      email: customerInfo.email.trim(),
      contact: customerInfo.phone.trim(),
    },
    theme: {
      color: options.theme?.color || '#F37254',
      backdrop_color: options.theme?.backdrop_color || '#FFFFFF',
      hide_topbar: options.theme?.hide_topbar ?? false,
    },
    modal: {
      ondismiss: () => {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Payment cancelled by user', ToastAndroid.LONG);
        }
      },
      animation: true,
      escape: true,
      handle_back: true,
    },
    retry: {
      enabled: true,
      max_count: 3,
      timeout: 300,
    },
    notes: {
      receipt: options.receipt || `receipt_${generateRandomReceiptId()}`,
    },
    timeout: 300, // 5 minutes
  };
};

export const openRazorpayCheckout = async (razorpayOptions: any) => {
  try {
    const data = await initiatePayment(razorpayOptions);
    return data;
  } catch (error: any) {
    throw error;
  }
};