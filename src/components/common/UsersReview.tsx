import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ToastAndroid,
  ActivityIndicator,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch, IMAGE_URL, Post } from '../../utils/apiUtils';
import { useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';

const UsersReview = ({ shopId, average_rating }: any) => {
  const isFocused = useIsFocused();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const { status: userStatus, data: user }: any = useSelector((state: any) => state.user);
  const [modalVisible, setModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(
    async (pageNum: number, reset = false) => {
      try {
        if (pageNum === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        const response: any = await Fetch(
          `/user/shop-reviews?shop_id=${shopId}&per_page=2&page=${pageNum}`,
          {},
          5000
        );

        if (!response.success) throw new Error('Failed to fetch reviews');

        const { reviews: newReviews, pagination } = response;

        setReviews((prev) => (reset ? newReviews : [...prev, ...newReviews]));
        setLastPage(pagination.last_page);
        setPage(pageNum);
      } catch (error: any) {
        console.error('fetchReviews error:', error.message);
        ToastAndroid.show(error?.message || 'Failed to load reviews.', ToastAndroid.SHORT);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [shopId]
  );

  useEffect(() => {
    if (isFocused) {
      setPage(1);
      fetchReviews(1, true); // Reset reviews on focus
    }
  }, [isFocused, fetchReviews]);

  const handleLoadMore = () => {
    if (page < lastPage && !isLoading && !isLoadingMore) {
      fetchReviews(page + 1);
    }
  };

  const handleSubmitReview = async () => {
    if (rating < 1 || rating > 5) {
      ToastAndroid.show('Please select a rating between 1 and 5.', ToastAndroid.SHORT);
      return;
    }
    if (!comment.trim()) {
      ToastAndroid.show('Please enter a comment.', ToastAndroid.SHORT);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        reviewable_type: 'Shop',
        reviewable_id: shopId,
        rating: rating,
        comment: comment,
        status: '1',
      };

      const response: any = await Post('/user/reviews', payload, 5000);

      if (response.success) {
        ToastAndroid.show('Review submitted successfully!', ToastAndroid.SHORT);
        setModalVisible(false);
        setRating(0);
        setComment('');
        fetchReviews(1, true); // Refresh reviews
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error: any) {
      console.error('submitReview error:', error.message);
      ToastAndroid.show(error?.message || 'Failed to submit review.', ToastAndroid.SHORT);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderReviewCard = ({ item }: { item: any }) => (
    <View key={item?.id} className="border-gray-200 border p-4 rounded-xl mb-4 shadow-sm">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-start">
          <Image
            source={item?.user?.profile ? { uri: IMAGE_URL + item?.user?.profile } : ImagePath?.profile1}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="text-sm font-semibold text-gray-800">{item?.user?.name}</Text>
            <Text className="text-xs text-gray-500">
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center px-2 py-1 rounded-md">
          {Array(Math.round(item?.rating || 0))
            .fill(0)
            .map((_, index) => (
              <AntDesign key={index} name="star" color="#FBBF24" size={16} />
            ))}
          <Text className="ml-1 text-sm text-gray-800">{item?.rating}</Text>
        </View>
      </View>
      <Text className="text-sm text-gray-700">{item?.comment}</Text>
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  return (
    <View className="mt-5 min-h-[83vh]">
      {/* Title and Rating */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-lg font-semibold text-gray-700">
          {user?.shop?.restaurant_name || 'Burger One (Cafe & Bakery)'}
        </Text>
        <View className="flex-row items-center px-2 py-1 rounded-md">
          {Array(Math.round(average_rating || 0))
            .fill(0)
            .map((_, index) => (
              <AntDesign key={index} name="star" color="#FBBF24" size={16} />
            ))}
          <Text className="ml-1 text-base text-gray-800 font-medium">
            {average_rating || 0}
          </Text>
        </View>
      </View>
      {/* SubTitle, Button, and Total Count */}
      <View className="flex-row justify-between items-center ">
        <Text className="text-xl text-gray-900 font-semibold font-poppins">Reviews</Text>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-primary-80 px-4 py-2 rounded-md"
        >
          <Text className="text-white font-medium">Add Review</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-sm text-gray-600 mb-4">{reviews.length} Reviews</Text>
      {/* Review List */}
      {isLoading && page === 1 ? (
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
      {/* Review Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-lg w-11/12 max-w-md">
            <Text className="text-xl font-semibold mb-4">Write a Review</Text>
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">Rating</Text>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)}>
                    <AntDesign
                      name={star <= rating ? 'star' : 'staro'}
                      color="#FBBF24"
                      size={24}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="mb-4">
              <Text className="text-sm font-medium mb-2">Comment</Text>
              <TextInput
                className="border border-gray-300 rounded-md p-2 h-24"
                placeholder="Enter your comment"
                value={comment}
                onChangeText={setComment}
                style={{ textAlignVertical: 'top' }}
                multiline
              />
            </View>
            <View className="flex-row justify-end">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="px-4 py-2 mr-2"
              >
                <Text className="text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitReview}
                disabled={isSubmitting}
                className={`px-4 py-2 rounded-md ${isSubmitting ? 'bg-gray-400' : 'bg-blue-500'}`}
              >
                <Text className="text-white">Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UsersReview;