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
import {
  fetchWishlist,
  removeWishlistItem,
  addWishlistItem,
  clearWishlistError,
} from '../../store/slices/wishlistSlice';
import { AppDispatch, RootState } from '../../store/store';
import FoodItem from '../../components/common/FoodItem';
import { addToCart } from '../../store/slices/cartSlice';

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
  const { menu_items: wishlistItems, status, error } = useSelector((state: RootState) => state.wishlist);

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (error) {
      ToastAndroid.show(error, ToastAndroid.SHORT);
      dispatch(clearWishlistError());
    }
  }, [error]);

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
        fav: wishlistItems.some(w => w.id === item.id),
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
        await dispatch(removeWishlistItem({ menu_item_id: item.id })).unwrap();
        ToastAndroid.show('Removed from wishlist', ToastAndroid.SHORT);
      } else {
        await dispatch(addWishlistItem({ menu_item_id: item.id })).unwrap();
        ToastAndroid.show('Added to wishlist', ToastAndroid.SHORT);
      }
      setData(prev =>
        prev.map(d => (d.id === item.id ? { ...d, fav: !d.fav } : d))
      );
    } catch {
      ToastAndroid.show('Failed to update wishlist', ToastAndroid.SHORT);
    }
  };

  const handleAddToCart = (item: any) => {
    const cartItem = {
      id: item.id.toString(),
      name: item.item_name,
      price: item.price,
      quantity: 1,
      image: item.images[0] ? IMAGE_URL + item.images[0] : undefined,
      shop_id: item?.shop?.id ?? item?.store_id
    };
    dispatch(addToCart(cartItem));
    ToastAndroid.show(`${item.item_name} added to cart`, ToastAndroid.SHORT);
  };


  // Place order
  const handlePlaceOrder = (item: any) => {
    navigation.navigate('AddCustomerFormScreen', {
      item: [
        {
          id: item.id,
          quantity: 1,
          price: Math.floor(Number(item.price)),
          name: item.item_name,
          image: item?.images?.length ? { uri: IMAGE_URL + item.images[0] } : '',
          shop_id: item?.shop?.id ?? item?.store_id
        },
      ],
    });
  };


  const renderItem = ({ item, index }: { item: any, index: any }) => (
    <View>
      <FoodItem
        id={item?.id}
        name={item.item_name}
        description={item.description || 'No description available'}
        restaurent={item?.shop?.restaurant_name || "NA"}
        price={parseFloat(item.price) || 0}
        imageUrl={
          (item.images?.length ?? 0) > 0
            ? { uri: IMAGE_URL + item.images![0] }
            : ImagePath.item1
        }
        dietaryInfo={item?.dietary_info || []}
        rating={item.average_rating || 0}
        isVegetarian={item.is_vegetarian || false}
        isAvailable={item.is_available !== false}
        onAddToCart={() => handleAddToCart}
        handlePlaceOrder={handlePlaceOrder}
        maxQuantity={10}
        item={item}
      />
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
    if (loadingMore) return (<><SkeletonCard /><SkeletonCard /></>);

    if (!hasMore && data.length > 0) {
      return <Text className="text-center text-gray-400 py-4">No more data found.</Text>;
    }

    if (hasMore && data.length > 0) {
      return (
        <TouchableOpacity
          onPress={() => fetchItems(page)}
          className="my-4 py-3 bg-primary-80 w-1/3 m-auto rounded-xl"
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default HighOnDemandScreen;
