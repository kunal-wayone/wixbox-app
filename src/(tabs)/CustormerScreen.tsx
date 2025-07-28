import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { ImagePath } from '../constants/ImagePath';
import { Image } from 'react-native';
import Button from '../components/common/Button';
import { useNavigation } from '@react-navigation/native';

const CustormerScreen = () => {
  const navigation = useNavigation<any>()
  return (
    <View className="p-4 pt-10">
      <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-2xl text-center">Customer Onboard</Text>
      <View className="w-64 h-64 mx-auto my-16">
        <Image
          source={ImagePath.onboard}
          resizeMode="contain"
          className="w-full h-full"
        />
      </View>
      <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-xl text-center  font-bold ">
        Waiting For Customers....
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate("CreateAdScreen")} className="bg-primary-60 w-4/5 mx-auto rounded-lg my-8 p-4">
        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-center  font-bold text-lg">
          Promote a Product
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustormerScreen;
