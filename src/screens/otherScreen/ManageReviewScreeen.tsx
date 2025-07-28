import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    Image,
    FlatList,
    ToastAndroid,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch } from '../../utils/apiUtils';
import { useSelector } from 'react-redux';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReviewComment from '../../components/common/ReviewComment';

const ManageReviewScreen = () => {
    const naviagation = useNavigation<any>()
    const isFocused = useIsFocused();
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [totalReviews, setTotalReviews] = useState(0);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const { data: user }: any = useSelector((state: any) => state.user);

    const fetchReviews = useCallback(async (page: number = 1, append: boolean = false) => {
        const id = user?.shop?.id;
        try {
            setIsLoading(!append);
            setIsLoadingMore(append);
            const response: any = await Fetch(`/user/shops/${id}/reviews?per_page=5&page=${page}`, {}, 5000);
            if (!response.success) throw new Error('Failed to fetch reviews');

            const { data: reviewsData = [], pagination } = response.data;

            setReviews((prev) => (append ? [...prev, ...reviewsData] : reviewsData));
            setCurrentPage(pagination?.current_page || 1);
            setLastPage(pagination?.last_page || 1);
            setTotalReviews(pagination?.total || 0);
        } catch (error: any) {
            ToastAndroid.show(
                error?.message || 'Failed to load reviews.',
                ToastAndroid.SHORT
            );
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    }, [user?.shop?.id]);

    const loadMoreReviews = useCallback(() => {
        if (currentPage < lastPage && !isLoadingMore) {
            fetchReviews(currentPage + 1, true);
        }
    }, [currentPage, lastPage, isLoadingMore, fetchReviews]);

    useEffect(() => {
        if (isFocused && user?.shop?.id) {
            fetchReviews(1);
        }
    }, [isFocused, user?.shop?.id, fetchReviews]);

    const renderReviewCard = ({ item }: { item: any }) => (
        <View
            key={item?.id}
            style={{
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOpacity: 0.05,
                shadowOffset: { width: 0, height: 1 },
                shadowRadius: 3,
                elevation: 2,
            }}
        >
            {/* Header Row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={item?.user?.avatar ? { uri: item.user.avatar } : ImagePath.profile1}
                        style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                    />
                    <View>
                        <Text style={{  fontFamily: 'Raleway-Regular', fontSize: 15, color: '#333' }}>
                            {item?.user?.name || '👤 Anonymous'}
                        </Text>
                        <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12, color: '#777' }}>
                            🗓️ {item?.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}
                        </Text>
                    </View>
                </View>

                {/* Rating */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {Array(Math.round(item?.rating || 0))
                        .fill(0)
                        .map((_, index) => (
                            <AntDesign key={index} name="star" color="#FFD700" size={16} />
                        ))}
                    <Text style={{ fontFamily: 'Raleway-Regular', marginLeft: 4, color: '#444' }}>
                        {item?.rating || 0}
                    </Text>
                </View>
            </View>

            <ReviewComment comment={item?.comment} />
        </View>
    );

    const renderFooter = () => {
        if (isLoadingMore) {
            return (
                <View style={{ paddingVertical: 16 }}>
                    <ActivityIndicator size="large" color="#007AFF" />
                </View>
            );
        }

        if (currentPage < lastPage) {
            return (
                <TouchableOpacity
                    onPress={loadMoreReviews}
                    style={{
                        backgroundColor: '#4F46E5',
                        paddingVertical: 12,
                        borderRadius: 10,
                        marginHorizontal: 16,
                        marginTop: 16,
                    }}
                >
                    <Text style={{ color: '#fff', textAlign: 'center', fontFamily: 'Raleway-Regular', fontSize: 16 }}>
                        🔄 Load More Reviews
                    </Text>
                </TouchableOpacity>
            );
        }

        return null;
    };

    return (
        <SafeAreaView className='flex-1 bg-white'>
            {/* Header */}
            <TouchableOpacity className='p-4 absolute z-50 ' onPress={() => naviagation.goBack()}>
                <Icon name='arrowleft' size={20} className='text' />
            </TouchableOpacity>
            <Text className='text-center my-4' style={{ fontFamily: 'Raleway-Regular', fontSize: 18,  color: '#111827' }}>
                Manage Reviews
            </Text>
            <View style={{ flex: 1, paddingHorizontal: 16, backgroundColor: '#fff' }}>
                <View style={{ marginBottom: 12 }} className='flex-row items-center  justify-between w-11/12'>
                    <Text style={{ fontSize: 16, fontFamily: 'Raleway-Regular', color: '#1F2937' }} className='w-4/5' numberOfLines={1}>
                        {user?.shop?.restaurant_name || 'Your Shop'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        {[1].map((_, index) => (
                            <AntDesign key={index} name="star" color="#FBBF24" size={16} />
                        ))}
                        <View className='flex-row items-center gap-1'>
                            <Text style={{ fontSize: 16,  fontFamily: 'Raleway-Regular', color: '#374151' }}>
                                {user?.shop?.average_rating || 0}
                            </Text>
                            <Text style={{  fontFamily: 'Raleway-Regular',fontSize: 12, color: '#6B7280', }}>
                                ({totalReviews} review(s))
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Review Info */}
                <View className='flex-row items-center justify-between border-b-2 mb-4 border-gray-300 pb-2  '>
                    <Text style={{ fontSize: 18,  fontFamily: 'Raleway-Regular', color: '#111827' }}>
                        ✍️ Reviews
                    </Text>

                </View>

                {/* Review List */}
                {isLoading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#007AFF" />
                    </View>
                ) : reviews?.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{  fontFamily: 'Raleway-Regular',fontSize: 16, color: '#6B7280' }}>😕 No reviews found</Text>
                    </View>
                ) : (
                    <FlatList
                        data={reviews}
                        renderItem={renderReviewCard}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        ListFooterComponent={renderFooter}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default ManageReviewScreen;
