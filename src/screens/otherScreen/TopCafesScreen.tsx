import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import Shop from '../../components/common/Shop';

const PER_PAGE = 4;
const LOAD_THRESHOLD = 0.8; // Load when 80% of the list is scrolled

const SkeletonCard = () => (
  <View className="bg-white rounded-xl m-4 overflow-hidden shadow-md">
    <View className="h-56 bg-gray-300 animate-pulse" />
    <View className="p-3 absolute bottom-10">
      <View className="h-4 bg-gray-300 rounded w-1/2 mb-2" />
      <View className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
      <View className="flex-row justify-between items-center mt-2">
        <View className="h-4 w-20 bg-gray-200 rounded" />
        <View className="h-4 w-16 bg-gray-200 rounded" />
      </View>
      <View className="h-px bg-gray-200 my-2" />
    </View>
  </View>
);

const TopCafesScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { shops: wishlistShops, status } = useSelector((state: RootState) => state.wishlist);

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0); // Track total number of items
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchStores = useCallback(async (pageNumber: number, isInitial = false) => {
    if ((loadMoreLoading && !isInitial) || (!hasMore && !isInitial)) return;

    if (isInitial) setInitialLoading(true);
    else setLoadMoreLoading(true);
    console.log(isInitial, initialLoading, loadMoreLoading)
    try {
      const response: any = await Fetch(`/user/top-shops?per_page=${PER_PAGE}&page=${pageNumber}`, {}, 5000);
      if (!response.success) throw new Error('Failed to fetch shops');

      const newShops = response?.data?.top_shops || [];
      const pagination = response?.data?.pagination;

      // Prevent duplicate data by checking IDs
      setData(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const filteredNewShops = newShops.filter((shop: any) => !existingIds.has(shop.id));
        return isInitial ? newShops : [...prev, ...filteredNewShops];
      });

      setTotalPages(pagination?.last_page || 1);
      setTotalItems(pagination?.total || 0);
      setHasMore(pageNumber < pagination?.last_page && newShops.length > 0);
      setPage(pageNumber + 1);
    } catch (error) {
      ToastAndroid.show('Failed to fetch shop details', ToastAndroid.SHORT);
    } finally {
      isInitial ? setInitialLoading(false) : setLoadMoreLoading(false);
    }
  }, [loadMoreLoading, hasMore]);

  useEffect(() => {
    dispatch(fetchWishlist());
    fetchStores(1, true);
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setTotalPages(1);
    setTotalItems(0);
    await Promise.all([dispatch(fetchWishlist()), fetchStores(1, true)]);
    setRefreshing(false);
  }, [dispatch, fetchStores]);

  const handleWishlistToggle = useCallback(async (shop: any) => {
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
  }, [dispatch]);

  const handleScroll = useCallback(({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const scrollPercentage = (contentOffset.y + layoutMeasurement.height) / contentSize.height;

    if (
      scrollPercentage > LOAD_THRESHOLD &&
      !loadMoreLoading &&
      hasMore &&
      page <= totalPages &&
      data.length < totalItems
    ) {
      fetchStores(page);
    }
  }, [fetchStores, page, loadMoreLoading, hasMore, totalPages, totalItems, data.length]);

  const Header = () => (
    <View className='mb-4'>
      <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-5 left-5 z-10">
        <Ionicons name="arrow-back" color="#fff" size={24} />
      </TouchableOpacity>
      <Image
        source={ImagePath?.cofee}
        className="w-44 h-44 absolute top-[-7%] left-[-10%] z-[1] rounded-xl"
        resizeMode="contain"
        tintColor="#FFFFFF59"
      />
      <View className="bg-primary-100 px-4 py-14 justify-end h-56 rounded-b-[2.5rem]">
        <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-white mb-1 font-bold text-3xl">Top Cafes</Text>
        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white">Explore the best-rated cafés in your city.</Text>
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

    console.log(hasMore, data.length, totalItems, data.length, 0)
    if (!hasMore && data.length >= totalItems && data.length > 0) {
      return (
        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-center text-gray-400 py-4">No more cafes to show.</Text>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View className="flex-1 bg-white">
        <FlatList
          ref={flatListRef}
          data={initialLoading ? Array(3).fill(0) : data}
          keyExtractor={(item, index) =>
            initialLoading ? index.toString() : item.id.toString()
          }
          renderItem={initialLoading ? () => <SkeletonCard /> : (store: any) => (
            <View className='px-2' key={store?.item?.id}>
              <Shop
                id={store?.item?.id}
                name={store?.item?.restaurant_name}
                description={store?.item?.about_business || 'No description available'}
                images={store?.item?.restaurant_images || []}
                address={store?.item?.address || 'No address provided'}
                phone={store?.item?.phone || 'No phone provided'}
                rating={store?.item?.average_rating || 0}
                categories={store?.item?.categories || []}
                isOpen={store?.item?.is_open !== false}
                featuredItems={
                  store?.item?.featured_items?.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image || ImagePath.item1,
                  })) || []
                }
                maxImages={5}
                item={store?.item}
              // onWishlistToggle={handleWishlistToggle}
              />
            </View>
          )}
          ListHeaderComponent={Header}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default TopCafesScreen;