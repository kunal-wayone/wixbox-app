import React from 'react';
import {View, Text, Image, FlatList} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {ImagePath} from '../../constants/ImagePath';

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

  const renderReviewCard = ({item}: {item: (typeof reviews)[0]}) => (
    <View className="border-gray-200 border p-4 rounded-xl mb-4 shadow-sm">
      {/* Top Section */}
      <View className="flex-row justify-between items-start mb-2">
        {/* Left: Avatar + Name + Time */}
        <View className="flex-row items-start">
          <Image source={item.avatar} className="w-10 h-10 rounded-full mr-3" />
          <View>
            <Text className="text-sm font-semibold text-gray-800">
              {item.name}
            </Text>
            <Text className="text-xs text-gray-500">{item.timeAgo}</Text>
          </View>
        </View>

        {/* Right: Rating */}
        <View className="flex-row items-center px-2 py-1 rounded-md">
          {[1, 2, 3, 4, 5].map(() => (
            <AntDesign name="star" color="#FBBF24" size={16} />
          ))}
          <Text className="ml-1 text-sm text-gray-800">{item.rating}</Text>
        </View>
      </View>

      {/* Bottom: Review Description */}
      <Text className="text-sm text-gray-700">{item.review}</Text>
    </View>
  );

  return (
    <View className="mt-5 min-h-screen">
      {/* Title and Rating */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-700">
          Burger One (Cafe & Bakery){' '}
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
      <FlatList
        data={reviews}
        keyExtractor={item => item.id}
        renderItem={renderReviewCard}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Review;
