import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Fetch, IMAGE_URL } from '../utils/apiUtils';
import { ImagePath } from '../constants/ImagePath';

// Default image URL
const DEFAULT_IMAGE = ImagePath.item1;

// Skeleton Card Component
const SkeletonCard = () => (
  <View className="items-center mx-2">
    <View className="w-28 h-24 bg-gray-200 rounded-xl mb-2 animate-pulse" />
    <View className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
  </View>
);

const CategorySection = () => {
  const navigation = useNavigation<any>();
  const PER_PAGE = 20;

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(
    async (pageNumber: number, isInitial = false) => {
      if ((loadMoreLoading && !isInitial) || (!hasMore && !isInitial)) return;

      if (isInitial) setInitialLoading(true);
      else setLoadMoreLoading(true);

      try {
        setError(null);
        const response: any = await Fetch(
          `/user/admin-category?per_page=${PER_PAGE}&page=${pageNumber}`,
          {},
          5000
        );

        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch categories');
        }

        // Map data to ensure blank images use DEFAULT_IMAGE
        const newCategories = response?.data.map((item: any) => ({
          ...item,
          image: item.image && item.image.trim() !== '' ? IMAGE_URL + item.image : DEFAULT_IMAGE,
        }));

        setData((prev) => (isInitial ? newCategories : [...prev, ...newCategories]));
        setHasMore(response.pagination.current_page < Math.ceil(response.pagination.total / response.pagination.per_page));
        setPage(response.pagination.current_page + 1);
      } catch (error: any) {
        setError(error.message || 'Failed to fetch categories');
        ToastAndroid.show(error.message || 'Failed to fetch categories', ToastAndroid.SHORT);
      } finally {
        if (isInitial) setInitialLoading(false);
        else setLoadMoreLoading(false);
      }
    },
    [loadMoreLoading, hasMore]
  );

  // Initial fetch
  useEffect(() => {
    fetchCategories(1, true);
  }, [fetchCategories]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await fetchCategories(1, true);
    setRefreshing(false);
  }, [fetchCategories]);

  // Handle image load error
  const handleImageError = (categoryId: number) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === categoryId ? { ...item, image: DEFAULT_IMAGE } : item
      )
    );
  };

  // Handle category press
  const handleCategoryPress = (category: any) => {
    console.log(category)
    navigation.navigate('MenuItemListScreen', { categoryId: category.id, categoryName: category.name });
  };

  // Render footer (loading more)
  const renderFooter = () => {
    if (loadMoreLoading) {
      return (
        <View className="flex-row justify-center py-4">
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
    return null;
  };

  // Main render
  if (initialLoading) {
    return (
      <View className="pt-6 mb-4">
        <View className="flex-row justify-between items-start mb-3 px-4">
          <View>
            <View className="w-32 h-5 bg-gray-200 rounded animate-pulse" />
            <View className="w-48 h-4 bg-gray-200 rounded mt-2 animate-pulse" />
          </View>
          <View className="flex-row items-center">
            <View className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-1">
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <SkeletonCard key={index} />
            ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="pt-2 mb-4">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3 ">
        <View>
          <Text className="text-lg font-semibold text-gray-900">🎉 Category</Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center mt-1"
          onPress={() => navigation.navigate('AllCategoriesScreen')}
        >
          <Text className="text-sm font-medium">View All</Text>
          <Icon name="chevron-forward-outline" size={16} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View className="px-4 py-2">
          <Text className="text-red-500 text-center">{error}</Text>
        </View>
      )}

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="pl-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onMomentumScrollEnd={() => {
          if (hasMore && !loadMoreLoading) {
            fetchCategories(page);
          }
        }}
      >
        {data.map((category: any) => (
          <TouchableOpacity
            key={category.id}
            className="items-center mx-2"
            onPress={() => handleCategoryPress(category)}
          >
            <Image
              source={{ uri: category?.image }}
              className="w-20 h-20 rounded-full mb-2"
              resizeMode="cover"
              onError={() => handleImageError(category?.id)}
            />
            <Text numberOfLines={1} ellipsizeMode='tail' className="text-sm text-center text-gray-700 max-w-[100px]">
              {category?.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Footer */}
      {renderFooter()}
    </View>
  );
};

export default CategorySection;