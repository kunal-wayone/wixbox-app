import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  Switch,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { RootState } from '../../store/store';

const SkeletonLoader = () => (
  <View className="flex-row bg-gray-100 rounded-xl p-4 mb-4 shadow-sm animate-pulse">
    <View className="w-2/5 mr-3">
      <View className="w-full h-40 bg-gray-300 rounded-lg mb-2" />
      <View className="flex-row items-center h-10">
        <View className="w-12 h-4 bg-gray-300 rounded mr-2" />
        <View className="w-12 h-6 bg-gray-300 rounded" />
      </View>
    </View>
    <View className="flex-1">
      <View className="w-24 h-4 bg-gray-300 rounded mb-2" />
      <View className="w-full h-6 bg-gray-300 rounded mb-2" />
      <View className="flex-row justify-between">
        <View className="w-16 h-4 bg-gray-300 rounded" />
        <View className="w-20 h-4 bg-gray-300 rounded" />
      </View>
      <View className="w-16 h-4 bg-gray-300 rounded mt-2" />
      <View className="flex-row items-center mt-2">
        <View className="w-12 h-4 bg-gray-300 rounded" />
      </View>
      <View className="flex-row justify-between mt-2">
        <View className="w-20 h-4 bg-gray-300 rounded" />
        <View className="w-12 h-4 bg-gray-300 rounded" />
      </View>
      <View className="w-full h-10 bg-gray-300 rounded mt-2" />
    </View>
  </View>
);

const UsersMenuItems = ({ shopId }: any) => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [toggleLoadingIds, setToggleLoadingIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const flatListRef = useRef<FlatList>(null);

  const fetchProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!shopId) return;

    try {
      if (page === 1) setIsLoading(true);
      else setIsFetchingMore(true);

      const response: any = await Fetch(
        `/user/shop-menu-items?shop_id=${shopId}&page=${page}&per_page=5`,
        {},
        5000
      );

      if (!response.success) throw new Error('Failed to fetch products');

      setLastPage(response.pagination.last_page);
      setCurrentPage(response.pagination.current_page);
      setProducts((prev) =>
        append ? [...prev, ...response.menu_items] : response.menu_items || []
      );
    } catch (error: any) {
      ToastAndroid.show(
        error?.message || 'Failed to load products.',
        ToastAndroid.SHORT
      );
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [shopId]);

  const toggleProductStatus = useCallback(
    async (id: string, currentStatus: boolean) => {
      try {
        setToggleLoadingIds((prev) => [...prev, id]);
        const response: any = await Fetch(
          `/user/menu-items/${id}/active-inactive`,
          { status: currentStatus ? 0 : 1 },
          5000
        );
        if (!response.success) throw new Error('Failed to toggle status');

        setProducts((prevProducts) =>
          prevProducts.map((item) =>
            item.id === id ? { ...item, status: currentStatus ? 0 : 1 } : item
          )
        );

        ToastAndroid.show('Status updated successfully!', ToastAndroid.SHORT);
      } catch (error: any) {
        ToastAndroid.show(
          error?.message || 'Failed to toggle status.',
          ToastAndroid.SHORT
        );
      } finally {
        setToggleLoadingIds((prev) => prev.filter((itemId) => itemId !== id));
      }
    },
    []
  );

  const handleAddToCart = useCallback(
    (item: any) => {
      const cartItem = {
        id: item.id,
        name: item.item_name,
        price: item.price,
        quantity: 1,
        image: item.images?.length > 0 ? IMAGE_URL + item.images[0] : ImagePath.item1,
      };
      dispatch(addToCart(cartItem));
      ToastAndroid.show(`${item.item_name} added to cart!`, ToastAndroid.SHORT);
    },
    [dispatch]
  );

  const handleLoadMore = useCallback(() => {
    if (!isFetchingMore && currentPage < lastPage) {
      const nextPage = currentPage + 1;
      fetchProducts(nextPage, true);
    }
  }, [isFetchingMore, currentPage, lastPage, fetchProducts]);

  useEffect(() => {
    if (isFocused && shopId) {
      setCurrentPage(1);
      setProducts([]);
      fetchProducts(1, false);
    }
  }, [isFocused, shopId, fetchProducts]);

  const filteredProducts = React.useMemo(() =>
    products.filter((item) =>
      item?.item_name?.toLowerCase().includes(search?.toLowerCase())
    ), [products, search]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const isInCart = cartItems.some((cartItem: any) => cartItem.id === item.id);
      return (
        <View key={item?.id} className="flex-row bg-gray-100 rounded-xl p-4 mb-4 shadow-sm">
          <View className="w-2/5 mr-3 items-center">
            <Image
              source={item?.images?.length > 0 ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1}
              className="w-full h-40 my-auto rounded-lg mb-2"
              resizeMode="cover"
            />
          </View>
          <View className="flex-1">
            {item?.offer && (
              <View className="self-start bg-primary-80 px-2 py-1 rounded-md mb-2">
                <Text className="text-white text-xs font-semibold">{item?.offer}</Text>
              </View>
            )}
            <Text numberOfLines={1} ellipsizeMode='tail' className="text-lg font-semibold text-gray-800">{item?.item_name}</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-500">{item?.category?.name || 'N/A'} •</Text>
              <Text className="text-md font-bold">
                {item?.currency || '₹'}{item?.price}
              </Text>
            </View>
            <Text className="text-sm text-gray-600 mt-1">{item?.unit || 'N/A'}</Text>
            <View className="flex-row items-center mt-1 bg-gray-200 rounded-md px-2 py-1 w-16">
              <AntDesign name="star" color="#FBBF24" size={16} />
              <Text className="ml-1 text-sm text-gray-700">{item?.average_rating || '0'}</Text>
            </View>
            <View className="flex-row items-center justify-start mt-1">
              <Text className="text-sm text-gray-600">Stock Count:</Text>
              <Text className="font-medium text-sm"> {item?.stock_quantity || '0'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (isInCart) {
                  navigation.navigate('CartScreen');
                } else {
                  handleAddToCart(item);
                }
              }}
              className={`mt-2 ${isInCart ? 'bg-green-600' : 'bg-primary-90'} w-full px-3 py-2 rounded-lg`}
            >
              <Text className="text-white text-center text-md font-medium">
                {isInCart ? 'View Cart' : 'Add To Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [toggleLoadingIds, toggleProductStatus, navigation, handleAddToCart, cartItems]
  );

  const renderFooter = useCallback(() => {
    if (isFetchingMore) {
      return (
        <View className="py-4">
          <ActivityIndicator size="large" color="#999" />
        </View>
      );
    }
    if (currentPage < lastPage) {
      return (
        <View className="pb-20">
          <TouchableOpacity
            onPress={handleLoadMore}
            className="bg-primary-90 py-3 px-4 rounded-lg my-4 mx-4"
          >
            <Text className="text-white text-center text-md font-medium">Load More</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [isFetchingMore, currentPage, lastPage, handleLoadMore]);

  return (
    <View className="min-h-[85vh]">
      <View className="flex-row items-center gap-3 mt-4 mb-4">
        <View className="flex-row items-center flex-1 bg-white px-3 py-0.5 border rounded-xl shadow-sm">
          <AntDesign name="search1" color="#6B7280" size={20} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search Item..."
            className="ml-2 flex-1 text-sm text-gray-700"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            setCurrentPage(1);
            setProducts([]);
            fetchProducts(1, false);
          }}
          className="bg-primary-90 p-3 rounded-lg">
          <Icon name="refresh" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center mt-10">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-gray-500 text-lg">No products found</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

export default UsersMenuItems;