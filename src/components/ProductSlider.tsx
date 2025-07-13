import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ToastAndroid,
} from 'react-native';
import { ImagePath } from '../constants/ImagePath';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeWishlistItem, addWishlistItem, removeWishlistShop, addWishlistShop } from '../store/slices/wishlistSlice';
import { AppDispatch, RootState } from '../store/store';
import { Fetch, IMAGE_URL } from '../utils/apiUtils';
import { useNavigation } from '@react-navigation/native';
import Shop from './common/Shop';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7; // 1 full + 1/2 card peek
const PER_PAGE = 4;

const SkeletonCard = () => (
  <View
    className="bg-gray-100 rounded-xl shadow-md p-3 animate-pulse"
    style={{ width: CARD_WIDTH, marginRight: 16 }}
  >
    <View className="w-full h-48 bg-gray-300 rounded-xl mb-4" />
    <View className="flex-row justify-between items-center mb-2">
      <View className="h-4 bg-gray-200 rounded w-1/2" />
      <View className="h-4 bg-gray-200 rounded w-1/4" />
    </View>
    <View className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
    <View className="flex-row items-center justify-between bg-white p-3 rounded-lg my-4">
      <View className="h-3 bg-gray-200 rounded w-1/4" />
      <View className="h-4 w-px bg-gray-300" />
      <View className="h-3 bg-gray-200 rounded w-1/4" />
      <View className="h-4 w-px bg-gray-300" />
      <View className="h-3 bg-gray-200 rounded w-1/4" />
    </View>
  </View>
);

const ProductSlider = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { items: wishlistItems, status } = useSelector((state: RootState) => state.wishlist);

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async (pageNumber: number, isInitial = false) => {
    if ((loadMoreLoading && !isInitial) || (!hasMore && !isInitial)) return;

    if (isInitial) setInitialLoading(true);
    else setLoadMoreLoading(true);

    try {
      const response: any = await Fetch(`/user/shops-nearby?per_page=${PER_PAGE}&page=${pageNumber}`, {}, 5000);
      console.log(response)
      if (!response.success) throw new Error('Failed to fetch products');

      const newProducts = response?.data?.nearby_shops || [];
      const pagination = response?.data?.pagination;

      // Update products with wishlist status
      // const updatedProducts = newProducts.map((product: any) => ({
      //   ...product,
      //   is_wishlisted: wishlistItems.some(wishlistItem => wishlistItem.menu_item_id === product.id.toString()),
      // }));

      setData(prev => (isInitial ? newProducts : [...prev, ...newProducts]));
      setHasMore(pagination?.current_page < pagination?.last_page);
      setPage(pagination?.current_page + 1);
    } catch (error) {
      ToastAndroid.show('Failed to fetch products', ToastAndroid.SHORT);
    } finally {
      isInitial ? setInitialLoading(false) : setLoadMoreLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchWishlist());
    fetchProducts(1, true);
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await Promise.all([dispatch(fetchWishlist()), fetchProducts(1, true)]);
    setRefreshing(false);
  };

  const handleWishlistToggle = async (product: any) => {
    try {
      if (product?.is_wishlisted) {
        await dispatch(removeWishlistShop({ shop_id: product.id.toString() })).unwrap();
        ToastAndroid.show('Removed from wishlist', ToastAndroid.SHORT);
      } else {
        await dispatch(addWishlistShop({ shop_id: product.id.toString() })).unwrap();
        ToastAndroid.show('Added to wishlist', ToastAndroid.SHORT);
      }
      // Update local data to reflect wishlist change
      setData(prev =>
        prev.map(d =>
          d.id === product.id ? { ...d, is_wishlisted: !d.is_wishlisted } : d
        )
      );
    } catch (error) {
      ToastAndroid.show('Failed to update wishlist', ToastAndroid.SHORT);
    }
  };

  // Handle scroll to load more
  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isCloseToEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - CARD_WIDTH;

    if (isCloseToEnd && hasMore && !loadMoreLoading) {
      fetchProducts(page);
    }
  };

  const renderItem = ({ item, index }: { item: any, index: any }) => {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("ShopDetailsScreen", { shop_info: item })}
        key={index}
        className="bg-gray-100 rounded-xl shadow-md p-3 relative"
        style={{ width: CARD_WIDTH, marginRight: 16 }}
      >
        <Image
          source={item?.restaurant_images?.length ? { uri: IMAGE_URL + item.restaurant_images[0] } : ImagePath.item1}
          className="w-full h-48 rounded-xl mb-4"
          resizeMode="cover"
        />
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className="text-base font-medium text-gray-800"
            numberOfLines={1}
            ellipsizeMode='tail'
          >
            {item.restaurant_name?.length > 18
              ? item.restaurant_name.slice(0, 18) + '...'
              : item.restaurant_name}
          </Text>
          <TouchableOpacity
            className=""
            onPress={() => handleWishlistToggle(item)}
            disabled={status === 'loading'}
          >
            <MaterialIcons
              name={item?.is_wishlisted ? 'favorite' : 'favorite-outline'}
              size={24}
              color={item?.is_wishlisted ? 'red' : 'black'}
            />
          </TouchableOpacity>
        </View>
        <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
          {item.about_business?.length > 40
            ? item.about_business.slice(0, 40) + '...'
            : item.about_business || 'No description available'}
        </Text>
        <View className="flex-row items-center justify-between bg-white p-3 rounded-lg my-4">
          <View className="flex-row items-center space-x-1">
            <Icon name="location" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-500"> {item?.distance_km || '1.2'}Km</Text>
          </View>
          <View className="h-4 w-px bg-gray-300" />
          <View className="flex-row items-center space-x-1">
            <Icon name="time" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-500">{item?.travel_time_mins || '10'} Min</Text>
          </View>
          <View className="h-4 w-px bg-gray-300" />
          <View className="flex-row items-center space-x-1">
            <Icon name="star" size={14} color="#6B7280" />
            <Text className="text-xs text-gray-500"> {item?.average_rating || '0'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    )
  };

  const renderFooter = () => {
    if (loadMoreLoading) {
      return (
        <View style={{ flexDirection: 'row' }}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
      );
    }

    if (!hasMore && data.length > 0) {
      return null;
    }

    return null;
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16} // Adjust for smooth scrolling
      >
        {(initialLoading ? Array(3).fill(0) : data).map((store, index) =>
          initialLoading ? (
            <SkeletonCard key={index} />
          ) : (
            <View key={store.id} style={{ width: CARD_WIDTH }}>
              <Shop
                id={store.id}
                name={store.name}
                description={store.description || 'No description available'}
                images={store?.restaurant_images || []}
                address={store.address || 'No address provided'}
                phone={store.phone || 'No phone provided'}
                rating={store.rating || 0}
                categories={store.categories || []}
                isOpen={store.is_open !== false}
                featuredItems={
                  store.featured_items?.map((item) => ({
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
          )
        )}
        {renderFooter()}
      </ScrollView >
    </View >
  );
};

export default ProductSlider;