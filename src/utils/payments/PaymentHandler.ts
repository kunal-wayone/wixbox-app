// src/handlers/PaymentHandler.ts
import RazorpayCheckout from 'react-native-razorpay';
import {Alert, ToastAndroid, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentData {
  razorpay_order_id?: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
}

interface PaymentError {
  code: string;
  step: string;
  source: string;
  reason: string;
  description: string;
}

class PaymentHandler {
  private static instance: PaymentHandler;
  private paymentInProgress = false;

  static getInstance(): PaymentHandler {
    if (!PaymentHandler.instance) {
      PaymentHandler.instance = new PaymentHandler();
    }
    return PaymentHandler.instance;
  }

  private showToast(message: string) {
    if (Platform.OS === 'android') ToastAndroid.show(message, ToastAndroid.SHORT);
  }

  private async storePaymentHistory(data: PaymentData, status: 'success' | 'failed') {
    try {
      const existing = await AsyncStorage.getItem('payment_history');
      const history = existing ? JSON.parse(existing) : [];
      history.push({...data, status, timestamp: new Date().toISOString()});
      await AsyncStorage.setItem('payment_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Payment history save failed:', e);
    }
  }

  private showSuccessAlert(data: PaymentData) {
    const id = `***${data.razorpay_payment_id.slice(-6)}`;
    Alert.alert(
      '🎉 Payment Success',
      `Payment ID: ${id}\nTime: ${new Date().toLocaleTimeString()}`,
      [
        {text: 'Done', onPress: () => this.showToast('Success!')},
        {text: 'View Receipt', onPress: () => console.log('Receipt:', data)},
      ],
    );
  }

  private showErrorAlert(error: PaymentError) {
    Alert.alert(
      '❌ Payment Failed',
      `Reason: ${error.description || 'Unknown Error'}`,
      [
        {text: 'Retry', onPress: () => this.showToast('Retrying...')},
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  }

  async processPayment(razorpayOptions: any) {
    if (this.paymentInProgress) return this.showToast('Payment in progress...');
    this.paymentInProgress = true;

    try {
      const data: PaymentData = await RazorpayCheckout.open(razorpayOptions);
      console.log('Payment success', data);
      await this.storePaymentHistory(data, 'success');
      this.showSuccessAlert(data);
      return data;
    } catch (error: any) {
      console.log('Payment error', error);
      await this.storePaymentHistory({razorpay_payment_id: 'failed'}, 'failed');
      this.showErrorAlert(error);
    } finally {
      this.paymentInProgress = false;
    }
  }
}

export const initiatePayment = async (options: any) => {
  const handler = PaymentHandler.getInstance();
  return await handler.processPayment(options);
};
