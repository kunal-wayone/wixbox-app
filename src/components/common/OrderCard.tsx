import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  ToastAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { IMAGE_URL, Post } from '../../utils/apiUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const statusSteps = [
  { icon: 'analytics-outline', label: 'Pending' },
  { icon: 'hourglass-outline', label: 'Preparing' },
  { icon: 'gift', label: 'Ready for Pickup' },
];

const statusLabels: any = {
  '0': 'Pending',
  '1': 'Preparing',
  '2': 'Ready',
};

const OrderStatusCard = ({ orderData }: any) => {
  const [showModal, setShowModal] = useState(false);
  const [statusValue, setStatusValue] = useState<string | null>(null);

  // Map incoming API response fields
  const id = orderData.order_id;
  const shop_id = orderData.shop_id;
  const vendor_id = orderData.vendor_id;
  const customerName = orderData.name;
  const email = orderData.email;
  const phone = orderData.phone;
  const arrived_at = orderData.arrived_at;
  const status = orderData.status?.toString() ?? '0';
  const created_at = orderData.created_at;

  const items = Array.isArray(orderData.items) ? orderData.items : [];

  const {
    subtotal = 0,
    item_tax = 0,
    service_tax = 0,
    discount = '0.00',
    total_amount = '0.00',
  } = orderData.charges_summary || {};

  const discountAmount = parseFloat(discount);
  const totalAmount = parseFloat(total_amount);
  const serviceTaxAmount = parseFloat(String(service_tax));
  const finalTotal = totalAmount + serviceTaxAmount;

  const [active, setActive] = useState(parseInt(status) || 0);

  const user: any | null = useSelector((state: RootState) => state.user.data);

  const updateStatus = async (order_id: number, newStatus: string | null) => {
    if (!newStatus) return;
    try {
      const payload = { order_id, status: newStatus };
      const response: any = await Post('/user/vendor/update-order-status', payload, 5000);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to update status');
      }
      setActive(parseInt(response.data.status));
    } catch (error) {
      ToastAndroid.show('Failed to update status', ToastAndroid.SHORT);
    }
  };

  return (
    <>
      {/* Compact Card */}
      <View className="bg-white rounded-2xl p-4 my-2 border border-gray-300 shadow-md">
        <Text
          style={{ fontFamily: 'Raleway-Bold' }}
          numberOfLines={1}
          ellipsizeMode="tail"
          className="text-lg text-gray-900"
        >
          #{id} - {customerName}
        </Text>
        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600 mt-1">
          Arrives by{' '}
          <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-black">
            {arrived_at}
          </Text>
        </Text>

        {/* Progress Icons */}
        <View className="flex-row justify-between items-center mt-4 mb-2 px-4">
          {statusSteps.map((step, index) => (
            <View className="flex-col items-center justify-center w-1/3" key={index}>
              <Ionicons
                name={step.icon}
                size={24}
                color={
                  index <= active
                    ? '#ac94f4'
                    : index === active + 1
                    ? '#a1a1aa'
                    : '#e5e7eb'
                }
              />
              <Text
                style={{ fontFamily: 'Raleway-SemiBold' }}
                className={`text-[10px] ${
                  index <= active ? 'text-primary-100' : 'text-gray-800'
                } text-center`}
              >
                {step.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Progress Bar */}
        <View className="flex-row justify-between items-center mb-4 px-2">
          {statusSteps.slice(0, 3).map((_, index) => (
            <View
              key={index}
              className={`h-1 flex-1 mx-1 rounded-full ${
                index <= active ? 'bg-primary-100' : 'bg-gray-300'
              }`}
            />
          ))}
        </View>

        <View className="border-t border-gray-200 my-2" />

        {user?.role !== 'user' && (
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-1 mr-2">
              <Picker
                selectedValue={statusValue ?? status}
                onValueChange={(value: string) => setStatusValue(value)}
                style={{ color: '#374151' }}
                accessibilityLabel="Select Status"
                dropdownIconColor="gray"
              >
                <Picker.Item label="Select Status" value="" />
                {Object.entries(statusLabels).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity
              className="bg-primary-100 px-4 py-2 rounded-full"
              onPress={() => updateStatus(id, statusValue)}
            >
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white text-sm font-medium">
                Update Status
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          className="border border-primary-100 py-3 mt-1 rounded-full items-center"
          onPress={() => setShowModal(true)}
        >
          <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-primary-100 text-sm">
            Show Order Details
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal visible={showModal} animationType="slide">
        <ScrollView className="bg-white p-5">
          <View className="flex-row justify-between items-center mb-4">
            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-lg">
              Order #{id}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={26} color="#555" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-700 mb-3">
            Status: <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-yellow-600">
              {statusLabels[status] || 'Processing'}
            </Text>
          </Text>

          <View className="mb-5">
            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base mb-2">
              Items Ordered
            </Text>
            {items.map((item: any) => (
              <View key={item.id} className="flex-row mb-4 items-center">
                <Image
                  source={{ uri: `${IMAGE_URL}${item.image}` }}
                  className="w-16 h-16 rounded-md mr-3"
                />
                <View>
                  <Text style={{ fontFamily: 'Raleway-SemiBold' }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">
                    Qty: {item.quantity}
                  </Text>
                  <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">
                    Price: ₹{item.price}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View className="mb-5">
            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base mb-2">
              Billing Summary
            </Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-700">
              Subtotal: ₹{totalAmount.toFixed(2)}
            </Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-700">
              Discount: ₹{discountAmount.toFixed(2)}
            </Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-700">
              Tax: ₹{serviceTaxAmount.toFixed(2)}
            </Text>
            <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-base text-gray-900 mt-2">
              Total: ₹{finalTotal.toFixed(2)}
            </Text>
          </View>

          <View className="mb-5">
            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base mb-2">
              Customer Info
            </Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm">
              Name: {customerName}
            </Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm">
              Phone: {phone}
            </Text>
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm">
              Email: {email}
            </Text>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            className="bg-primary-100 py-3 rounded-full mb-10"
            onPress={() => setShowModal(false)}
          >
            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white text-center text-sm">
              Close
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </>
  );
};

export default OrderStatusCard;
