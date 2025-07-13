import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ToastAndroid,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Fetch, IMAGE_URL } from '../utils/apiUtils';
import { RootState } from '../store/store';
import { ImagePath } from '../constants/ImagePath';
import Shop from '../components/common/Shop';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const PER_PAGE = 5;

interface Store {
  id: string;
  restaurant_name: string;
  description?: string;
  restaurant_images?: string | string[];
  address?: string;
  phone?: string;
  rating?: number;
  categories?: string[];
  is_open?: boolean;
  featured_items?: Array<{
    id: string;
    name: string;
    price: number;
    image?: string;
  }>;
  distance_km?: string;
  offer?: string;
  travel_time_mins?: string;
}

const SkeletonCard = () => (
  <View
    style={{ width: CARD_WIDTH }}
    className="mr-4 bg-white rounded-xl overflow-hidden shadow-md"
  >
    <View className="h-48 bg-gray-300 animate-pulse" />
    <View className="p-3">
      <View className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
      <View className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <View className="h-px bg-gray-200 my-2" />
      <View className="flex-row justify-between items-center">
        <View className="h-4 w-24 bg-gray-200 rounded" />
        <View className="h-4 w-16 bg-gray-200 rounded" />
      </View>
    </View>
  </View>
);

const FreshStoreSection = () => {
  const navigation = useNavigation<any>();
  const [products, setProducts] = useState<Store[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  const fetchProducts = async (pageNumber: number) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const response: any = await Fetch(
        `/user/recent-added-shop?limit=${PER_PAGE}&page=${pageNumber}`,
        {
          params: {
            latitude: user?.latitude || 0,
            longitude: user?.longitude || 0,
            radius: 10, // Example: 10km radius
          },
        },
        5000
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch stores');
      }

      const newProducts = response?.data?.recent_shops || [];
      const filtered = newProducts.filter((item: any) => item?.id);

      // Prevent duplicates
      setProducts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = filtered.filter((item: any) => !existingIds.has(item.id));
        return [...prev, ...uniqueNew];
      });

      if (filtered.length < PER_PAGE) setHasMore(false);
      setPage((prev) => prev + 1);
    } catch (err: any) {
      console.error('Fetch error:', err.message);
      setError(err.message);
      ToastAndroid.show('Failed to load stores', ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [user?.latitude, user?.longitude]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const isCloseToEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - 50;

    if (isCloseToEnd && !isLoading && hasMore) {
      fetchProducts(page);
    }
  };

  return (
    <View className="pt-6">
      {/* Header */}
      <View className="mb-3">
        <Text className="text-lg font-semibold text-gray-900">Fresh Stores</Text>
        <Text className="text-sm text-gray-500">Discover the latest additions</Text>
      </View>

      {/* Horizontal Scrollable Store List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        className="space-x-4"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ref={scrollViewRef}
      >
        {isLoading && products.length === 0 ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <View style={{ width }} className="justify-center items-center">
            <Text className="text-sm text-red-500">{error}</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={{ width }} className="justify-center items-center">
            <Text className="text-sm text-gray-500">No stores available</Text>
          </View>
        ) : (
          <>
            {products.map((product, index) => (
              <View
                key={`${product.id}-${index}`}
                style={{ width: width * 0.8 }}
              >
                <Shop
                  id={product.id}
                  name={product.restaurant_name || 'Unknown'}
                  description={product.description || 'No description available'}
                  images={product?.restaurant_images}
                  address={product.address || 'No address provided'}
                  phone={product.phone || 'No phone provided'}
                  rating={product?.average_rating || 0}
                  categories={product.categories || []}
                  isOpen={product.is_open !== false}
                  featuredItems={
                    product.featured_items?.map((item: any) => ({
                      id: item.id,
                      name: item.name,
                      price: item.price,
                      image: item.image ? IMAGE_URL + item.image : ImagePath.item1,
                    })) || []
                  }
                  maxImages={5}
                  item={product}
                />
              </View>
            ))}
            {isLoading && products.length > 0 && (
              <View style={{ width: CARD_WIDTH }} className="justify-center items-center">
                <SkeletonCard />
              </View>
            )}
            {!hasMore && products.length > 0 && (
              <View style={{ width: CARD_WIDTH }} className="justify-center items-center">
                <Text className="text-gray-400 mt-4">No more stores</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default FreshStoreSection;