import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ImageBackground,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../constants/ImagePath';
import { Fetch, IMAGE_URL } from '../utils/apiUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const PER_PAGE = 3;

// Skeleton Card
const SkeletonCard = () => (
  <View
    style={{ width: CARD_WIDTH }}
    className="mr-4 bg-white rounded-xl overflow-hidden shadow-md">
    <View className="h-72 bg-gray-300 animate-pulse" />
    <View className="p-3 absolute bottom-10">
      <View className="h-4 bg-gray-300 rounded w-1/2 mb-2" />
      <View className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
      <View className="h-px bg-gray-200 my-2" />
      <View className="flex-row justify-between items-center">
        <View className="h-4 w-24 bg-gray-200 rounded" />
        <View className="h-4 w-16 bg-gray-200 rounded" />
      </View>
    </View>
  </View>
);

const FreshStoreSection = () => {
  const [stores, setStores] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const fetchStores = async (pageNumber = 1, isInitial = false) => {
    if ((isLoadingMore && !isInitial) || (!hasMore && !isInitial)) return;

    if (isInitial) {
      setIsInitialLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response: any = await Fetch(
        `/user/recent-added-shop?limit=${PER_PAGE}&page=${pageNumber}`,
        {},
        5000
      );

      if (!response.success) throw new Error('Failed to fetch shops');

      const newShops = response?.data || [];

      setStores(prev => (isInitial ? newShops : [...prev, ...newShops]));
      setHasMore(newShops.length === PER_PAGE); // if less than limit, no more
      setPage(prev => prev + 1);
      setError(false);
    } catch (err) {
      setError(true);
      ToastAndroid.show('Failed to fetch shops', ToastAndroid.SHORT);
    } finally {
      if (isInitial) {
        setIsInitialLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchStores(1, true);
  }, []);

  return (
    <View className="pt-6">
      {/* Header */}
      <View className="mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          Fresh Added Store
        </Text>
        <Text className="text-sm text-gray-500">
          Check out the newest additions near you
        </Text>
      </View>

      {/* Scroll List */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4 px-1">
        {isInitialLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <View className="justify-center items-center w-full">
            <Text className="text-sm text-red-500">Something went wrong</Text>
          </View>
        ) : stores.length === 0 ? (
          <View className="justify-center items-center w-full">
            <Text className="text-sm text-gray-500">No stores available</Text>
          </View>
        ) : (
          <>
            {stores.map((store: any) => (
              <View
                key={store.id}
                style={{ width: CARD_WIDTH }}
                className="mr-4 rounded-xl overflow-hidden">
                <ImageBackground
                  source={
                    store?.restaurant_images
                      ? { uri: IMAGE_URL + store?.restaurant_images }
                      : ImagePath.restaurant1
                  }
                  className="h-72 w-full justify-end"
                  imageStyle={{ borderRadius: 16 }}>
                  <View className="bg-white p-3 w-11/12 mx-auto rounded-xl bottom-4">
                    <Text
                      className="text-base font-semibold p-1 text-gray-900"
                      numberOfLines={1}>
                      {store?.restaurant_name}
                    </Text>

                    <View className="h-px bg-gray-300 my-1" />

                    <View className="flex-row items-center gap-2 space-x-2 mb-2">
                      <Icon name="pricetag-outline" size={14} color="#10B981" />
                      <Text className="text-sm text-green-600 font-medium">
                        {store?.offer || 'NA'}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center space-x-1">
                        <Icon name="location-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-500">
                          {store?.address || 'NA'}
                        </Text>
                      </View>
                      <View className="flex-row items-center space-x-1">
                        <Icon name="location-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-500">
                          {store?.distance || 'NA'} Km
                        </Text>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </View>
            ))}

            {/* Load More or No More */}
            <View style={{ width: CARD_WIDTH }} className="justify-center items-center">
              {isLoadingMore ? (
                <SkeletonCard />
              ) : hasMore ? (
                <TouchableOpacity
                  onPress={() => fetchStores(page)}
                  className="bg-primary-80 rounded-xl px-4 py-2 mt-4">
                  <Text className="text-white font-medium">Load More</Text>
                </TouchableOpacity>
              ) : (
                <Text className="text-gray-400 mt-4">No more stores found</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default FreshStoreSection;
