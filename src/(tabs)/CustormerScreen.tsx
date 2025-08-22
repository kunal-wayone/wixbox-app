import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  Modal,
  Pressable,
  Alert,
  Dimensions,
  Linking,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Fetch, Post } from '../utils/apiUtils';
import MomentCard from '../components/common/MomentCard';
import { states } from '../utils/data/constant';

const PRIMARY_COLOR = '#AC94F4';
const STATUS_COLORS: Record<string, string> = {
  Pending: '#fbbf24',
  Preparing: '#60a5fa',
  Ready: '#34d399',
};

const statusLabels: any = {
  '0': 'Pending',
  '1': 'Preparing',
  '2': 'Ready',
};

const statusToBackend: Record<string, string> = {
  Pending: '0',
  Preparing: '1',
  Ready: '2',
};


type Order = {
  order_id: number;
  shop_id: number;
  vendor_id: number;
  name: string;
  email: string;
  phone: string;
  arrived_at: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: number;
    sub_total: number;
    tax: number;
    tax_rate: number;
    image: string;
  }>;
  total_items: number;
  charges_summary: {
    subtotal: number;
    item_tax: number;
    service_tax: number;
    discount: string;
    total_amount: string;
  };
  service_tax_details: any[];
  created_at: string;
  status?: 'Pending' | 'Preparing' | 'Ready' | string;
};



const fetchUsers = async () => {
  const response: any = await Fetch('/user/notifications', {}, 5000);

  if (!response?.success) {
    throw new Error(response?.message || 'Failed to fetch notifications.');
  }

  return response?.notifications;
};

const fetchOrder = async () => {
  const response: any = await Fetch('/user/vendor/get-order', {}, 5000);

  if (!response?.success) {
    throw new Error(response?.message || 'Failed to fetch orders.');
  }

  return response?.data;
};

