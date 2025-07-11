import {View, Text, Dimensions, Image, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {ImagePath} from '../../constants/ImagePath';

const {width, height} = Dimensions.get('screen');

const AccountTypeScreen = () => {
  const [selectedType, setSelectedType] = useState(null); // State to track selected account type
  const navigation = useNavigation<any>(); // Hook for navigation

  // Function to handle selection and navigation
  const handleSelection = (type: any) => {
    setSelectedType(type);
    // Navigate to the next screen with the selected type as a prop
    navigation.navigate('SignUpScreen', {accountType: type});
  };

  return (
    <View style={{width, height}} className='p-4'>
      <View
        style={{height: height * 0.87}}
        className="flex justify-center items-center gap-10">
        {/* Business Option */}
        <TouchableOpacity onPress={() => handleSelection('vendor')}>
          <View className="text-center">
            <View
              style={{
                width: width * 0.6,
                height: width * 0.6,
                borderWidth: selectedType === 'vendor' ? 2 : 0, // Border for unselected
                borderColor: 'black',
              }}
              className="mx-auto bg-gray-300 mt-4 rounded-full overflow-hidden p-10 flex justify-center items-center">
              <Image
                source={ImagePath.business}
                className="w-full h-full object-center"
                resizeMode="contain"
              />
            </View>
            <Text className="text-center my-4 font-poppins font-bold">
              Enter As Business
            </Text>
          </View>
        </TouchableOpacity>

        {/* Customer Option */}
        <TouchableOpacity onPress={() => handleSelection('user')}>
          <View className="text-center">
            <View
              style={{
                width: width * 0.6,
                height: width * 0.6,
                borderWidth: selectedType === 'user' ? 2 : 0, // Border for unselected
                borderColor: 'black',
              }}
              className="mx-auto bg-gray-300 mt-4 rounded-full overflow-hidden p-10 flex justify-center items-center">
              <Image
                source={ImagePath.customer}
                className="w-full h-full object-center"
                resizeMode="contain"
              />
            </View>
            <Text className="text-center my-4 font-poppins font-bold">
              Enter As Customer
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AccountTypeScreen;
