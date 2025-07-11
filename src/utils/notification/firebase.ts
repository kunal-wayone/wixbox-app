import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';

/**
 * Ask the user for notification permission
 */
export async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Notification Permission Status:', authStatus);
        await getFcmToken(); // Fetch token after permission
    } else {
        console.warn('Notification permission not granted');
    }
}

/**
 * Fetch the device FCM token
 */
export const getFcmToken = async () => {
    try {
        const token = await messaging().getToken();
        if (token) {
            console.log('FCM Token:', token);
            return token;
            // ✅ You can save token to backend here
        } else {
            console.warn('Failed to get FCM token');
        }
    } catch (error) {
        console.error('Error fetching FCM token:', error);
    }
};

/**
 * Listen for token refresh
 */
export const onTokenRefreshListener = () => {
    return messaging().onTokenRefresh(token => {
        console.log('FCM Token refreshed:', token);
        // ✅ Update token in your backend if needed
    });
};

/**
 * Handle foreground notifications
 */
export const onForegroundMessageListener = () => {
    return messaging().onMessage(async remoteMessage => {
        console.log('📩 Foreground Message:', remoteMessage);
        Alert.alert(remoteMessage.notification?.title || 'New Notification', remoteMessage.notification?.body || '');
        // ✅ Optional: Show local notification if needed
    });
};

/**
 * Handle background notifications (when app is opened from a notification)
 */
export const onNotificationOpenedAppHandler = () => {
    messaging().onNotificationOpenedApp(remoteMessage => {
        if (remoteMessage) {
            console.log('📥 Notification caused app to open from background state:', remoteMessage);
            // ✅ Handle navigation here
        }
    });
};

/**
 * Handle notification when app is opened from quit state
 */
export const checkInitialNotification = async () => {
    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage) {
        console.log('🚀 App opened from quit state via notification:', remoteMessage);
        // ✅ Handle navigation here
    }
};

/**
 * Call this function in App.tsx or index.js inside useEffect()
 */
export const setupFCMListeners = () => {
    requestUserPermission();

    const unsubscribeForeground = onForegroundMessageListener();
    const unsubscribeTokenRefresh = onTokenRefreshListener();
    onNotificationOpenedAppHandler();
    checkInitialNotification();

    return () => {
        // Clean up
        unsubscribeForeground();
        unsubscribeTokenRefresh();
    };
};
