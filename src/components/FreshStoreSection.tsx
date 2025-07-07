import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ImageBackground,
  ToastAndroid,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../constants/ImagePath';
import { Fetch, IMAGE_URL } from '../utils/apiUtils';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const PER_PAGE = 5;

// Skeleton Card while loading
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
  const navigation = useNavigation<any>()
  const [products, setProducts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<any>(null);

  const fetchProducts = async (pageNumber: number) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const response: any = await Fetch(
        `/user/recent-added-shop?limit=${PER_PAGE}&page=${pageNumber}`,
        {},
        5000
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch products');
      }
      console.log(response?.data)
      const newProducts = response?.data?.recent_shops || [];
      const filtered = newProducts.filter((item: any) => item?.id);

      // Prevent duplicates
      setProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNew = filtered.filter((item: any) => !existingIds.has(item.id));
        return [...prev, ...uniqueNew];
      });

      if (filtered.length < PER_PAGE) setHasMore(false);
      setPage(prev => prev + 1);
    } catch (err: any) {
      console.error('Fetch error:', err.message);
      setError(err.message);
      ToastAndroid.show('Failed to load products', ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, []);

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

      {/* Horizontal Scrollable Product List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className=""
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
            <Text className="text-sm text-gray-500">No products available</Text>
          </View>
        ) : (
          <>
            {products.map((product, index) => (
              <TouchableOpacity
                onPress={() => navigation.navigate("ShopDetailsScreen", { shop_info: product })}
                key={`${product.id}-${index}`} // Unique key using id-index
                style={{ width: CARD_WIDTH }}
                className="mr-4 rounded-xl overflow-hidden">
                <ImageBackground
                  source={
                    product?.restaurant_images
                      ? {
                        uri: IMAGE_URL +
                          (Array.isArray(product.restaurant_images)
                            ? product.restaurant_images[0]
                            : product.restaurant_images),
                      }
                      : ImagePath.restaurant1
                  }
                  className="h-72 w-full justify-end"
                  imageStyle={{ borderRadius: 16 }}
                >
                  <View className="bg-white p-3 w-11/12 mx-auto rounded-xl bottom-4">
                    <Text
                      className="text-base font-semibold p-1 text-gray-900"
                      numberOfLines={1}
                      ellipsizeMode='tail'
                    >
                      {product?.restaurant_name || 'Unknown'}
                    </Text>
                    <View className="h-px bg-gray-300 my-1" />
                    <View className='flex-row items-center justify-between'>
                      {!product?.offer && <View className="flex-row items-center gap-2 mb-2">
                        <Icon name="pricetag-outline" size={14} color="#10B981" />
                        <Text className="text-sm text-green-600 font-medium">
                          {product?.offer || 'No Offer'}
                        </Text>
                      </View>}
                      {!product?.offer && <View className="flex-row items-center gap-2 mb-2">
                        <Icon name="timer-outline" size={14} color="#000" />
                        <Text className="text-sm text-gray-900 ">
                          {product?.travel_time_mins ?? "NA"} min
                        </Text>
                      </View>}
                    </View>
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center space-x-1">
                        <Icon name="location-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-500">
                          {product?.address || 'Unknown'}
                        </Text>
                      </View>
                      <View className="flex-row items-center space-x-1">
                        <Icon name="location-outline" size={14} color="#6B7280" />
                        <Text className="text-xs text-gray-500">
                          {product?.distance_km || '0'} Km
                        </Text>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}

            {isLoading && products.length > 0 && (
              <View style={{ width: CARD_WIDTH }} className="justify-center items-center">
                <SkeletonCard />
              </View>
            )}

            {!hasMore && products.length > 0 && (
              <View style={{ width: CARD_WIDTH }} className="justify-center items-center">
                <Text className="text-gray-400 mt-4">No more products</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default FreshStoreSection;
