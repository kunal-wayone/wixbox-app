import React from 'react';
import { TouchableOpacity, Text, Linking, Alert } from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const DirectionButton = ({ latitude, longitude }: { latitude: number; longitude: number }) => {
  const handleDirection = async () => {
    if (!latitude || !longitude) {
      Alert.alert('Location not available');
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Unable to open Google Maps');
    }
  };

  return (
    <TouchableOpacity
      className="flex-row items-center gap-1 border border-gray-300 p-2 px-4 rounded-lg"
      onPress={handleDirection}
    >
      <Entypo name="direction" size={16} color="#0a0a0a" />
      {/* <Text className="text-sm text-gray-800">Navigate</Text> */}
    </TouchableOpacity>
  );
};

export default DirectionButton;
