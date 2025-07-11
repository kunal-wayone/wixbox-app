import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch } from '../../utils/apiUtils';
import { RootState } from '../../store/store';
import {  useSelector } from 'react-redux';

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
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState('');
  const [ordersList, setOrdersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const user: any | null = useSelector((state: RootState) => state.user.data);
  // const [filterOrders, setFilterOrders] = useState([])

  // Fetch menu items from server
  const fetchAds = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: any = await Fetch(`/user/vendor/get-order`, {}, 5000);
      console.log(response)
      if (!response.success) throw new Error('Failed to fetch ads');
      setOrdersList(response.data || []);
    } catch (error: any) {
      console.error('fetchAds error:', error.message);
      ToastAndroid.show(
        error?.message || 'Failed to load ads.',
        ToastAndroid.SHORT
      );
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    if (isFocused) {
      fetchAds();
    }
  }, [isFocused]);

  // Memoized filtered ads
  const filteredOrders = React.useMemo(() => ordersList.filter((item: any) =>
    item?.name?.toLowerCase().includes(searchQuery?.toLowerCase())
  ), [ordersList, searchQuery]);
  // Render each customer card
  const renderCustomerCard = ({ item }: any) => (
    <View
      className={`bg-primary-20 border border-primary-20 rounded-xl p-4 mb-4 shadow-sm`}>
      <View className={`flex-row mb-4`}>
        <Image
          source={item.image ? { uri: item?.image } : ImagePath?.profile1}
          resizeMode="contain"
          className={`w-20 h-20 rounded-full mr-3`}
        />
        <View className={`flex-1 justify-center`}>
          <Text className={`text-base font-bold mb-2`}>{item?.name}</Text>
          <View className="flex-row items-center gap-1">
            <Text
              className={`text-xs text-gray-600 bg-white px-2 p-0.5 rounded`}>
              Ordered: {item?.order?.length || 0} items
            </Text>
            <Text
              className={`text-xs text-gray-600 bg-white px-2 p-0.5 rounded`}>
              Arrived at: {item?.arrived_at}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity
        className={`bg-primary-80 py-2.5 rounded-lg items-center`}
        onPress={() => {
          navigation.navigate('CustomerDetailsScreen', { orderDetails: item });
          console.log(`View details for ${item.name}`);
        }}>
        <Text className={`text-white text-sm font-bold`}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className={`flex-1 bg-white p-4`}>
      {/* Header with Back Button */}
      <View className={`flex-row items-center z-50 absolute left-2 top-2`}>
        <TouchableOpacity onPress={() => navigation.goBack()} className={`p-2`}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text className={`text-2xl font-semibold text-center mb-4 `}>
        {user?.role === 'user' ? 'Orders List' : 'Manage Customer'}
      </Text>

      {/* Search and Add Customer Section */}
      <View className={`flex-row justify-between mb-6`}>
        <View
          className={`flex-1 flex-row items-center w-auto border border-gray-300 rounded-xl  mr-3`}>
          <Ionicons
            name="search"
            size={20}
            color="#4B5563"
            className={`ml-2`}
          />
          <TextInput
            className={`flex-1 text-base`}
            placeholder="Search Customer"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("AddCustomerFormScreen")}
          className={`flex-row items-center bg-primary-80 border border-gray-300   py-2.5 px-3 rounded-lg`}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Customer List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center mt-10">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredOrders.length === 0 ? (
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-gray-500 text-lg">No orders found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderCustomerCard}
          keyExtractor={(item: any) => item.id}
          // contentContainerStyle=}
          showsVerticalScrollIndicator={false}
        />)}
    </View>
  );
};

export default AddCustomerScreen;
