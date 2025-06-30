import React, { useEffect, useState } from 'react';
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

  const fetchStores = async (pageNumber: number, isInitial = false) => {
    if ((loadMoreLoading && !isInitial) || (!hasMore && !isInitial)) return;

    if (isInitial) setInitialLoading(true);
    else setLoadMoreLoading(true);

    try {
      const response: any = await Fetch(`/user/top-shops?per_page=${PER_PAGE}&page=${pageNumber}`, {}, 5000);
      if (!response.success) throw new Error('Failed to fetch shops');

      const newShops = response?.data?.top_shops || [];
      const pagination = response?.data?.pagination;

      // Update shops with wishlist status
      const updatedShops = newShops.map((shop: any) => ({
        ...shop,
        fav: wishlistShops.some(wishlistShop => wishlistShop.shop_id === shop.id.toString()),
      }));

      setData(prev => (isInitial ? updatedShops : [...prev, ...updatedShops]));
      setHasMore(pagination?.current_page < pagination?.last_page);
      setPage(pagination?.current_page + 1);
    } catch (error) {
      ToastAndroid.show('Failed to fetch shop details', ToastAndroid.SHORT);
    } finally {
      isInitial ? setInitialLoading(false) : setLoadMoreLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchWishlist());
    fetchStores(1, true);
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await Promise.all([dispatch(fetchWishlist()), fetchStores(1, true)]);
    setRefreshing(false);
  };

  const handleWishlistToggle = async (shop: any) => {
    try {
      if (shop.fav) {
        await dispatch(removeWishlistShop({ shop_id: shop.id.toString() })).unwrap();
        ToastAndroid.show('Removed from wishlist', ToastAndroid.SHORT);
      } else {
        await dispatch(addWishlistShop({ shop_id: shop.id.toString() })).unwrap();
        ToastAndroid.show('Added to wishlist', ToastAndroid.SHORT);
      }
      // Update local data to reflect wishlist change
      setData(prev =>
        prev.map(d =>
          d.id === shop.id ? { ...d, fav: !d.fav } : d
        )
      );
    } catch (error) {
      ToastAndroid.show('Failed to update wishlist', ToastAndroid.SHORT);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="w-full mx-auto px-4 py-2">
      <View className="rounded-xl overflow-hidden relative">
        <ImageBackground
          source={item?.restaurant_images?.length ? { uri: IMAGE_URL + item.restaurant_images[0] } : ImagePath.restaurant1}
          className="h-72 w-full justify-end relative"
          imageStyle={{ borderRadius: 16 }}
        >
          <TouchableOpacity
            className="absolute top-2 right-2 z-10"
            onPress={() => handleWishlistToggle(item)}
            disabled={status === 'loading'}
          >
            <MaterialIcons
              name={item?.fav ? 'favorite' : 'favorite-outline'}
              size={24}
              color={item?.fav ? 'red' : 'white'}
            />
          </TouchableOpacity>
          <View className="absolute inset-0 bg-black" style={{ opacity: 0.5 }} />
          <View className="bg-white p-3 w-11/12 mx-auto rounded-xl bottom-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-base font-semibold py-1 text-gray-900" numberOfLines={1}>
                  {item?.restaurant_name?.length > 18
                    ? item.restaurant_name.slice(0, 18) + '...'
                    : item?.restaurant_name}
                </Text>
                <Text className="text-xs mb-2 w-40 text-gray-900" numberOfLines={1}>
                  {item?.about_business?.length > 40
                    ? item.about_business.slice(0, 40) + '...'
                    : item?.about_business}
                </Text>
              </View>
              <View className="flex-row items-center bg-gray-200 rounded-md p-1 space-x-1">
                <Icon name="location" size={14} color="#000" />
                <Text className="text-xs text-gray-900">{item.city}</Text>
              </View>
            </View>
            <View className="h-px bg-gray-300 my-1" />
            <View className="flex-row items-center justify-between bg-white rounded-lg p-2">
              <View className="flex-row items-center space-x-1">
                <Icon name="time" size={14} color="#6B7280" />
                <Text className="text-xs text-gray-500">10 min</Text>
              </View>
              <View className="h-4 w-px bg-gray-300" />
              <View className="flex-row items-center space-x-1">
                <Icon name="star" size={14} color="#6B7280" />
                <Text className="text-xs text-gray-500">4.5</Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );

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

    if (hasMore && data.length > 0) {
      return (
        <TouchableOpacity
          onPress={() => fetchStores(page)}
          className="mx-4 my-4 py-3 bg-primary-80 rounded-xl"
        >
          <Text className="text-center text-white font-semibold">Load More</Text>
        </TouchableOpacity>
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
        renderItem={initialLoading ? () => <SkeletonCard /> : renderItem}
        ListHeaderComponent={Header}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default TopCafesScreen;