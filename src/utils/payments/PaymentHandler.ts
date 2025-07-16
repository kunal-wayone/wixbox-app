import RazorpayCheckout from 'react-native-razorpay';
import { Alert, ToastAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaymentData {
  razorpay_order_id?: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
}

interface PaymentError {
  code: string;
  step?: string;
  source?: string;
  reason?: string;
  description: string;
  metadata?: any;
}

class PaymentHandler {
  private static instance: PaymentHandler;
  private paymentInProgress = false;
  private maxRetries = 3;
  private retryDelay = 1000;

  static getInstance(): PaymentHandler {
    if (!PaymentHandler.instance) {
      PaymentHandler.instance = new PaymentHandler();
    }
    return PaymentHandler.instance;
  }

  private showToast(message: string) {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.LONG);
    }
  }

  private async storePaymentHistory(data: PaymentData, status: 'success' | 'failed' | 'cancelled') {
    try {
      const existing = await AsyncStorage.getItem('payment_history');
      const history = existing ? JSON.parse(existing) : [];
      history.push({
        ...data,
        status,
        timestamp: new Date().toISOString(),
        platform: Platform.OS,
      });
      await AsyncStorage.setItem('payment_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Payment history save failed:', e);
      this.showToast('Failed to save payment history');
    }
  }

  private showSuccessAlert(data: PaymentData) {
    const id = data.razorpay_payment_id 
      ? `***${data.razorpay_payment_id.slice(-6)}` 
      : 'N/A';
    // Alert.alert(
    //   '🎉 Payment Success',
    //   `Payment ID: ${id}\nTime: ${new Date().toLocaleTimeString()}`,
    //   [
    //     {
    //       text: 'Done',
    //       onPress: () => this.showToast('Payment completed successfully'),
    //     },
    //     {
    //       text: 'View Receipt',
    //       onPress: () => {
    //         this.showToast('Receipt will be shared soon');
    //         console.log('Receipt:', data);
    //       },
    //     },
    //   ],
    // );
  }

  private showErrorAlert(error: PaymentError, retryCallback: () => void) {
    const description = error.description || 'Unknown Error';
    let message = description;
    
    switch (error.code) {
      case 'PAYMENT_CANCELLED':
        message = 'Payment was cancelled by user';
        break;
      case 'NETWORK_ERROR':
        message = 'Network connection failed. Please check your internet';
        break;
      case 'BAD_REQUEST_ERROR':
        message = 'Invalid payment request. Please try again';
        break;
      case 'TIMEOUT':
        message = 'Payment timed out. Please try again';
        break;
    }

    Alert.alert(
      error.code === 'PAYMENT_CANCELLED' ? '⚠️ Payment Cancelled' : '❌ Payment Failed',
      `Reason: ${message}`,
      [
        {
          text: 'Retry',
          onPress: () => {
            this.showToast('Retrying payment...');
            retryCallback();
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => this.showToast('Payment attempt cancelled'),
        },
      ],
    );
  }

  async processPayment(razorpayOptions: any, retryCount = 0): Promise<PaymentData> {
    if (this.paymentInProgress) {
      this.showToast('Another payment is in progress...');
      throw new Error('Payment in progress');
    }

    this.paymentInProgress = true;

    try {
      if (!razorpayOptions?.key || !razorpayOptions?.order_id) {
        throw new Error('Invalid payment configuration');
      }

      const data: PaymentData = await RazorpayCheckout.open(razorpayOptions);
      if (!data.razorpay_payment_id) {
        throw new Error('Invalid payment response');
      }

      await this.storePaymentHistory(data, 'success');
      // this.showSuccessAlert(data);f
      return data;
    } catch (error: any) {
      const paymentError: PaymentError = {
        code: error?.code || 'UNKNOWN_ERROR',
        description: error?.description || 'Unknown error occurred',
        step: error?.step,
        source: error?.source,
        reason: error?.reason,
        metadata: error?.metadata,
      };

      await this.storePaymentHistory(
        { razorpay_payment_id: 'failed', ...paymentError },
        paymentError.code === 'PAYMENT_CANCELLED' ? 'cancelled' : 'failed'
      );

      if (retryCount < this.maxRetries && paymentError.code !== 'PAYMENT_CANCELLED') {
        this.showToast(`Retrying payment (${retryCount + 1}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.processPayment(razorpayOptions, retryCount + 1);
      }

      this.showErrorAlert(paymentError, () => this.processPayment(razorpayOptions));
      throw paymentError;
    } finally {
      this.paymentInProgress = false;
    }
  }
}

export const initiatePayment = async (options: any) => {
  const handler = PaymentHandler.getInstance();
  return await handler.processPayment(options);
};