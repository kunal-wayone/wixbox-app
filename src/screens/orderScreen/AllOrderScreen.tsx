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
  Modal,
  ScrollView,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { ImagePath } from '../../constants/ImagePath';
import { SafeAreaView } from 'react-native-safe-area-context';


const AllOrderScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [searchQuery, setSearchQuery] = useState('');
  const [ordersList, setOrdersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const user: any | null = useSelector((state: RootState) => state.user.data);

  const fetchAds = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: any = await Fetch(`/user/vendor/get-order`, {}, 5000);
      if (!response.success) throw new Error('Failed to fetch orders');
      setOrdersList(response.data || []);
    } catch (error: any) {
      ToastAndroid.show(
        error?.message || 'Failed to load orders.',
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

  const filteredOrders = React.useMemo(
    () =>
      ordersList.filter((item: any) =>
        item?.name?.toLowerCase().includes(searchQuery?.toLowerCase())
      ),
    [ordersList, searchQuery]
  );

  const renderCustomerCard = ({ item }: any) => (
    <View className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-md">
      <View className="flex-row mb-4">
        <Image
          source={ImagePath.profile1}
          resizeMode="cover"
          className="w-20 h-20 rounded-full mr-3"
        />
        <View className="flex-1 justify-center">
          <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-base mb-1">{item?.name}</Text>
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Ordered: {item?.order?.length || 0} items</Text>
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Arriving at: {item?.arrived_at}</Text>
          <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-sm text-gray-600 ">Total Amount: ₹{item?.total_amount}</Text>
          <Text style={{ fontFamily: 'Raleway-Regular' }}
            className={` text-sm  absolute top-0 right-0 px-2 py-1 rounded-md
              ${item?.status === '0' ? 'bg-blue-100 text-blue-700 ' :
                item?.status === '1' ? 'bg-green-100 text-green-700' :
                  item?.status === '2' ? 'bg-red-100 text-red-700 ' :
                    item?.status === '3' ? 'bg-yellow-100 text-yellow-700 ' :
                      'bg-gray-100 text-gray-800 '}
            `}
          >
            {item?.status === '0' ? 'Pending' :
              item?.status === '1' ? 'Completed' :
                item?.status === '2' ? 'Cancelled' :
                  item?.status === '3' ? 'Refund' :
                    'Unknown'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        className="bg-primary-90 py-2.5 rounded-lg items-center"
        onPress={() => {
          setSelectedOrder(item);
          setModalVisible(true);
        }}>
        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white text-sm">View Order Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderModalContent = () => {
    const statusMap: Record<string, { label: string; bg: string; text: string }> = {
      '0': { label: 'Pending', bg: 'bg-blue-100', text: 'text-blue-700' },
      '1': { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700' },
      '2': { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },
      '3': { label: 'Refund', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    };

    const status = selectedOrder?.status?.toString() || '';
    const statusInfo = statusMap[status] || {
      label: 'Unknown',
      bg: 'bg-gray-100',
      text: 'text-gray-800',
    };

    const totalServiceTax =
      selectedOrder?.service_tax?.reduce((acc: number, val: string) => acc + Number(val), 0) || 0;

    const finalAmount = (
      parseFloat(selectedOrder?.total_amount || '0') -
      parseFloat(selectedOrder?.discount || '0')
    ).toFixed(2);

    return (
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white w-full rounded-xl p-4 max-h-[85%]">
            <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-lg text-center mb-2">Order Details</Text>

            {/* Order Info */}
            <View className="mb-4 p-3 rounded-lg bg-gray-100 relative">
              <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base  mb-1 text-gray-700">Order Summary</Text>
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Total Amount: ₹{selectedOrder?.total_amount}</Text>
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Discount: ₹{selectedOrder?.discount}</Text>
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Service Tax: ₹{totalServiceTax}</Text>
              <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-sm text-gray-900 mt-1">Final Amount: ₹{finalAmount}</Text>

              <Text style={{ fontFamily: 'Raleway-SemiBold' }}
                className={`absolute top-0 right-0 px-2 py-1 text-sm rounded-md ${statusInfo.bg} ${statusInfo.text}`}
              >
                {statusInfo.label}
              </Text>

              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600 mt-1">
                Ordered At: {new Date(selectedOrder?.created_at).toLocaleString()}
              </Text>
            </View>

            {/* Items */}
            <ScrollView className="max-h-[50%] mb-4">
              {selectedOrder?.order?.map((item: any, index: number) => (
                <View key={index} className="flex-row items-center mb-3">
                  <Image
                    source={item?.image ? { uri: `${IMAGE_URL}${item.image}` } : ImagePath.item1}
                    className="w-16 h-16 rounded mr-3"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base">{item.name}</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Qty: {item.quantity}</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Price: ₹{item.price}</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Subtotal: ₹{item.sub_total}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              className="mt-4 bg-red-500 py-2 rounded-md items-center"
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white ">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View className="flex-1 bg-gray-100 p-4">
        <View className="absolute left-2 top-2 z-50">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-2xl text-center mb-4">
          {user?.role === 'user' ? 'Orders History' : 'Manage Customer'}
        </Text>

        <View className="flex-row justify-between mb-6 hidden">
          <View className="flex-1 flex-row items-center border border-gray-300 rounded-xl mr-3 px-2">
            <Ionicons name="search" size={20} color="#4B5563" />
            <TextInput style={{ fontFamily: 'Raleway-Regular' }}
              className="flex-1 text-base ml-2"
              placeholder="Search Order"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center mt-10">
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        ) : filteredOrders.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-10">
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-500 text-lg">No orders found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            renderItem={renderCustomerCard}
            keyExtractor={(item: any) => item.id}
            showsVerticalScrollIndicator={false}
          />
        )}

        {renderModalContent()}
      </View>
    </SafeAreaView>
  );
};

export default AllOrderScreen;