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
import { Delete, Fetch, IMAGE_URL } from '../../utils/apiUtils';

interface Post {
  id: string;
  title: string;
  image: string;
  status: string;
  views: number;
  comments: number;
  created_at: string;
  description?: string;
}

const SkeletonLoader = () => (
  <View className="mb-4 w-full rounded-2xl overflow-hidden shadow-md bg-white">
    <View className="h-48 w-full bg-gray-200 animate-pulse" />
    <View className="p-3">
      <View className="h-5 w-3/4 bg-gray-200 rounded mb-2 animate-pulse" />
      <View className="flex-row justify-between">
        <View className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
        <View className="h-4 w-1/4 bg-gray-200 rounded animate-pulse" />
      </View>
    </View>
  </View>
);

const UsersPost = ({ vendor_id }: any) => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
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

  const fetchPosts = useCallback(
    async (pageNum: number, reset = false) => {
      if (!vendor_id) return;

      try {
        if (pageNum === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        const response: any = await Fetch(
          `/user/shop-posts?vendor_id=${vendor_id}&per_page=5&page=${pageNum}`,
          {},
          5000
        );

        if (!response.success) throw new Error(response.message);

        const { posts: newPosts, pagination } = response;

        setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
        setLastPage(pagination.last_page);
        setPage(pageNum);
      } catch (error: any) {
        ToastAndroid.show(error?.message || 'Failed to load posts.', ToastAndroid.SHORT);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [vendor_id]
  );

  const deletePost = async () => {
    if (!selectedPostId) return;

    try {
      setDeletingPostId(selectedPostId);
      const response: any = await Delete(`/user/posts/${selectedPostId}`, {}, undefined, 5000);
      if (!response.success) throw new Error(response.message);
      setPosts((prev) => prev.filter((p) => p.id !== selectedPostId));
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
    setPage(1);
    fetchPosts(1, true);
  }, [fetchPosts]);

  const handleLoadMore = useCallback(() => {
    if (page < lastPage && !isLoading && !isLoadingMore) {
      fetchPosts(page + 1);
    }
  }, [page, lastPage, isLoading, isLoadingMore, fetchPosts]);

  useEffect(() => {
    if (isFocused && vendor_id) {
      setPage(1);
      fetchPosts(1, true);
    }
  }, [isFocused, vendor_id, fetchPosts]);

  const renderPost = ({ item }: { item: Post }) => (
    <View className="mb-4 rounded-2xl overflow-hidden shadow-md bg-white relative">
      <TouchableOpacity
        onPress={() => navigation.navigate('PostDetailScreen', { postId: item.id })}
        activeOpacity={0.8}
      >
        <ImageBackground
          source={{ uri: item.image ? IMAGE_URL + item.image : ImagePath.placeholder }}
          className="h-48 w-full justify-between p-3"
          imageStyle={{ borderRadius: 16 }}
        >
          <View className="absolute inset-0 bg-black/50 rounded-2xl" />
          <View className="flex-row justify-between items-center z-10">
            <View
              className={`${item?.status?.toUpperCase() === 'DRAFT' ? 'bg-red-500' : 'bg-green-600'
                } px-3 py-1 rounded-lg`}
            >
              <Text className="text-xs font-semibold text-white">
                {item?.status?.toUpperCase() || 'PUBLISHED'}
              </Text>
            </View>
            <TouchableOpacity className='hidden' onPress={() => setSelectedPostId((prev) => (prev === item.id ? null : item.id))}>
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
            <Text className="text-sm">
              <Icon name="edit" color="#000" /> Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setConfirmDeleteVisible(true)} className="px-3 py-2">
            <Text className="text-sm text-red-600">
              <Icon name="trash" color="red" /> Delete
            </Text>
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
              <TouchableOpacity onPress={deletePost} disabled={!!deletingPostId}>
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

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View className="py-4">
          <ActivityIndicator size="large" color="#999" />
        </View>
      );
    }
    if (page < lastPage) {
      return (
        <View className="pb-20">
          <TouchableOpacity
            onPress={handleLoadMore}
            className="bg-primary-90 py-3 px-4 rounded-lg my-4 mx-4"
          >
            <Text className="text-white text-center text-md font-medium">Load More</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [isLoadingMore, page, lastPage, handleLoadMore]);

  return (
    <View className="max-h-[85vh] bg-gray-50">
      {isLoading && posts.length === 0 ? (
        <View className="h-full justify-center items-center">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
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
          initialNumToRender={5}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

export default UsersPost;