import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ImageBackground,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';

interface Post {
  id: string;
  title: string;
  image: string;
  badge: string;
  views: number;
  comments: number;
  created_at: string;
  description?: string;
}

const Post = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const { data: user }: any = useSelector((state: any) => state.user);

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

  const fetchPosts = useCallback(async () => {
    if (!user?.shop?.id) return;

    try {
      setIsLoading(true);
      const response: any = await Fetch(`/user/posts?shopId=${user.shop.id}`, { method: 'GET' }, 5000);
      console.log(response)
      if (!response.success) throw new Error(response.message);
      setPosts(response.data);
    } catch (error: any) {
      ToastAndroid.show(error?.message || 'Failed to load posts.', ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.shop?.id]);

  const deletePost = async () => {
    if (!selectedPostId) return;

    try {
      setDeletingPostId(selectedPostId);
      const response: any = await Fetch(`/user/delete-post/${selectedPostId}`, { method: 'DELETE' });

      if (!response.success) throw new Error(response.message);
      setPosts(prev => prev.filter(p => p.id !== selectedPostId));
      ToastAndroid.show('Post deleted successfully', ToastAndroid.SHORT);
    } catch (error: any) {
      ToastAndroid.show(error?.message || 'Failed to delete post.', ToastAndroid.SHORT);
    } finally {
      setDeletingPostId(null);
      setSelectedPostId(null);
      setConfirmDeleteVisible(false);
    }
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (isFocused && user?.shop?.id) {
      fetchPosts();
    }
  }, [isFocused, fetchPosts]);

  const renderPost = ({ item }: { item: Post }) => (
    <View className="mb-4 rounded-2xl overflow-hidden shadow-md bg-white relative">
      <TouchableOpacity
        onPress={() => navigation.navigate('PostDetailScreen', { postId: item.id })}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={{ uri: IMAGE_URL + item.image }}
          className="h-48 w-full justify-between p-3"
          imageStyle={{ borderRadius: 16 }}
        >
          <View className="absolute inset-0 bg-black/50 rounded-2xl" />
          <View className="flex-row justify-between items-center z-10">
            <View className="bg-primary-80 px-3 py-1 rounded-md">
              <Text className="text-xs font-semibold text-white">
                {item.badge || "Tag"}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedPostId(prev => prev === item.id ? null : item.id)}>
              <Icon name="dots-three-vertical" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View className="z-10">
            <Text className="text-white font-bold text-lg mb-1">{item.title}</Text>
            <View className="flex-row justify-between items-center">
              <View className="flex-row gap-4">
                <Text className="text-white text-xs">{item.views || 0} Views</Text>
                <Text className="text-white text-xs">{item.comments || 0} Comments</Text>
              </View>
              <Text className="text-white text-xs font-bold opacity-80">
                {formatDate(item.created_at)}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>

      {selectedPostId === item.id && (
        <View className="absolute top-10 right-4 z-20 bg-white rounded-md shadow-lg p-2">
          <TouchableOpacity
            onPress={() => {
              setSelectedPostId(null);
              navigation.navigate('PostScreen', { postDetails: item });
            }}
            className="px-3 py-2"
          >
            <Text className="text-sm"><Icon name='edit' color={""} /> Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setConfirmDeleteVisible(true)}
            className="px-3 py-2"
          >
            <Text className="text-sm text-red-600"><Icon name='trash' color={'red'} /> Delete</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Confirmation Modal */}
      <Modal
        transparent
        visible={confirmDeleteVisible}
        animationType="fade"
        onRequestClose={() => setConfirmDeleteVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-[80%]">
            <Text className="text-lg font-bold mb-4">Confirm Delete</Text>
            <Text className="mb-6">Are you sure you want to delete this post?</Text>
            <View className="flex-row justify-end gap-4">
              <TouchableOpacity onPress={() => setConfirmDeleteVisible(false)}>
                <Text className="text-base">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={deletePost}
                disabled={!!deletingPostId}
              >
                {deletingPostId ? (
                  <ActivityIndicator size="small" color="#FF0000" />
                ) : (
                  <Text className="text-base text-red-600 font-bold">Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  return (
    <View className="max-h-[85vh] bg-gray-50">
      <TouchableOpacity
        onPress={() => navigation.navigate("PostScreen")}
        className="bg-primary-100 py-3 rounded-xl my-4 items-center"
      >
        <Text className="text-white font-semibold text-base">Add Post</Text>
      </TouchableOpacity>

      {isLoading && posts.length === 0 ? (
        <View className="h-full justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : posts.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">No posts found</Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item: Post) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      )}
    </View>
  );
};

export default Post;
