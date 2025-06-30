import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ToastAndroid,
  RefreshControl,
} from 'react-native';
import { ImagePath } from '../../constants/ImagePath';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeWishlistItem, addWishlistItem } from '../../store/slices/wishlistSlice';
import { AppDispatch, RootState } from '../../store/store';

const PER_PAGE = 5;

const SkeletonCard = () => (
  <View className="flex-row gap-4 bg-gray-200 rounded-xl p-4 mx-4 my-2 animate-pulse">
    <View className="w-24 h-28 bg-gray-300 rounded-xl" />
    <View className="flex-1 justify-between py-1">
      <View className="h-4 bg-gray-300 w-2/3 mb-2 rounded" />
      <View className="h-3 bg-gray-300 w-1/2 mb-2 rounded" />
      <View className="h-3 bg-gray-300 w-3/5 mb-2 rounded" />
      <View className="h-3 bg-gray-300 w-2/4 mb-2 rounded" />
    </View>
  </View>
);

const HighOnDemandScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { items: wishlistItems, status } = useSelector((state: RootState) => state.wishlist);

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async (pageNumber = 1, isInitial = false) => {
    if (loadingMore && !isInitial) return;

    if (isInitial) setInitialLoading(true);
    else setLoadingMore(true);

    try {
      const response: any = await Fetch(`/user/high-demand?limit=${PER_PAGE}&page=${pageNumber}`);
      if (!response.success) throw new Error('Failed to fetch');

      const items = response?.data?.data ?? [];
      const pagination = response?.data?.pagination;
      const isLastPage = pagination?.current_page >= pagination?.last_page;

      // Update items with wishlist status
      const updatedItems = items.map((item: any) => ({
        ...item,
        fav: wishlistItems.some(wishlistItem => wishlistItem.menu_item_id === item.id.toString()),
      }));

      setData(prev => (isInitial ? updatedItems : [...prev, ...updatedItems]));
      setPage(pageNumber + 1);
      setHasMore(!isLastPage);
    } catch (err) {
      ToastAndroid.show('Failed to fetch items', ToastAndroid.SHORT);
    } finally {
      isInitial ? setInitialLoading(false) : setLoadingMore(false);
    }
  };

  useEffect(() => {
    dispatch(fetchWishlist());
    fetchItems(1, true);
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await Promise.all([dispatch(fetchWishlist()), fetchItems(1, true)]);
    setRefreshing(false);
  };

  const handleWishlistToggle = async (item: any) => {
    try {
      if (item.fav) {
        await dispatch(removeWishlistItem({ menu_item_id: item.id.toString() })).unwrap();
        ToastAndroid.show('Removed from wishlist', ToastAndroid.SHORT);
      } else {
        await dispatch(addWishlistItem({ menu_item_id: item.id.toString() })).unwrap();
        ToastAndroid.show('Added to wishlist', ToastAndroid.SHORT);
      }
      // Update local data to reflect wishlist change
      setData(prev =>
        prev.map(d =>
          d.id === item.id ? { ...d, fav: !d.fav } : d
        )
      );
    } catch (error) {
      ToastAndroid.show('Failed to update wishlist', ToastAndroid.SHORT);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="flex-row gap-4 bg-primary-10 rounded-xl p-4 mx-4 my-2">
      <Text className="absolute top-2 right-12">
        <AntDesign name="star" size={19} color={'#FFC727'} /> {item?.average_rating}
      </Text>
      <TouchableOpacity
        className="absolute top-2 right-5"
        onPress={() => handleWishlistToggle(item)}
        disabled={status === 'loading'}
      >
        <MaterialIcons
          name={item?.fav ? 'favorite' : 'favorite-outline'}
          size={19}
          color={item?.fav ? 'red' : 'black'}
        />
      </TouchableOpacity>
      <Image
        source={item?.images?.length ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1}
        className="w-24 h-28 rounded-xl"
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text className="text-xl font-bold">{item?.item_name}</Text>
        <View className="flex-row items-center gap-4 mb-2">
          <Text className="text-gray-500">{item?.category?.name}</Text>
          <Text className="text-gray-500">{item?.distance || 'NA'} KM</Text>
        </View>
        <Text className="mb-1">₹{item?.price}/-</Text>
        <Text>{item?.restaurant_name || 'NA'}</Text>
      </View>
    </View>
  );

  const Header = () => (
    <View className='mb-4'>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute top-5 left-5 z-10"
      >
        <Ionicons name="arrow-back" color={'#fff'} size={24} />
      </TouchableOpacity>

      <Image
        source={ImagePath?.fire2}
        className="w-44 h-44 absolute top-[-10%] left-[-10%] z-[1] rounded-xl"
        resizeMode="contain"
        tintColor={'#FFFFFF33'}
      />

      <View className="bg-primary-80 px-4 py-14 justify-end h-56 rounded-b-[2.5rem] ">
        <Text className="text-white mb-1 font-bold text-2xl">
          High On Demand
        </Text>
        <Text className="text-white">
          Discover what everyone is ordering the most
        </Text>
        <Image
          source={ImagePath.fire2}
          className="w-24 h-24 absolute right-5 bottom-5"
          resizeMode="contain"
          tintColor={'white'}
        />
      </View>
    </View>
  );

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      );
    }

    if (!hasMore && data.length > 0) {
      return (
        <Text className="text-center text-gray-400 py-4">
          No more data found.
        </Text>
      );
    }

    if (hasMore && data.length > 0) {
      return (
        <TouchableOpacity
          onPress={() => fetchItems(page)}
          className="my-4 py-3 bg-primary-80 w-1/3 m-auto rounded-xl"
        >
          <Text className="text-center text-white font-semibold">
            Load More
          </Text>
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

export default HighOnDemandScreen;