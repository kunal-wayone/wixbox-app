import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { IMAGE_URL, Post } from '../../utils/apiUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const statusSteps = [
    { icon: 'analytics-outline', label: 'Pending' },
    { icon: 'hourglass-outline', label: 'Preparing' },
    { icon: 'gift', label: 'Ready for Pickup' },
    // { icon: 'home-outline', label: 'Delivered' },
];
``
const statusLabels: any = {
    '0': 'pending',
    '1': 'preparing',
    '2': 'ready',
    // '3': 'refund',
};

const OrderStatusCard = ({ orderData }: any) => {
    const [showModal, setShowModal] = useState(false);
    const user: any | null = useSelector((state: RootState) => state.user.data);

    const updateStauts = async (order_id: any, status: any) => {
        const payload = {
            order_id,
            status
        }

        try {

            const response: any = await Post('/user/vendor/update-order-status', payload, 5000)
            if (!response?.success) {
                throw new Error(response?.message || "Faield to update status")
            }
        } catch (error) {
            console.log("Faeld to update status")
        }

    }

    const {
        id,
        name,
        phone,
        arrived_at,
        status,
        total_amount,
        discount,
        service_tax,
        order,
        vendor,
    } = orderData?.order;

    const {
        discount: totalDiscounted_price,
        item_tax,
        service_tax: totalService_tax,
        subtotal,
        total_amount: finalTotalAamount
    } = orderData?.charges_summary

    const activeStep = parseInt(status);

    return (
        <>
            {/* Compact Card */}
            <View className="bg-white rounded-2xl p-4 my-2 border border-gray-300 shadow-md">
                <Text style={{ fontFamily: 'Raleway-Bold' }} numberOfLines={1} ellipsizeMode='tail' className="text-lg text-gray-900">
                    {/* {statusLabels[status] || 'Processing'} */}
                    #{id} - {name}
                </Text>
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600 mt-1">
                    Arrives by <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-black">{arrived_at}</Text>
                </Text>

                {/* Progress Icons */}
                <View className="flex-row justify-between items-center mt-4 mb-2 px-4">
                    {statusSteps.map((step, index) => (
                        <View className='flex-col items-center justify-center w-1/3 ' key={index}>
                            <Ionicons
                                key={step.icon}
                                name={step.icon}
                                size={24}
                                color={
                                    index <= activeStep
                                        ? '#ac94f4' // pink
                                        : index === activeStep + 1
                                            ? '#a1a1aa' // gray-400
                                            : '#e5e7eb' // gray-200
                                }
                            />
                            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className={`text-[10px] ${index === activeStep ? 'text-primary-100' : 'text-gray-800'} text-center`}>
                                {step?.label}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Progress Bar */}
                <View className="flex-row justify-between items-center mb-4 px-2">
                    {statusSteps.slice(0, 3).map((_, index) => (
                        <View
                            key={index}
                            className={`h-1 flex-1 mx-1 rounded-full ${index === activeStep ? 'bg-primary-100' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </View>

                {/* Vendor Info */}
                {/* <Text style={{fontFamily:'Raleway-Regular'}} className="text-gray-700 text-sm mb-4">
                    {vendor.name} is preparing your order.
                </Text> */}

                <View className="border-t border-gray-200 my-2" />

                {/* Add More Items */}
                {user?.role !== "user" && <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-1 mr-2  ">
                        <Picker
                            selectedValue={''}
                            className='rounded-xl border-b-2 border-gray-300'
                            onValueChange={value => console.log('unit', value)}
                            style={{ color: '#374151' }}
                            accessibilityLabel="Select unit"
                            dropdownIconColor={'gray'}
                        >
                            <Picker.Item label="Select Status " value="" />
                            {Object.entries(statusLabels).map(([key, label]) => (
                                <Picker.Item key={key} label={label} value={key} />
                            ))}
                        </Picker>
                    </View>

                    <TouchableOpacity
                        className={`bg-primary-100 px-4 py-2 rounded-full ${true ? '' : 'hidden'
                            }`}
                        onPress={() => console.log('Update status to:', "selectedStatus")}
                    >
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white text-sm font-medium">Update Status</Text>
                    </TouchableOpacity>
                </View>}

                {/* Show Details Button */}
                <TouchableOpacity
                    className="border border-primary-100 py-3 mt-1 rounded-full items-center"
                    onPress={() => setShowModal(true)}
                >
                    <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-primary-100 text-sm">Show Order Details</Text>
                </TouchableOpacity>
            </View>

            {/* Modal */}
            <Modal visible={showModal} animationType="slide">
                <ScrollView className="bg-white p-5">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-lg">Order #{id}</Text>
                        <TouchableOpacity onPress={() => setShowModal(false)}>
                            <Ionicons name="close" size={26} color="#555" />
                        </TouchableOpacity>
                    </View>

                    {/* Order Status */}
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-700 mb-3">
                        Status:{' '}
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-yellow-600">
                            {statusLabels[status] || 'Processing'}
                        </Text>
                    </Text>

                    {/* Items */}
                    <View className="mb-5">
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base mb-2">Items Ordered</Text>
                        {order.map((item: any) => (
                            <View key={item.id} className="flex-row mb-4 items-center">
                                <Image
                                    source={{ uri: `${IMAGE_URL}${item.image}` }}
                                    className="w-16 h-16 rounded-md mr-3"
                                />
                                <View>
                                    <Text style={{ fontFamily: 'Raleway-SemiBold' }} numberOfLines={1} className="">{item.name}</Text>
                                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Qty: {item.quantity}</Text>
                                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Price: ₹{item.price}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Summary */}
                    <View className="mb-5">
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base mb-2">Billing Summary</Text>
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-700">Subtotal: ₹{finalTotalAamount}</Text>
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-700">Discount: ₹{totalDiscounted_price}</Text>
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-700">Tax: ₹{totalService_tax}</Text>
                        <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-base text-gray-900 mt-2">
                            Total: ₹{parseFloat(finalTotalAamount) + parseFloat(totalService_tax)}
                        </Text>
                    </View>

                    {/* Customer Info */}
                    <View className="mb-5">
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base mb-2">Customer Info</Text>
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm">Name: {name}</Text>
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm">Phone: {phone}</Text>
                    </View>

                    {/* Vendor Info */}
                    <View className="mb-10">
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-base mb-2">Vendor Info</Text>
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm">Name: {vendor.name}</Text>
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm">Email: {vendor.email}</Text>
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm">Status: {vendor.status === '1' ? 'Active' : 'Inactive'}</Text>
                    </View>

                    {/* Close Button */}
                    <TouchableOpacity
                        className="bg-primary-100 py-3 rounded-full mb-10"
                        onPress={() => setShowModal(false)}
                    >
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white text-center text-sm">Close</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Modal>
        </>
    );
};

export default OrderStatusCard;
