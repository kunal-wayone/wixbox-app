import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ToastAndroid, ActivityIndicator } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch } from '../../utils/apiUtils';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

const reviews = [
  {
    id: '1',
    name: 'Amit Sharma',
    avatar: ImagePath.profile1,
    timeAgo: '2 days ago',
    rating: 4.5,
    review:
      'The food was really good and the service was excellent. Definitely coming back!',
  },
  {
    id: '2',
    name: 'Priya Singh',
    avatar: ImagePath.profile1,
    timeAgo: '1 week ago',
    rating: 4.0,
    review: 'Nice experience. Good ambiance and staff was friendly.',
  },
];

const Review = () => {
  const averageRating = 4.3;
  const isFocused = useIsFocused();
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { status: userStatus, data: user }: any = useSelector(
    (state: any) => state.user,
  );

  const fetchReviews = useCallback(async () => {
    const id = user?.shop.id
    try {
      setIsLoading(true);
      const response: any = await Fetch(`/user/shops/${id}/reviews`, {}, 5000);
      if (!response.success) throw new Error('Failed to fetch posts');
      console.log(response.data)
      setReviews(response.data.reviews || []);
    } catch (error: any) {
      console.error('fetchProducts error:', error.message);
      ToastAndroid.show(
        error?.message || 'Failed to load reviews.',
        ToastAndroid.SHORT
      );
    } finally {
      setIsLoading(false);
    }
  }, []);


  useEffect(() => {
    if (isFocused) {
      fetchReviews();
    }
  }, [isFocused]);

  const renderReviewCard = ({ item }: { item: any }) => (
    <View key={item?.id} className="border-gray-200 border p-4 rounded-xl mb-4 shadow-sm">
      {/* Top Section */}
      <View className="flex-row justify-between items-start mb-2">
        {/* Left: Avatar + Name + Time */}
        <View className="flex-row items-start">
          <Image source={item?.avatar || ImagePath?.profile1} className="w-10 h-10 rounded-full mr-3" />
          <View>
            <Text className="text-sm font-semibold text-gray-800">
              {item?.user?.name}
            </Text>
            <Text className="text-xs text-gray-500">{item.timeAgo}</Text>
          </View>
        </View>

        {/* Right: Rating */}
        <View className="flex-row items-center px-2 py-1 rounded-md">
          {Array(Math.round(item?.rating || 0))
            .fill(0)
            .map((_, index) => (
              <AntDesign key={index} name="star" color="#FBBF24" size={16} />
            ))}
          <Text className="ml-1 text-sm text-gray-800">{item?.rating}</Text>
        </View>
      </View>

      {/* Bottom: Review Description */}
      <Text className="text-sm text-gray-700">{item?.comment}</Text>
    </View>
  );

  return (
    <View className="mt-5 min-h-[83vh]">
      {/* Title and Rating */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-700">
          {user?.shop?.restaurant_name || "Burger One (Cafe & Bakery)"}{' '}
        </Text>
        <View className="flex-row items-center px-2 py-1 rounded-md">
          {[1, 2, 3, 4, 5].map(() => (
            <AntDesign name="star" color="#FBBF24" size={16} />
          ))}
          <Text className="ml-1 text-base text-gray-800 font-medium">
            {averageRating}
          </Text>
        </View>
      </View>
      {/* SubTitle and Total Count */}
      <Text className="text-xl text-gray-900 font-semibold font-poppins mb-1">
        Reviews
      </Text>{' '}
      <Text className="text-sm text-gray-600 mb-4">
        {reviews.length} Reviews
      </Text>
      {/* Review List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center mt-10">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : reviews.length === 0 ? (
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
        />
      )}
    </View>
  );
};

export default Review;
