import React from 'react';
import { TouchableOpacity, Alert, Linking } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CallButton = ({ phone }: { phone: string }) => {
  const handleCall = async () => {
    if (!phone) {
      Alert.alert('Phone number not available');
      return;
    }

    const phoneNumber = `tel:${phone}`;

    const supported = await Linking.canOpenURL(phoneNumber);
    if (supported) {
      await Linking.openURL(phoneNumber);
    } else {
      Alert.alert('Error', 'Unable to open dialer');
    }
  };

  return (
    <TouchableOpacity
      className="border border-gray-300 p-2 px-3.5 rounded-lg"
      onPress={handleCall}
    >
      <Ionicons name="call-outline" size={17} />
    </TouchableOpacity>
  );
};

export default CallButton;
