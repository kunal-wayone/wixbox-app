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
import { SafeAreaView } from 'react-native-safe-area-context';
import BookedTableCard from '../../components/common/BookedTableCard';

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

    const renderBooking = ({ item }: any, index: any) => (
        <View key={index} className='px-4'>
            <BookedTableCard bookingData={item} />
        </View>

    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View className="flex-1 bg-white pt-4">
                {/* Header */}
                <View className="flex-row items-center mb-4 px-4">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="pr-2 absolute left-4 z-10">
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </TouchableOpacity>
                    <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-xl text-gray-800 text-center flex-1">My Bookings</Text>
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
                <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')} className="p-3 rounded-xl w-11/12 m-auto mb-0   bg-primary-80  z-10">
                    <Text style={{ fontFamily: 'Raleway-SemiBold' }} className='text-center text-white '>
                        Go To Home
                    </Text>
                </TouchableOpacity>
                {/* Cancel Modal */}
                <Modal
                    visible={cancelModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setCancelModalVisible(false)}
                >
                    <View className="flex-1 bg-black/40 justify-center items-center">
                        <View className="bg-white rounded-xl w-11/12 p-4">
                            <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-lg font-bold mb-2">Cancel Booking</Text>
                            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-600 mb-2">Please enter a reason:</Text>
                            <TextInput style={{ fontFamily: 'Raleway-Regular' }}
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
                                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white text-center font-medium">Close</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleCancelBooking}
                                    className="flex-1 bg-red-500 py-2 rounded-md"
                                >
                                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white text-center font-medium">Submit</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

export default BookedTablesScreen;
