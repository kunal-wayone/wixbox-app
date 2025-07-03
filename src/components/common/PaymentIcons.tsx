import React from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const PaymentIcons = ({ paymentMethods }: { paymentMethods: string[] }) => {
  const renderIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return <MaterialCommunityIcons name="cash" size={20} color="#333" />;
      case 'card':
        return <FontAwesome name="credit-card" size={16} color="#333" />;
      case 'upi':
        return <MaterialCommunityIcons name="bank-transfer" size={20} color="#333" />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-row items-center gap-4">
      {paymentMethods.map((method, index) => (
        <View key={index} className="flex-row items-center gap-1">
          {renderIcon(method)}
          <Text className="font-poppins text-gray-600">{method}</Text>
        </View>
      ))}
    </View>
  );
};

export default PaymentIcons;
