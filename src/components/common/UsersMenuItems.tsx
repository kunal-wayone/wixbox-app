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
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import { addToCart } from '../../store/slices/cartSlice'; // Import cart actions
import { RootState } from '../../store'; // Adjust path to your store

// Skeleton Loader Component
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
  const dispatch = useDispatch(); // Initialize Redux dispatch
  const cartItems = useSelector((state: RootState) => state.cart.items); // Access cart items from Redux store
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [toggleLoadingIds, setToggleLoadingIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const flatListRef = useRef<FlatList>(null);

  // Fetch menu items from server
  const fetchProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (page === 1) setIsLoading(true);
      else setIsFetchingMore(true);

      const response: any = await Fetch(
        `/user/shop-menu-items?shop_id=${shopId}&page=${page}`,
        {},
        5000
      );

      if (!response.success) throw new Error('Failed to fetch products');

      setLastPage(response.pagination.last_page);
      setProducts((prev) =>
        append ? [...prev, ...response.menu_items] : response.menu_items || []
      );
    } catch (error: any) {
      console.error('fetchProducts error:', error.message);
      ToastAndroid.show(
        error?.message || 'Failed to load products.',
        ToastAndroid.SHORT
      );
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  }, [shopId]);

  // Toggle product status
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
            item.id === id ? { ...item, status: currentStatus ? 0 : 1 } : item)
        );

        ToastAndroid.show('Status updated successfully!', ToastAndroid.SHORT);
        return response.data;
      } catch (error: any) {
        console.error('toggleProductStatus error:', error.message);
        ToastAndroid.show(
          error?.message || 'Failed to toggle status.',
          ToastAndroid.SHORT
        );
        throw error;
      } finally {
        setToggleLoadingIds((prev) => prev.filter((itemId) => itemId !== id));
      }
    },
    []
  );

  // Handle add to cart
  const handleAddToCart = useCallback(
    (item: any) => {
      const cartItem = {
        id: item.id,
        name: item.item_name,
        price: item.price,
        quantity: 1, // Default quantity
        image: item.images?.length > 0 ? IMAGE_URL + item.images[0] : ImagePath.item1,
      };
      dispatch(addToCart(cartItem));
      ToastAndroid.show(`${item.item_name} added to cart!`, ToastAndroid.SHORT);
    },
    [dispatch]
  );

  // Handle scroll to load more
  const handleLoadMore = useCallback(() => {
    if (!isFetchingMore && currentPage < lastPage) {
      setCurrentPage((prev) => {
        const nextPage = prev + 1;
        fetchProducts(nextPage, true);
        return nextPage;
      });
    }
  }, [isFetchingMore, currentPage, lastPage, fetchProducts]);

  // Reset and fetch on focus or shopId change
  useEffect(() => {
    if (isFocused) {
      setCurrentPage(1);
      setProducts([]);
      fetchProducts(1, false);
    }
  }, [isFocused, shopId, fetchProducts]);

  // Memoized filtered products
  const filteredProducts = React.useMemo(() =>
    products.filter((item) =>
      item?.item_name?.toLowerCase().includes(search?.toLowerCase())
    ), [products, search]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      const isInCart = cartItems.some((cartItem) => cartItem.id === item.id);
      return (
        <View key={item?.id} className="flex-row bg-gray-100 rounded-xl p-4 mb-4 shadow-sm">
          <View className="w-2/5 mr-3 items-center">
            <Image
              source={item?.images?.length > 0 ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1}
              className="w-full h-40 rounded-lg mb-2"
              resizeMode="cover"
            />
            <View className="flex-row items-center h-10 hidden">
              <Text className="text-xs text-gray-500 mr-2">Status</Text>
              <View className='w-1/2'>
                {toggleLoadingIds.includes(item.id) ? (
                  <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 8 }} />
                ) : (
                  <Switch
                    value={item?.status === 1}
                    onValueChange={() => toggleProductStatus(item.id, item.status === 1)}
                    disabled={toggleLoadingIds.includes(item.id)}
                  />
                )}
              </View>
            </View>
          </View>
          <View className="flex-1">
            {item?.offer && (
              <View className="self-start bg-primary-80 px-2 py-1 rounded-md mb-2">
                <Text className="text-white text-xs font-semibold">{item?.offer}</Text>
              </View>
            )}
            <Text className="text-lg font-semibold text-gray-800">{item?.item_name}</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-gray-500">{item?.category?.name || 'N/A'} •</Text>
              <Text className="text-md font-bold">
                {item?.currency || '₹'}
                {item?.price}
              </Text>
            </View>
            <Text className="text-sm text-gray-600 mt-1">{item?.unit || 'N/A'}</Text>
            <View className="flex-row items-center mt-1 bg-gray-200 rounded-md px-2 py-1 w-16">
              <AntDesign name="star" color="#FBBF24" size={16} />
              <Text className="ml-1 text-sm text-gray-700">{item?.average_rating || '0'}</Text>
            </View>
            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-sm text-gray-600">Stock Count:</Text>
              <Text className="font-semibold">{item?.stock_quantity || '0'}</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (isInCart) {
                  navigation.navigate('AddOrderScreen', { shopId: shopId }); // Navigate to cart if item is already in cart
                } else {
                  handleAddToCart(item);
                }
              }}
              className={`mt-2 ${isInCart ? 'bg-green-500' : 'bg-primary-90'} w-full px-3 py-2 rounded-lg`}
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

  const renderFooter = () => (
    <View className="pb-20">
      {isFetchingMore ? (
        <>
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </>
      ) : null}
    </View>
  );

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
          onPress={() => fetchProducts(1, false)}
          className="bg-primary-90 p-3 rounded-lg"
        >
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
          initialNumToRender={10}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

export default UsersMenuItems;