const CustomerScreen = () => {
  const navigation = useNavigation<any>();
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Preparing' | 'Ready'>('All');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<'Pending' | 'Preparing' | 'Ready'>('Pending');
  const [statusMessage, setStatusMessage] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      setRefreshing(true);
      const usersData = await fetchUsers();
      const ordersData = await fetchOrder();

      const ordersWithStatus: Order[] = ordersData.map((order: Order) => ({
        ...order,
        status: statusLabels[order.status] || 'Pending',
      }));
      setUsers(usersData);
      setOrdersList(ordersWithStatus);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const onRefresh = () => {
    loadUsers();
  };

  const filteredUsers = users?.filter((user) =>
    user?.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrders = ordersList.filter((order) => {
    if (activeTab === 'All') return true;
    return order.status === activeTab;
  });


  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(
      order.status === 'Pending' ||
        order.status === 'Preparing' ||
        order.status === 'Ready'
        ? (order.status as 'Pending' | 'Preparing' | 'Ready')
        : 'Pending'
    );
    setStatusMessage('');
    setModalVisible(true);
  };



  const submitStatusUpdate = async (order_id: number, status: 'Pending' | 'Preparing' | 'Ready') => {
    const statusMap = {
      Pending: '0',
      Preparing: '1',
      Ready: '2',
    };

    const payload = {
      order_id,
      status: statusMap[status],
      reason: statusMessage
    };

    try {
      const response: any = await Post('/user/vendor/update-order-status', payload, 5000);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to update status");
      }

      // Optimistically update the UI
      setOrdersList((prev) =>
        prev.map((order) =>
          order.order_id === selectedOrder?.order_id
            ? { ...order, status }
            : order
        )
      );

      setModalVisible(false);
    } catch (error) {
      ToastAndroid.show("Failed to update status", ToastAndroid.SHORT);
      setModalVisible(false);
    }
  };



  return (
    <>
      <ScrollView
        className="flex-1 bg-white"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PRIMARY_COLOR} />
        }
      >
        {/* Back button */}
        <View className="absolute left-2 top-2 z-50">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text
          style={{ fontFamily: 'Raleway-Bold', fontSize: 24, marginBottom: 12, marginTop: 24 }}
          className="text-center"
        >
          Moments
        </Text>

        {/* Search input */}
        <TextInput
          placeholder="Search users..."
          placeholderTextColor={'gray'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ fontFamily: 'Raleway-Regular' }}
          className="border border-gray-300 rounded-xl px-4 py-3 mb-6 mx-4"
        />

        {/* Users horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          className=""
        >
          {filteredUsers.map((user) => (
            <MomentCard key={user.id} orderData={user} />
          ))}
        </ScrollView>

        {/* Status Tabs - horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4 px-4"
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {['All', 'Pending', 'Preparing', 'Ready'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              className={`px-6 py-1 mr-3 rounded-full border ${activeTab === tab
                ? 'border-purple-600 bg-purple-100'
                : 'border-gray-300 bg-white'
                }`}
            >
              <Text
                style={{
                  fontFamily: activeTab === tab ? 'Raleway-Bold' : 'Raleway-Regular',
                  color: activeTab === tab ? PRIMARY_COLOR : '#6B7280',
                  fontSize: 12,
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Orders list: Basic card view */}
        <View className="px-4 pb-16">
          {filteredOrders.length === 0 ? (
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-center text-gray-500 mt-4">
              No orders found.
            </Text>
          ) : (
            filteredOrders.map((order) => (
              <TouchableOpacity
                key={order.order_id}
                onPress={() => openUpdateModal(order)}
                activeOpacity={0.8}
                className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm"
                style={{
                  elevation: 2,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                }}
              >
                <View className="flex-row justify-between items-center mb-1">
                  <Text
                    style={{ fontFamily: 'Raleway-Bold' }}
                    className="text-md text-gray-900"
                    numberOfLines={1}
                  >
                    {order.name}
                  </Text>
                  <View
                    style={{
                      backgroundColor: STATUS_COLORS[order.status || 'Pending'] || '#999',
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                      borderRadius: 20,
                      minWidth: 90,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{ fontFamily: 'Raleway-Bold', color: 'white', fontSize: 10 }}
                    >
                      {order.status}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity className="flex-row items-center space-x-3">
                  <Feather name="clock" size={16} color="#6B7280" />
                  <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-600 text-sm">
                    Arrived at: {order.arrived_at}
                  </Text>
                </TouchableOpacity>

                <View className='flex-row pb-2 items-center justify-between'>
                  <View className="flex-row items-center space-x-3 mt-2">
                    <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-700 text-sm">
                      Order #{order.order_id}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-600 text-sm">
                  Total: ₹{order.charges_summary.total_amount}
                </Text>


                {order.phone ? (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${order.phone}`)}
                    className="flex-row items-center mb-3 space-x-4 absolute right-4  bottom-2  bg-green-500 w-14 h-12 p-3 rounded-xl "
                  >
                    <Feather name="phone" size={16} color="#fff" className='m-auto' />
                  </TouchableOpacity>
                ) : null}

              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Fullscreen Modal: Full order details + status update */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'white', padding: 20 }}>
          {/* Modal Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontFamily: 'Raleway-Bold', fontSize: 14, color: '#111' }}>
              Order Details
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 4 }}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {!selectedOrder ? (
            <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12, color: '#444' }}>
              Loading...
            </Text>
          ) : (
            <ScrollView>
              {/* Customer & order info */}
              <Text
                style={{ fontFamily: 'Raleway-Bold', fontSize: 12, marginBottom: 8 }}
              >
                {selectedOrder.name}
              </Text>

              <View style={{ flexDirection: 'row', marginBottom: 10, flexWrap: 'wrap' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15, marginBottom: 6 }}>
                  <Feather name="clock" size={16} color="#666" />
                  <Text style={{ fontFamily: 'Raleway-Regular', marginLeft: 6, color: '#444', fontSize: 12 }}>
                    Arrived: {selectedOrder.arrived_at}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15, marginBottom: 6 }}>
                  <Feather name="phone" size={16} color="#666" />
                  <Text style={{ fontFamily: 'Raleway-Regular', marginLeft: 6, color: '#444', fontSize: 12 }}>
                    {selectedOrder.phone}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15, marginBottom: 6 }}>
                  <Ionicons name="pricetag-outline" size={16} color="#666" />
                  <Text style={{ fontFamily: 'Raleway-Regular', marginLeft: 6, color: '#444', fontSize: 12 }}>
                    Order #{selectedOrder.order_id}
                  </Text>
                </View>
              </View>

              {/* Status badge */}
              <View
                style={{
                  backgroundColor:
                    STATUS_COLORS[selectedOrder.status || 'Pending'] || '#999',
                  alignSelf: 'flex-start',
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 25,
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{ fontFamily: 'Raleway-Bold', color: 'white', fontSize: 12 }}
                >
                  {selectedOrder.status}
                </Text>
              </View>

              {/* Items */}
              <Text
                style={{ fontFamily: 'Raleway-Bold', fontSize: 14, marginBottom: 12 }}
              >
                Items
              </Text>
              {selectedOrder.items.map((item) => (
                <View
                  key={item.id}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    borderBottomWidth: 0.5,
                    borderBottomColor: '#ddd',
                    paddingBottom: 8,
                  }}
                >
                  <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12 }}>
                    {item.name} x {item.quantity}
                  </Text>
                  <Text
                    style={{ fontFamily: 'Raleway-Bold', fontSize: 12 }}
                  >
                    ${item.sub_total.toFixed(2)}
                  </Text>
                </View>
              ))}

              {/* Charges summary */}
              <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 10 }}>
                <Text
                  style={{ fontFamily: 'Raleway-Bold', fontSize: 14, marginBottom: 8 }}
                >
                  Charges Summary
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12 }}>
                    Subtotal
                  </Text>
                  <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12 }}>
                    ${selectedOrder.charges_summary.subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12 }}>
                    Item Tax
                  </Text>
                  <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12 }}>
                    ${selectedOrder.charges_summary.item_tax.toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12 }}>
                    Service Tax
                  </Text>
                  <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12 }}>
                    ${selectedOrder.charges_summary.service_tax.toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12 }}>
                    Discount
                  </Text>
                  <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12 }}>
                    ${parseFloat(selectedOrder.charges_summary.discount).toFixed(2)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderTopColor: '#ccc', paddingTop: 6 }}>
                  <Text style={{ fontFamily: 'Raleway-Bold', fontSize: 12 }}>
                    Total Amount
                  </Text>
                  <Text style={{ fontFamily: 'Raleway-Bold', fontSize: 12 }}>
                    ${parseFloat(selectedOrder.charges_summary.total_amount).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Update Status */}
              <View style={{ marginTop: 30 }}>
                <Text
                  style={{ fontFamily: 'Raleway-Bold', fontSize: 14, marginBottom: 12 }}
                >
                  Update Status
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                  {(['Pending', 'Preparing', 'Ready'] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setNewStatus(status)}
                      style={{
                        paddingVertical: 5,
                        paddingHorizontal: 20,
                        borderRadius: 20,
                        borderWidth: 1,
                        borderColor: newStatus === status ? PRIMARY_COLOR : '#ccc',
                        backgroundColor: newStatus === status ? PRIMARY_COLOR : '#fff',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: newStatus === status ? 'Raleway-Bold' : 'Raleway-Regular',
                          color: newStatus === status ? '#fff' : '#555',
                          fontSize: 12,
                        }}
                      >
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput
                  multiline
                  placeholder="Add a message (optional)"
                  value={statusMessage}
                  onChangeText={setStatusMessage}
                  style={{
                    fontFamily: 'Raleway-Regular',
                    borderColor: '#ccc',
                    borderWidth: 1,
                    borderRadius: 12,
                    padding: 12,
                    height: 80,
                    textAlignVertical: 'top',
                    marginBottom: 20,
                    fontSize: 12,
                  }}
                />

                <Pressable
                  onPress={() => submitStatusUpdate(selectedOrder.order_id, newStatus)}
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    paddingVertical: 15,
                    borderRadius: 15,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{ fontFamily: 'Raleway-Bold', color: 'white', fontSize: 12 }}
                  >
                    Submit Update
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
};

export default CustomerScreen;