// src/utils/razorpay.ts
import { Buffer } from 'buffer';
import { initiatePayment } from './PaymentHandler';
import { ToastAndroid } from 'react-native';

const key_id = 'rzp_test_L96fF7vkpakUq7';
const key_secret = '5F3ivNxJYCVvk25HhXE6CSOG';

export const generateRandomReceiptId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const createRazorpayOrder = async (amount: number) => {
  const auth = Buffer.from(`${key_id}:${key_secret}`).toString('base64');
  const receiptId = generateRandomReceiptId();

  const payload = {
    currency: 'INR',
    amount: amount * 100,
    receipt: `receipt_${receiptId}`,
  };

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.description || 'Order creation failed');
  return data;
};

export const createRazorpayOptions = (
  amount: number,
  orderId: string,
  customerInfo: any,
  options: any,
) => ({
  amount,
  order_id: orderId,
  key: key_id,
  name: options.name,
  currency: options.currency,
  description: options.description,
  image: options.image || '',
  prefill: {
    name: customerInfo.name,
    email: customerInfo.email,
    contact: customerInfo.phone,
  },
  theme: {
    color: options.theme?.color || '#F37254',
    backdrop_color: options.theme?.backdrop_color || '#FFFFFF',
    hide_topbar: options.theme?.hide_topbar || false,
  },
  modal: {
    ondismiss: () => {
      ToastAndroid.show('Payment cancelled.', ToastAndroid.SHORT);
    },
  },
  retry: { enabled: true, max_count: 2 },
  timeout: 300,
});

export const openRazorpayCheckout = async (razorpayOptions: any) => {
  return await initiatePayment(razorpayOptions);
};
