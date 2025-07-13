import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  FlatList,
  ToastAndroid,
  RefreshControl,
} from 'react-native';
import { ImagePath } from '../../constants/ImagePath';
import Icon from 'react-native-vector-icons/Ionicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeWishlistShop, addWishlistShop } from '../../store/slices/wishlistSlice';
import { AppDispatch, RootState } from '../../store/store';
import Shop2 from '../../components/common/Shop2';
const PER_PAGE = 4;

const SkeletonCard = () => (
  <View className="bg-white rounded-xl m-4 overflow-hidden shadow-md">
    <View className="h-72 bg-gray-300 animate-pulse" />
    <View className="p-3 absolute bottom-10">
      <View className="h-4 bg-gray-300 rounded w-1/2 mb-2" />
      <View className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
      <View className="flex-row justify-between items-center mt-2">
        <View className="h-4 w-20 bg-gray-200 rounded" />
        <View className="h-4 w-16 bg-gray-200 rounded" />
      </View>
      <View className="h-px bg-gray-200 my-2" />
      <View className="flex-row justify-between items-center">
        <View className="h-4 w-12 bg-gray-200 rounded" />
        <View className="h-4 w-12 bg-gray-200 rounded" />
        <View className="h-4 w-12 bg-gray-200 rounded" />
      </View>
    </View>
  </View>
);

const TopCafesScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { shops: wishlistShops, status } = useSelector((state: RootState) => state.wishlist);

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStores = useCallback(async (pageNumber: number, isInitial = false) => {
    if ((loadMoreLoading && !isInitial) || (!hasMore && !isInitial)) return;

    if (isInitial) setInitialLoading(true);
    else setLoadMoreLoading(true);

    try {
      const response: any = await Fetch(`/user/top-shops?per_page=${PER_PAGE}&page=${pageNumber}`, {}, 5000);
      if (!response.success) throw new Error('Failed to fetch shops');

      const newShops = response?.data?.top_shops || [];
      const pagination = response?.data?.pagination;

      setData(prev => (isInitial ? newShops : [...prev, ...newShops]));
      setHasMore(pagination?.current_page < pagination?.last_page);
      setPage(pagination?.current_page + 1);
    } catch (error) {
      ToastAndroid.show('Failed to fetch shop details', ToastAndroid.SHORT);
    } finally {
      isInitial ? setInitialLoading(false) : setLoadMoreLoading(false);
    }
  }, [loadMoreLoading, hasMore]);

  useEffect(() => {
    dispatch(fetchWishlist());
    fetchStores(1, true);
  }, [dispatch, fetchStores]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await Promise.all([dispatch(fetchWishlist()), fetchStores(1, true)]);
    setRefreshing(false);
  };

  const handleWishlistToggle = async (shop: any) => {
    try {
      if (shop.is_wishlisted) {
        await dispatch(removeWishlistShop({ shop_id: shop.id.toString() })).unwrap();
        ToastAndroid.show('Removed from wishlist', ToastAndroid.SHORT);
      } else {
        await dispatch(addWishlistShop({ shop_id: shop.id.toString() })).unwrap();
        ToastAndroid.show('Added to wishlist', ToastAndroid.SHORT);
      }
      setData(prev =>
        prev.map(d =>
          d.id === shop.id ? { ...d, is_wishlisted: !d.is_wishlisted } : d
        )
      );
    } catch (error) {
      ToastAndroid.show('Failed to update wishlist', ToastAndroid.SHORT);
    }
  };

  const Header = () => (
    <View className='mb-4'>
      <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-5 left-5 z-10">
        <Ionicons name="arrow-back" color="#fff" size={24} />
      </TouchableOpacity>
      <Image
        source={ImagePath?.cofee}
        className="w-44 h-44 absolute top-[-7%] left-[-10%] z-[1] rounded-xl"
        resizeMode="contain"
        tintColor="#FFFFFF33"
      />
      <View className="bg-primary-80 px-4 py-14 justify-end h-56 rounded-b-[2.5rem]">
        <Text className="text-white mb-1 font-bold text-2xl">Top Cafes</Text>
        <Text className="text-white">Explore the best-rated cafés in your city.</Text>
        <Image
          source={ImagePath.cofee}
          className="w-20 h-20 absolute right-5 bottom-5"
          resizeMode="contain"
          tintColor="white"
        />
      </View>
    </View>
  );

  const renderFooter = () => {
    if (loadMoreLoading) {
      return (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      );
    }

    if (!hasMore && data.length > 0) {
      return (
        <Text className="text-center text-gray-400 py-4">No more data found.</Text>
      );
    }

    return null;
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={initialLoading ? Array(3).fill(0) : data}
        keyExtractor={(item, index) =>
          initialLoading ? index.toString() : item.id.toString()
        }
        renderItem={initialLoading ? () => <SkeletonCard /> : (item: any) => <Shop2 item={item} handleWishlistToggle={handleWishlistToggle} status={status} />}
        ListHeaderComponent={Header}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (!initialLoading && !loadMoreLoading && hasMore) {
            fetchStores(page);
          }
        }}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default TopCafesScreen;