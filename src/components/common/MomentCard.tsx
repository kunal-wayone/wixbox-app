import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Image,
    ToastAndroid,
    StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Post, IMAGE_URL } from '../../utils/apiUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useNavigation } from '@react-navigation/native';

const statusLabels: any = {
    '0': 'Pending',
    '1': 'Preparing',
    '2': 'Ready',
};

const MomentCard = ({ orderData }: any) => {
    const navigation = useNavigation();
    const [showModal, setShowModal] = useState(false);
    const [active, setActive] = useState(parseInt(orderData?.order?.status) || 0);
    const user: any = useSelector((state: RootState) => state.user.data);
    console.log(orderData)
    const {
        id,
        order,
        customer,
        created_at
    } = orderData;

    const updateStatus = async (order_id: any, status: any) => {
        try {
            const response: any = await Post('/user/vendor/update-order-status', { order_id, status }, 5000);
            if (!response?.success) throw new Error(response?.message || "Failed to update status");
            setActive(parseInt(response?.data?.status));
            ToastAndroid.show("Status updated!", ToastAndroid.SHORT);
        } catch {
            ToastAndroid.show("Failed to update status", ToastAndroid.SHORT);
        }
    };

    const createdTime = new Date(created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });


    return (
        <>
            {/* Compact Card */}
            <TouchableOpacity
                onPress={() => navigation.navigate('AddOrderScreen', { user: orderData })}
                className="bg-white rounded-2xl p-4 my-2 border border-gray-300 shadow-sm mr-2"
            >
                <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                    #{order?.order_id} - {customer?.name}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                    Arrives At   <Text className="font-semibold text-black">{createdTime}</Text>
                </Text>

                {/* Show Details */}
                <TouchableOpacity
                    className="border border-primary-100 py-1.5 mt-2 rounded-full items-center"
                    onPress={() => setShowModal(true)}
                >
                    <Text className="text-primary-100 text-sm font-semibold">View Details</Text>
                </TouchableOpacity>
            </TouchableOpacity>

            {/* Modal */}
            <Modal visible={showModal} animationType="slide">
                <ScrollView style={styles.modalBg} contentContainerStyle={styles.modalContent}>
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-semibold">Order #{order?.order_id}</Text>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <Ionicons name="close" size={26} color="#555" />
                        </TouchableOpacity>
                    </View>

                    {/* Order Status */}
                    <Text className="text-sm text-gray-700 mb-4">
                        Status: <Text className="font-semibold text-yellow-600">{statusLabels[order?.status]}</Text>
                    </Text>

                    {/* Items Ordered */}
                    <Text className="text-base font-semibold mb-2">Items Ordered</Text>
                    {order?.items?.map((item: any) => (
                        <View key={item.id} className="flex-row mb-4 items-center">
                            <Image
                                source={{ uri: `${IMAGE_URL}${item.image}` }}
                                className="w-16 h-16 rounded-md mr-3"
                            />
                            <View>
                                <Text className="font-semibold text-sm">{item.name}</Text>
                                <Text className="text-sm text-gray-600">Qty: {item.quantity}</Text>
                                <Text className="text-sm text-gray-600">Price: ₹{item.price}</Text>
                            </View>
                        </View>
                    ))}

                    {/* Billing Summary */}
                    <View className="mb-5">
                        <Text className="text-base font-semibold mb-2">Billing Summary</Text>
                        <Text className="text-sm text-gray-700">Subtotal: ₹{order?.charges_summary?.subtotal}</Text>
                        <Text className="text-sm text-gray-700">Discount: ₹{order?.charges_summary?.discount}</Text>
                        <Text className="text-sm text-gray-700">Service Tax: ₹{order?.charges_summary?.service_tax}</Text>
                        <Text className="text-base font-bold text-gray-900 mt-2">
                            Total: ₹{order?.charges_summary?.total_amount}
                        </Text>
                    </View>

                    {/* Customer Info */}
                    <View className="mb-5">
                        <Text className="text-base font-semibold mb-2">Customer Info</Text>
                        <Text className="text-sm">Name: {customer?.name}</Text>
                        <Text className="text-sm">Email: {customer?.email}</Text>
                        <Text className="text-sm">Verified: {customer?.is_verified === '1' ? 'Yes' : 'No'}</Text>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity
                        className="bg-primary-100 py-3 rounded-full mb-10"
                        onPress={() => setShowModal(false)}
                    >
                        <Text className="text-white text-center text-sm font-semibold">Close</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Modal>
        </>
    );
};


const styles = StyleSheet.create({
    modalBg: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalContent: {
        padding: 20,
    },
});

export default MomentCard;
