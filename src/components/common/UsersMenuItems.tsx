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
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { RootState } from '../../store/store';
import FoodItem from './FoodItem';

const SkeletonLoader = () => (
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

const UsersMenuItems = () => {
  const navigation = useNavigation<any>();
  const route: any = useRoute()
  const shopId = route.params?.shopId;
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

  const handleAddToCart = (item: any) => {
    const cartItem = {
      id: item.id.toString(),
      name: item.item_name,
      price: item.price,
      quantity: 1,
      image: item.images[0] ? IMAGE_URL + item.images[0] : undefined,
      shop_id: item?.shop?.id ?? item?.store_id,
      tax: item?.tax || 0
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
          image: item?.images?.length ? item.images[0] : '',
          shop_id: item?.shop?.id ?? item?.store_id
        },
      ],
    });
  };


  const renderItem = ({ item, index }: { item: any, index: any }) => (
    <View className=''>
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
        isVegetarian={item.isVegetarian || false}
        isAvailable={item.is_available !== false}
        onAddToCart={() => handleAddToCart}
        handlePlaceOrder={handlePlaceOrder}
        maxQuantity={10}
        item={item}
      />
    </View>
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
            <Text style={{fontFamily:'Raleway-Regular'}} className="text-white text-center text-md font-medium">Load More</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [isFetchingMore, currentPage, lastPage, handleLoadMore]);

  return (
    <View className="px-2">
      <View className="flex-row items-center gap-3 mt-4 mb-2 px-3">
        <View className="flex-row items-center flex-1 bg-white px-3 py-0.5 border border-gray-300 rounded-xl shadow-sm">
          <AntDesign name="search1" color="#6B7280" size={20} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search Item..."
            className="ml-2 flex-1 text-sm  text-gray-700"
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
        <>
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </>

      ) : filteredProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center mt-10 px-4">
          <Text style={{fontFamily:'Raleway-Regular'}} className="text-gray-500 text-lg">No products found</Text>
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