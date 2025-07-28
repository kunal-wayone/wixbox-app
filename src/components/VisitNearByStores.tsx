import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ToastAndroid,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Fetch } from '../utils/apiUtils';
import { ImagePath } from '../constants/ImagePath';
import Shop from './common/Shop';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const PER_PAGE = 10;

interface Store {
  id: string;
  name: string;
  description?: string;
  images?: string[];
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
  distance?: string;
}

const VisitNearByStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch recent shops
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
      console.log(response)
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch stores');
      }

      const newProducts = response?.data?.recent_shops || [];
      const filtered = newProducts.filter((item: any) => item?.id);

      // Prevent duplicates
      setStores((prev) => {
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

  // Initial fetch
  useEffect(() => {
    fetchProducts(1);
  }, [user?.latitude, user?.longitude]);

  // Handle scroll for paginations
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    const isCloseToEnd = layoutMeasurement.width + contentOffset.x >= contentSize.width - 50;

    if (isCloseToEnd && !isLoading && hasMore) {
      fetchProducts(page);
    }
  };



  return (
    <View className="pt-6">
      {/* Section Header */}
      <View className="mb-3">
        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-lg text-gray-900">
          Visit Nearby Stores
        </Text>
        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-500">
          Check out the newest additions near you
        </Text>
      </View>

      {/* Content */}
      {error ? (
        <View className="flex-1 justify-center items-center">
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-500 text-base">{error}</Text>
        </View>
      ) : stores.length === 0 && !isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-500 text-base">No stores found nearby</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 16}
          decelerationRate="fast"
          className="space-x-4"
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {stores.map((store) => (
            <View key={store?.id} style={{ width: width * 0.8 }}>
              <Shop
                id={store?.id}
                name={store?.restaurant_name}
                description={store?.about_business || 'No description available'}
                images={store?.restaurant_images || []}
                address={store?.address || 'No address provided'}
                phone={store.phone || 'No phone provided'}
                rating={store?.average_rating || 0}
                categories={store?.categories || []}
                isOpen={store?.is_open !== false}
                featuredItems={
                  store?.featured_items?.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image || ImagePath.item1,
                  })) || []
                }
                maxImages={5}
                item={store}
              />
            </View>
          ))}
          {isLoading && (
            <View className="flex justify-center items-center" style={{ width: CARD_WIDTH }}>
              <ActivityIndicator size="large" color="#10B981" />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default VisitNearByStores;