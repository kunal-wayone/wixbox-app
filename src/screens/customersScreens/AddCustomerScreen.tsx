import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ImagePath} from '../../constants/ImagePath';

// Mock customer data
const mockCustomers = [
  {
    id: '1',
    name: 'John Doe',
    orderedItems: 3,
    arrivedAt: '10:30 AM',
    image: ImagePath.profile1,
  },
  {
    id: '2',
    name: 'Jane Smith',
    orderedItems: 5,
    arrivedAt: '11:15 AM',
    image: ImagePath.profile1,
  },
];

const AddCustomerScreen = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');

  // Render each customer card
  const renderCustomerCard = ({item}: any) => (
    <View
      className={`bg-primary-20 border border-primary-20 rounded-xl p-4 mb-4 shadow-sm`}>
      <View className={`flex-row mb-4`}>
        <Image
          source={item.image}
          resizeMode="contain"
          className={`w-20 h-20 rounded-full mr-3`}
        />
        <View className={`flex-1 justify-center`}>
          <Text className={`text-base font-bold mb-2`}>{item.name}</Text>
          <View className="flex-row items-center gap-1">
            <Text
              className={`text-xs text-gray-600 bg-white px-2 p-0.5 rounded`}>
              Ordered: {item.orderedItems} items
            </Text>
            <Text
              className={`text-xs text-gray-600 bg-white px-2 p-0.5 rounded`}>
              Arrived at: {item.arrivedAt}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        className={`bg-primary-80 py-2.5 rounded-lg items-center`}
        onPress={() => {
          navigation.navigate('CustomerDetailsScreen');
          console.log(`View details for ${item.name}`);
        }}>
        <Text className={`text-white text-sm font-bold`}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className={`flex-1 bg-white p-4`}>
      {/* Header with Back Button */}
      <View className={`flex-row items-center`}>
        <TouchableOpacity onPress={() => navigation.goBack()} className={`p-2`}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text className={`text-2xl font-poppins text-center mb-4 `}>
        Add Customer
      </Text>

      {/* Search and Add Customer Section */}
      <View className={`flex-row justify-beeen mb-6`}>
        <View
          className={`flex-1 flex-row items-center w-1/2 border border-gray-300 rounded-lg mr-3`}>
          <Ionicons
            name="search"
            size={20}
            color="#4B5563"
            className={`ml-2`}
          />
          <TextInput
            className={`flex-1 h-10 text-base`}
            placeholder="Search Customer"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
        onPress={()=>navigation.navigate("AddCustomerFormScreen")}
          className={`flex-row items-center w-1/2 border border-gray-300   py-2.5 px-3 rounded-lg`}>
          <Ionicons name="add" size={20} color="gray" />
          <Text className={`text-gray-700 text-sm font-bold ml-2`}>
            Add Customer
          </Text>
        </TouchableOpacity>
      </View>

      {/* Customer List */}
      <FlatList
        data={mockCustomers}
        renderItem={renderCustomerCard}
        keyExtractor={item => item.id}
        // contentContainerStyle=}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AddCustomerScreen;
