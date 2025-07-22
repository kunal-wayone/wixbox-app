import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Dimensions, RefreshControl, ToastAndroid } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeWishlistShop, addWishlistShop } from '../store/slices/wishlistSlice';
import { AppDispatch, RootState } from '../store/store';
import { Fetch } from '../utils/apiUtils';
import { useNavigation } from '@react-navigation/native';
import Shop from './common/Shop';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const PER_PAGE = 4;

const SkeletonCard = () => (
  <View
    className="bg-gray-100 rounded-xl shadow-md p-3 animate-pulse"
    style={{ width: CARD_WIDTH, marginRight: 16 }}
  >
    <View className="w-full h-32 bg-gray-300 rounded-xl mb-4" />
    <View className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
    <View className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
    <View className="flex-row items-center justify-between bg-white p-3 rounded-lg my-4">

    </View>
  </View>
);

const ProductSlider = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.wishlist);
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async (pageNumber: number, isInitial = false) => {
    if ((isLoading && !isInitial) || (!hasMore && !isInitial)) return;

    setIsLoading(true);
    try {
      const response: any = await Fetch(`/user/shops-nearby?per_page=${PER_PAGE}&page=${pageNumber}`, {}, 5000);
      if (!response.success) throw new Error('Failed to fetch products');

      const newProducts = response?.data?.nearby_shops || [];
      const pagination = response?.data?.pagination;

      setData((prev: any) => (isInitial ? newProducts : [...prev, ...newProducts]));
      setHasMore(pagination?.current_page < pagination?.last_page);
      setPage(pagination?.current_page + 1);
    } catch (error) {
      ToastAndroid.show('Failed to fetch products', ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1, true);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await Promise.all([dispatch(fetchWishlist()), fetchProducts(1, true)]);
    setRefreshing(false);
  };

  const handleWishlistToggle = async (product: any) => {
    try {
      const action = product?.is_wishlisted
        ? removeWishlistShop({ shop_id: product.id.toString() })
        : addWishlistShop({ shop_id: product.id.toString() });

      await dispatch(action).unwrap();
      ToastAndroid.show(
        product?.is_wishlisted ? 'Removed from wishlist' : 'Added to wishlist',
        ToastAndroid.SHORT
      );

      setData((prev: any) =>
        prev.map((d: any) =>
          d.id === product.id ? { ...d, is_wishlisted: !d.is_wishlisted } : d
        )
      );
    } catch (error) {
      ToastAndroid.show('Failed to update wishlist', ToastAndroid.SHORT);
    }
  };

  const handleScroll = ({ nativeEvent }: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
    const isCloseToEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - CARD_WIDTH;

    if (isCloseToEnd && hasMore && !isLoading) {
      fetchProducts(page);
    }
  };

  const renderFooter = () => {
    if (!isLoading || refreshing) return null;
    return (
      <View style={{ flexDirection: 'row' }}>
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  };

  return (
    <View className="mb-4">
      <View className="mb-3">
        <Text className="text-lg font-semibold text-gray-900">
          Few Steps Away
        </Text>
        <Text className="text-sm text-gray-500">
          Discover nearby picks tailored for you
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {(isLoading && !data.length ? Array(3).fill(0) : data).map((store: any, index: any) =>
          isLoading && !data.length ? (
            <SkeletonCard key={index} />
          ) : (
            <View key={store.id} style={{ width:width * 0.8 }}>
              <Shop
                id={store.id}
                name={store.restaurant_name}
                description={store.about_business || 'No description available'}
                images={store?.restaurant_images || []}
                address={store.address || 'No address provided'}
                phone={store.phone || 'No phone provided'}
                rating={store.average_rating || 0}
                categories={store.categories || []}
                isOpen={store.is_open !== false}
                featuredItems={
                  store.featured_items?.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                  })) || []
                }
                maxImages={5}
                item={store}
                onWishlistToggle={() => handleWishlistToggle(store)}
              />
            </View>
          )
        )}
        {renderFooter()}
      </ScrollView>
    </View>
  );
};

export default ProductSlider;