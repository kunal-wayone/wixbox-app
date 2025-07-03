import {Platform, PermissionsAndroid, Alert} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

/**
 * A utility class for handling various permission requests in the app
 */
class PermissionsHelper {
  /**
   * Request camera permission for document scanning and video verification
   * @returns {Promise<boolean>} - True if permission granted, false otherwise
   */
  static async requestCameraPermission() {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          ]);

          return (
            granted[PermissionsAndroid.PERMISSIONS.CAMERA] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
              PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      }

      // iOS case
      const result = await request(PERMISSIONS.IOS.CAMERA);
      return result === RESULTS.GRANTED;
    } catch (err) {
      console.warn('Error requesting camera permission:', err);
      return false;
    }
  }

  /**
   * Request microphone permission for video recording
   * @returns {Promise<boolean>} - True if permission granted, false otherwise
   */
  static async requestMicrophonePermission() {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message:
              'MyPhysio needs access to your microphone for video verification.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await request(PERMISSIONS.IOS.MICROPHONE);
        return result === RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Error requesting microphone permission:', err);
      return false;
    }
  }

  /**
   * Request storage permissions for document handling
   * @returns {Promise<boolean>} - True if permission granted, false otherwise
   */
  static async requestStoragePermission() {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          // Android 13+ uses more granular permissions
          const photoPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          );
          const videoPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          );
          return (
            photoPermission === PermissionsAndroid.RESULTS.GRANTED &&
            videoPermission === PermissionsAndroid.RESULTS.GRANTED
          );
        } else {
          // Older Android versions
          const readPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          );
          const writePermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          return (
            readPermission === PermissionsAndroid.RESULTS.GRANTED &&
            writePermission === PermissionsAndroid.RESULTS.GRANTED
          );
        }
      } else {
        // iOS photo library permissions
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        return result === RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Error requesting storage permission:', err);
      return false;
    }
  }

  /**
   * Request location permission
   * @param {boolean} background - Whether to request background location permission
   * @returns {Promise<boolean>} - True if permission granted, false otherwise
   */
  static async requestLocationPermission(background = false) {
    try {
      if (Platform.OS === 'android') {
        const fineLocationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message:
              'MyPhysio needs access to your location to provide location-based services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        // If background location is needed and fine location was granted
        if (
          background &&
          fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED
        ) {
          if (Platform.Version >= 29) {
            // Android 10+
            const backgroundPermission = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
              {
                title: 'Background Location Permission',
                message:
                  'MyPhysio needs access to your location in the background to provide continuous location-based services.',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
              },
            );
            return backgroundPermission === PermissionsAndroid.RESULTS.GRANTED;
          }
        }

        return fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS location permissions
        const permission = background
          ? PERMISSIONS.IOS.LOCATION_ALWAYS
          : PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;

        const result = await request(permission);
        return result === RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn('Error requesting location permission:', err);
      return false;
    }
  }

  /**
   * Request all required permissions for document scanning
   * @returns {Promise<boolean>} - True if all permissions granted, false otherwise
   */
  static async requestDocumentScannerPermissions() {
    const cameraGranted = await this.requestCameraPermission();
    const storageGranted = await this.requestStoragePermission();

    if (!cameraGranted || !storageGranted) {
      Alert.alert(
        'Permissions Required',
        'Camera and storage permissions are required to scan documents. Please grant these permissions to continue.',
        [{text: 'OK'}],
      );
      return false;
    }

    return true;
  }

  /**
   * Request all required permissions for video verification
   * @returns {Promise<boolean>} - True if all permissions granted, false otherwise
   */
  static async requestVideoVerificationPermissions() {
    const cameraGranted = await this.requestCameraPermission();
    const microphoneGranted = await this.requestMicrophonePermission();
    const storageGranted = await this.requestStoragePermission();

    if (!cameraGranted || !microphoneGranted || !storageGranted) {
      Alert.alert(
        'Permissions Required',
        'Camera, microphone, and storage permissions are required for video verification. Please grant these permissions to continue.',
        [{text: 'OK'}],
      );
      return false;
    }

    return true;
  }
}

export default PermissionsHelper;