import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import Icon from 'react-native-vector-icons/Ionicons';

interface Post {
  id: string;
  title: string;
  image: string;
  badge: string;
  views: number;
  comments: number;
  created_at: string;
  content?: string;
}

const PostDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { postId } = route.params;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response: any = await Fetch(`/user/posts/${postId}`, undefined,5000);
      console.log(response)
      if (!response.success) throw new Error(response.message);
      setPost(response.data);
    } catch (error: any) {
      ToastAndroid.show(error?.message || 'Failed to load post', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchPost();
  }, [postId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!post) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Post not found</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Header with back button */}
      <View className="flex-row items-center px-4 py-3 mb-2  border-gray-200">
        <TouchableOpacity className='absolute left-5 top-5' onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-xl py-4 font-semibold text-center w-full ">Post Details</Text>
      </View>

      {/* Post image */}
      <Image
        source={{ uri: IMAGE_URL + post.image }}
        className="w-11/12 h-52 m-auto rounded-2xl "
        resizeMode="cover"
      />

      {/* Post Content */}
      <View className="p-4 space-y-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-xl font-bold text-gray-800">{post.title}</Text>
          <Text className="text-sm text-gray-500">{formatDate(post.created_at)}</Text>
        </View>

        {post.badge && (
          <Text className="text-sm text-white bg-primary-80 px-3 py-1 rounded-md self-start">
            {post.badge}
          </Text>
        )}

        <View className="flex-row gap-6 mb-3">
          <Text className="text-gray-600 text-sm"><Icon name='eye' /> {post.views} Views</Text>
          <Text className="text-gray-600 text-sm"><Icon name='chatbox-ellipses' /> {post.comments} Comments</Text>
        </View>

        {post.content ? (
          <View>
            <Text className="text-gray-700 leading-relaxed">{post.content}</Text>
          </View>
        ) : (
          <Text className="text-gray-400 italic">No description provided.</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default PostDetailScreen;
