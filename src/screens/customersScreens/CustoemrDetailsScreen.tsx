import React from 'react';
import {View, Text, TouchableOpacity, Image, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ImagePath} from '../../constants/ImagePath';

const CustomerDetailsScreen = () => {
  const navigation = useNavigation();

  // Sample customer data
  const customer = {
    name: 'John Doe',
    profileImage: ImagePath.profile1,
    items: [
      {
        id: '1',
        name: 'Chicken Biryani',
        image: ImagePath.item2,
        quantity: '3 plates',
      },
      {
        id: '2',
        name: 'Paneer Tikka',
        image: ImagePath.item3,
        quantity: '1 piece',
      },
    ],
    arrivedAt: '10:30 AM',
    totalAmount: '₹560',
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text className={`text-2xl font-poppins text-center mb-4 `}>
        Customer Details
      </Text>

      {/* Profile Section */}
      <View className="flex-row items-center mb-6">
        <Image
          source={customer.profileImage}
          className="w-20 h-20 rounded-full mr-4"
        />
        <Text className="text-xl font-bold">{customer.name}</Text>
      </View>

      {/* Ordered Items Title */}
      <Text className="text-lg font-semibold mb-3">Ordered Items</Text>

      {/* Ordered Items List */}
      {customer.items.map(item => (
        <View key={item.id} className="flex-row items-center mb-4">
          <Image
            source={item.image}
            className="w-16 h-16 rounded-lg mr-3"
            resizeMode="cover"
          />
          <View className="flex-1">
            <Text className="text-base font-medium">{item.name}</Text>
            <Text className="text-sm text-gray-600">{item.quantity}</Text>
          </View>
        </View>
      ))}

      {/* Arrival Info */}
      <Text className="text-base font-semibold mt-4">Arrived at</Text>
      <Text className="text-sm text-gray-700 mb-4">{customer.arrivedAt}</Text>

      {/* Total Amount */}
      <View className='flex-row items-center justify-between mb-6 p-4 bg-primary-10 rounded-xl'>
        <Text className="text-base font-semibold">Total Amount</Text>
        <Text className="text-lg font-bold text-green-600">
          {customer.totalAmount}/-
        </Text>
      </View>

      {/* Add Order Button */}
      <TouchableOpacity
        className="bg-primary-80 py-3 rounded-lg items-center"
        onPress={() => {
          console.log('Add Order pressed');
        }}>
        <Text className="text-white font-bold text-base">Add Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CustomerDetailsScreen;
