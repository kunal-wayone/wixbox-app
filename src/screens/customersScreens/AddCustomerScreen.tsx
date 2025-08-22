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
import { ImagePath } from '../../constants/ImagePath';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { RootState } from '../../store/store';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import OrderCard from '../../components/common/OrderCard';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';


const quickActions = [
  {
    label: 'Booked Tables',
    icon: 'coffee',
    emoji: '🪑',
    screen: 'BookedTablesScreen',
    gradient: ['#34d399', '#059669'], // green gradient
  },
  {
    label: 'Moments',
    icon: 'target',
    emoji: '🎯',
    screen: 'MomentScreen',
    gradient: ['#fde68a', '#f59e0b'], // yellow-orange
  },
]

const AddCustomerScreen = () => {
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
      const url = user?.role === 'user' ? "/user/get-order-user" : "/user/vendor/get-order"
      const response: any = await Fetch(url, {}, 5000);


      console.log(response.data, response?.orders)
      if (!response.success) throw new Error('Failed to fetch orders');
      setOrdersList(response.data || response?.orders || []);
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
  console.log(filteredOrders)
  const renderCustomerCard = ({ item }: any, index: any) => (
    <OrderCard key={index} orderData={item} />
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
              <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base mb-1 text-gray-700">Order Summary</Text>
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
          {user?.role === 'user' ? 'Orders List' : 'Manage Customer'}
        </Text>

        {user?.role !== 'user' && <TouchableOpacity
          onPress={() => navigation.navigate('MomentScreen')}
          className="bg-primary-20 absolute right-4 top-3 py-2.5 px-3 rounded-lg justify-center">
          <Ionicons name="map" size={20} color="#B68AD4" />
        </TouchableOpacity>}

        {<View className="flex-row justify-between mb-6">
          <View className="flex-1 flex-row items-center border border-gray-300 rounded-xl mr-3 px-2">
            <Ionicons name="search" size={20} color="#4B5563" />
            <TextInput style={{ fontFamily: 'Raleway-Regular' }}
              className="flex-1 text-base ml-2"
              placeholder="Search Order"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          {user?.role !== "user" && <TouchableOpacity
            onPress={() => navigation.navigate('AddOrderScreen')}
            className="bg-primary-90 py-2.5 px-3 rounded-lg justify-center">
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>}
        </View>}


        {/* Quick Action Grid */}
        {user?.role !== 'user' && <View className="flex-row flex-wrap justify-between">
          {quickActions.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate(item.screen)}
              className="w-[48%] h-20 mb-3 bg-white rounded-xl flex-row items-center gap-2 px-2 pt-2 pb-1"
              // style={[style.shadow]}
              activeOpacity={0.8}
            >
              {/* Left: Gradient Icon Box */}
              <LinearGradient
                colors={item.gradient}
                style={{ borderRadius: 10 }}
                className="flex-1 w-2/5 p-3 flex-row justify-center items-center"
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather name={item.icon} size={25} color="#fff" />
              </LinearGradient>

              {/* Right: Label + Emoji */}
              <View className='w-3/5'>
                <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-sm mb-1 text-gray-600">{item.label}</Text>
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base">{item.emoji}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>}


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
        {user?.role === "user" && (
          <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')} className="p-3 rounded-xl w-11/12 m-auto mb-0   bg-primary-80  z-10">
            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className='text-center text-white '>
              Go To Home
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView >
  );
};

export default AddCustomerScreen;