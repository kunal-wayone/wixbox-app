import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../../constants/ImagePath';
import { useNavigation } from '@react-navigation/native';

const PaymentScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Back Button */}
      <TouchableOpacity className="ml-4 mt-4" onPress={() => { }}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* Title */}
      <View className="items-center">
        <Text style={{ fontFamily: 'Raleway-BOld' }} className="text-2xl text-gray-800">Payment Method</Text>
      </View>

      {/* Pay By UPI Section */}
      <View className="mt-8 px-4">
        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-md text-gray-700">
          Pay By Any UPI App
        </Text>
        <View className="mt-4 bg-primary-10 rounded-xl p-4 shadow-md">
          {/* Google Pay */}
          <TouchableOpacity
            className="flex-row items-center py-3"
            onPress={() => setSelectedMethod('Google Pay')}>
            <Image
              source={ImagePath.gpay}
              className="w-5 h-5 mr-2"
              resizeMode="contain"
            />
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="flex-1 text-gray-700 text-base">Google Pay</Text>
            <View className="w-5 h-5 rounded-full border-2 border-primary-100 items-center justify-center">
              {selectedMethod === 'Google Pay' && (
                <View className="w-3 h-3 rounded-full bg-primary-100" />
              )}
            </View>
          </TouchableOpacity>
          {/* PhonePe */}
          <TouchableOpacity
            className="flex-row items-center py-3 border-t border-dashed border-gray-300"
            onPress={() => setSelectedMethod('PhonePe')}>
            <Image
              source={ImagePath.ppay}
              className="w-5 h-5 mr-2"
              resizeMode="contain"
            />
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="flex-1 text-gray-700 text-base">PhonePe</Text>
            <View className="w-5 h-5 rounded-full border-2 border-primary-100 items-center justify-center">
              {selectedMethod === 'PhonePe' && (
                <View className="w-3 h-3 rounded-full bg-primary-100" />
              )}
            </View>
          </TouchableOpacity>
          {/* Add New UPI ID */}
          <TouchableOpacity
            className="flex-row items-center py-3 border-t border-dashed border-gray-300"
            onPress={() => setSelectedMethod('New UPI ID')}>
            <MaterialIcons name="add" size={24} color="gray" className="mr-3" />
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="flex-1 text-gray-700 text-base">
              Add New UPI ID
            </Text>
            <View className="w-5 h-5 rounded-full border-2 border-primary-100 items-center justify-center">
              {selectedMethod === 'New UPI ID' && (
                <View className="w-3 h-3 rounded-full bg-primary-100" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Credit & Debit Cards Section */}
      <View className="mt-6 px-4">
        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-lg text-gray-700">
          Credit & Debit Cards
        </Text>
        <View className="mt-4 bg-primary-10 rounded-xl p-4 shadow-md">
          <TouchableOpacity className="flex-row items-center py-3 border border-gray-300 rounded-lg">
            <MaterialIcons
              name="add"
              size={24}
              color="gray"
              className="ml-3 mr-3"
            />
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-700 text-base">Add New Card</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* More Payment Options Section */}
      <View className="mt-4 px-4">
        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-lg text-gray-700">
          More Payment Options
        </Text>
        <View className="mt-4 bg-primary-10 rounded-xl p-4 shadow-md">
          <TouchableOpacity className="flex-row items-center py-3 border-b border-dashed border-gray-300">
            <Image
              source={ImagePath.bank}
              className="w-5 h-5 mr-4"
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-700 text-base">Net Banking</Text>
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-500 text-sm">
                Select from a list of banks
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-3">
            <Image
              source={ImagePath.bank}
              className="w-5 h-5 mr-4"
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-700 text-base">Pay on Delivery</Text>
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-500 text-sm">
                Pay in cash or pay online
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pay Now Button */}
      <View className="mt-6 px-4">
        <TouchableOpacity
          className="bg-primary-90 py-3 px-4 rounded-lg"
          onPress={() => setModalVisible(true)}>
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white text-center font-medium">Pay Now</Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-xl p-6 w-11/12 shadow-md">
            {/* Restaurant Image */}
            <Image
              source={ImagePath.restaurant1}
              className="w-full h-32 rounded-lg"
              resizeMode="cover"
            />
            {/* Success Message */}
            <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-xl text-gray-800 mt-4 text-center">
              Reserved Successfully!
            </Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-600 text-center mt-2">
              Your cheese sandwich will be ready for pickup
            </Text>
            {/* Reservation Info */}
            <View className="flex-row items-center justify-between bg-primary-10  mt-4 p-4 rounded-xl ">
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-900 text-base w-1/2">
                Reserved for 23rd May 2025
              </Text>
              <View className="w-px h-8 bg-gray-300" />
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-900 text-base w-1/2 px-4">
                Table No. 12
              </Text>
            </View>
            {/* View Map Button */}
            <TouchableOpacity className="flex-row items-center justify-center mt-4 py-3 bg-primary-90 rounded-xl">
              <MaterialIcons
                name="location-on"
                size={20}
                color="gray"
                className="mr-2"
              />
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white text-base">View Map</Text>
            </TouchableOpacity>
            {/* Back to Home Button */}
            <TouchableOpacity
              className="  border border-gray-300 py-3 px-4 rounded-xl mt-4"
              onPress={() => navigation.navigate("HomeScreen")}>
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-primary-80 text-center font-medium">
                Back to Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PaymentScreen;
