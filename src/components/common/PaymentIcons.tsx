import React from 'react';
import { View, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const PaymentIcons = ({ paymentMethods }: { paymentMethods: string[] }) => {
  const renderIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return <MaterialCommunityIcons name="cash" size={20} color="#fff" />;
      case 'card':
        return <FontAwesome name="credit-card" size={16} color="#fff" />;
      case 'upi':
        return <MaterialCommunityIcons name="bank-transfer" size={20} color="#fff" />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-row items-center gap-4">
      {paymentMethods.map((method, index) => (
        <View key={index} className="flex-row items-center gap-1">
          {renderIcon(method)}
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="   text-gray-50">{method}</Text>
        </View>
      ))}
    </View>
  );
};

export default PaymentIcons;
