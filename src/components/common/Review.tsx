import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ToastAndroid, ActivityIndicator, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch } from '../../utils/apiUtils';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

const Review = () => {
  const isFocused = useIsFocused();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { status: userStatus, data: user }: any = useSelector((state: any) => state.user);

  const fetchReviews = useCallback(async (page: number = 1, append: boolean = false) => {
    const id = user?.shop.id;
    try {
      setIsLoading(!append);
      setIsLoadingMore(append);
      const response: any = await Fetch(`/user/shops/${id}/reviews?per_page=1&page=${page}`, {}, 5000);
      if (!response.success) throw new Error('Failed to fetch reviews');
      console.log(response.data);
      const { reviews, current_page, last_page } = response.data;
      setReviews((prev) => (append ? [...prev, ...reviews] : reviews));
      setCurrentPage(current_page);
      setLastPage(last_page);
    } catch (error: any) {
      console.error('fetchReviews error:', error.message);
      ToastAndroid.show(
        error?.message || 'Failed to load reviews.',
        ToastAndroid.SHORT
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [user?.shop.id]);

  const loadMoreReviews = useCallback(() => {
    if (currentPage < lastPage && !isLoadingMore) {
      fetchReviews(currentPage + 1, true);
    }
  }, [currentPage, lastPage, isLoadingMore, fetchReviews]);

  useEffect(() => {
    if (isFocused && user?.shop.id) {
      fetchReviews(1);
    }
  }, [isFocused, user?.shop.id, fetchReviews]);

  const renderReviewCard = ({ item }: { item: any }) => (
    <View key={item?.id} className="border-gray-200 border p-4 rounded-xl mb-4 shadow-sm">
      {/* Top Section */}
      <View className="flex-row justify-between items-start mb-2">
        {/* Left: Avatar + Name + Time */}
        <View className="flex-row items-start">
          <Image
            source={item?.user?.avatar || ImagePath?.profile1}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="text-base font-semibold text-gray-800">
              {item?.user?.name || 'Anonymous'}
            </Text>
            <Text className="text-xs text-gray-500">{item?.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</Text>
          </View>
        </View>

        {/* Right: Rating */}
        <View className="flex-row items-center px-2 py-1 rounded-md">
          {Array(Math.round(item?.rating || 0))
            .fill(0)
            .map((_, index) => (
              <AntDesign key={index} name="star" color="#FBBF24" size={16} />
            ))}
          <Text className="ml-1 text-sm text-gray-800">{item?.rating || 0}</Text>
        </View>
      </View>

      {/* Bottom: Review Description */}
      <Text className="text-sm text-gray-700">{item?.comment || 'No comment provided'}</Text>
    </View>
  );

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View className="py-4">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }
    if (currentPage < lastPage) {
      return (
        <TouchableOpacity
          onPress={loadMoreReviews}
          className="bg-primary-90 py-3 px-4 rounded-lg my-4 mx-4"
        >
          <Text className="text-white text-center text-md font-medium">Load More</Text>
        </TouchableOpacity>
      );
    }
    return null;
  }, [isLoadingMore, currentPage, lastPage, loadMoreReviews]);

  return (
    <View className="mt-5 min-h-[83vh]">
      {/* Title and Rating */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-700" numberOfLines={1} ellipsizeMode="tail">
          {user?.shop?.restaurant_name || "Burger One (Cafe & Bakery)"}
        </Text>
        <View className="flex-row items-center px-2 py-1 rounded-md">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <AntDesign key={index} name="star" color="#FBBF24" size={16} />
          ))}
          <Text className="ml-1 text-base text-gray-800 font-medium">
            {user?.shop?.average_rating || 0}
          </Text>
        </View>
      </View>
      {/* SubTitle and Total Count */}
      <Text className="text-xl text-gray-900 font-semibold font-poppins mb-1">
        Reviews
      </Text>
      <Text className="text-sm text-gray-600 mb-4">
        {reviews?.length || 0} Reviews
      </Text>
      {/* Review List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center mt-10">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : reviews?.length === 0 ? (
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-gray-500 text-lg mb-auto">No reviews found</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

export default Review;