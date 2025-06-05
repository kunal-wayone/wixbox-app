import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import {ImagePath} from '../../constants/ImagePath';

const posts = [
  {
    id: '1',
    title: 'Spicy Paneer Wrap',
    image: ImagePath.item1,
    badge: 'Today Special',
    views: 120,
    comments: 18,
  },
  {
    id: '2',
    title: 'Cheesy Garlic Bread',
    image: ImagePath.item1,
    badge: 'Today Special',
    views: 95,
    comments: 10,
  },
];

const Post = () => {
  const renderPost = ({item}: {item: (typeof posts)[0]}) => (
    <View className="mb-4 rounded-2xl overflow-hidden shadow-md">
      <ImageBackground
        source={item.image}
        className="h-48 w-full justify-between p-3"
        imageStyle={{borderRadius: 16}}>
        {/* Overlay */}
        <View className="absolute inset-0 bg-black/50 rounded-2xl" />

        {/* Top Row */}
        <View className="flex-row justify-between items-center z-10">
          {/* Badge */}
          <View className="bg-primary-80 px-3 py-1 rounded-md">
            <Text className="text-xs font-semibold text-white">
              {item.badge}
            </Text>
          </View>

          {/* Dots Icon */}
          <TouchableOpacity>
            <Icon name="dots-three-vertical" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Bottom Content */}
        <View className="z-10">
          <Text className="text-white font-bold text-lg mb-1">
            {item.title}
          </Text>
          <View className="flex-row gap-4">
            <Text className="text-white text-xs">{item.views} Views</Text>
            <Text className="text-white text-xs">{item.comments} Comments</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <View className="mt-4 bg-gray-50 min-h-screen">
      {/* Add Post Button */}
      <TouchableOpacity className="bg-primary-100 py-3 rounded-xl mb-4 items-center">
        <Text className="text-white font-semibold text-base">Add Post</Text>
      </TouchableOpacity>

      {/* Posts */}
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Post;
