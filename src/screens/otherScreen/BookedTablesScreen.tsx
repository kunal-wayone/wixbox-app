import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    ToastAndroid,
    Modal,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Fetch, Post } from '../../utils/apiUtils';

const LIMIT = 5;

const BookedTablesScreen = () => {
    const navigation = useNavigation<any>();
    const [bookings, setBookings] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [isEndReached, setIsEndReached] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [cancelReason, setCancelReason] = useState('');

    const fetchBookings = async (pageNumber = 1, refresh = false) => {
        try {
            if (refresh) setRefreshing(true);
            else if (pageNumber === 1) setLoading(true);
            else setIsLoadingMore(true);

            const res: any = await Fetch(`/user/get-table?page=${pageNumber}&limit=${LIMIT}`);
            if (res.success) {
                const newData = res.data || [];
                if (pageNumber === 1) {
                    setBookings(newData);
                } else {
                    setBookings(prev => [...prev, ...newData]);
                }
                setIsEndReached(newData.length < LIMIT);
            }
        } catch (err) {
            ToastAndroid.show('Failed to fetch bookings', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchBookings(1);
    }, []);

    const loadMore = () => {
        if (!isLoadingMore && !isEndReached) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchBookings(nextPage);
        }
    };

    const handleRefresh = () => {
        setPage(1);
        fetchBookings(1, true);
    };

    const handleCancelBooking = async () => {
        if (!cancelReason.trim()) {
            ToastAndroid.show('Please enter a reason', ToastAndroid.SHORT);
            return;
        }

        try {
            const payload = {
                booking_id: selectedBooking.id,
                reason: cancelReason,
            };
            const res: any = await Post('/user/cancel-table', payload);
            if (res.success) {
                ToastAndroid.show('Booking cancelled successfully!', ToastAndroid.SHORT);
                setCancelModalVisible(false);
                setCancelReason('');
                handleRefresh();
            }
        } catch (err) {
            ToastAndroid.show('Failed to cancel booking', ToastAndroid.SHORT);
        }
    };

    const renderBooking = ({ item }: any) => (
        <View className="bg-primary-10 m-4 p-4 rounded-xl shadow-sm">
            <Text className="font-bold text-lg">{item.name}</Text>
            <Text className="text-gray-600 mb-1 mt-1 flex-row gap-1">
                <Ionicons name="calendar-sharp" size={16} color="#B68AD4" /> {item.booking_date}{'  '}
                <Ionicons name="time-sharp" size={16} color="#B68AD4" /> {item.time_slot}{'  '}
                <Ionicons name="people-sharp" size={16} color="#B68AD4" /> {item.guests} Guests
            </Text>

            <Text>
                Status:{' '}
                <Text className={item.status === 'pending' ? 'text-yellow-500' : 'text-green-500'}>
                    {item.status}
                </Text>
            </Text>

            {item.table_info.map((table: any, i: number) => (
                <View key={i} className="mt-2">
                    <Text>Floor: {table.floor}</Text>
                    <Text>Table: {table.table_number} ({table.type})</Text>
                    <Text>Price: ₹{table.price}</Text>
                </View>
            ))}

            <View className="flex-row space-x-3 mt-4 hidden ">
                <TouchableOpacity
                    className="flex-1 bg-red-500 py-2 rounded-md"
                    onPress={() => {
                        setSelectedBooking(item);
                        setCancelModalVisible(true);
                    }}
                >
                    <Text className="text-white text-center font-medium">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-1 bg-green-600 py-2 rounded-md"
                    onPress={() => ToastAndroid.show('Booking Confirmed!', ToastAndroid.SHORT)}
                >
                    <Text className="text-white text-center font-medium">Confirm</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-100 pt-4">
            {/* Header */}
            <View className="flex-row items-center mb-4 px-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="pr-2 absolute left-4 z-10">
                    <Ionicons name="arrow-back" size={24} color="#111827" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 text-center flex-1">My Bookings</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#6366f1" />
            ) : (
                <FlatList
                    data={bookings}
                    keyExtractor={(item: any) => item.id.toString()}
                    renderItem={renderBooking}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#6366f1']} />
                    }
                    ListFooterComponent={
                        isLoadingMore ? <ActivityIndicator size="small" className="my-4" /> : null
                    }
                />
            )}

            {/* Cancel Modal */}
            <Modal
                visible={cancelModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setCancelModalVisible(false)}
            >
                <View className="flex-1 bg-black/40 justify-center items-center">
                    <View className="bg-white rounded-xl w-11/12 p-4">
                        <Text className="text-lg font-bold mb-2">Cancel Booking</Text>
                        <Text className="text-gray-600 mb-2">Please enter a reason:</Text>
                        <TextInput
                            multiline
                            numberOfLines={4}
                            placeholder="Write your reason..."
                            className="border border-gray-300 rounded-md p-2 text-gray-800 text-sm mb-4"
                            value={cancelReason}
                            onChangeText={setCancelReason}
                        />
                        <View className="flex-row justify-between space-x-3">
                            <TouchableOpacity
                                onPress={() => setCancelModalVisible(false)}
                                className="flex-1 bg-gray-400 py-2 rounded-md"
                            >
                                <Text className="text-white text-center font-medium">Close</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCancelBooking}
                                className="flex-1 bg-red-500 py-2 rounded-md"
                            >
                                <Text className="text-white text-center font-medium">Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default BookedTablesScreen;
