import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ToastAndroid,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ImagePath } from '../../constants/ImagePath';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { RootState } from '../../store/store';

const { width } = Dimensions.get('window');

const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const route = useRoute<any>();
  const query = route.params?.query || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [active, setActive] = useState<'product' | 'shop'>('product');
  const [dishes, setDishes] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const fetchSearchResults = useCallback(async (q: any, type: any, p = 1, append = false) => {
    if (p === 1 && !refreshing) setIsLoading(true);
    else setLoadingMore(true);

    try {
      const response: any = await Fetch(`/user/all-filter?name=${q}&type=${type}&page=${p}&per_page=10`, {}, 5000);

      if (!response?.success) {
        ToastAndroid.show("Failed to fetch search results", ToastAndroid.SHORT);
        return;
      }

      setLastPage(response?.pagination?.last_page || 1);

      const newData = type === 'shop'
        ? response?.data?.shops?.shop || []
        : response?.data?.products?.products || [];

      if (type === 'shop') {
        setRestaurants(prev => append ? [...prev, ...newData] : newData);
      } else {
        setDishes(prev => append ? [...prev, ...newData] : newData);
      }

    } catch (err) {
      ToastAndroid.show("Something went wrong", ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  const handleSearch = (tab: any) => {
    setActive(tab);
    setPage(1);
    fetchSearchResults(searchQuery, tab, 1, false);
  };

  const handleLoadMore = () => {
    if (!loadingMore && page < lastPage) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSearchResults(searchQuery, active, nextPage, true);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchSearchResults(searchQuery, active, 1, false);
  };

  const handleAddToCart = (item: any) => {
    const cartItem = {
      id: item.id.toString(),
      name: item.item_name,
      price: item.price,
      quantity: 1,
      image: item.images[0] ? IMAGE_URL + item.images[0] : undefined,
    };
    dispatch(addToCart(cartItem));
    ToastAndroid.show(`${item.item_name} added to cart`, ToastAndroid.SHORT);
  };

  useEffect(() => {
    if (isFocused && query.trim()) {
      fetchSearchResults(query, active, 1, false);
      navigation.setParams({ query: '' });
    }
  }, [isFocused]);

  const renderLoadMoreButton = () => (
    page < lastPage && (
      <View className="my-4 items-center">
        <TouchableOpacity
          className="bg-primary-80 rounded-lg px-6 py-2"
          onPress={handleLoadMore}
        >
          <Text className="text-white">Load More</Text>
        </TouchableOpacity>
        {loadingMore && <ActivityIndicator size="small" className="mt-2" />}
      </View>
    )
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
      <View className="flex-1">
        {/* Back Button */}
        <TouchableOpacity className="ml-4 mt-4" onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Search Bar */}
        <View className="flex-row items-center mx-4 mt-4 border border-gray-300 bg-gray-100 rounded-xl px-3 py-1">
          <Ionicons name="search" size={20} color="gray" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-700"
            placeholder="Search for food or restaurants"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(active)}
          />
        </View>

        {/* View Cart Icon */}
        <TouchableOpacity
          className="absolute top-4 right-4 bg-primary-80 rounded-full p-2 hidden "
          onPress={() => navigation.navigate('CartScreen')}
        >
          <Ionicons name="cart" size={24} color="white" />
          {cartItems.length > 0 && (
            <View className="absolute -top-1 -right-1 bg-red-500 rounded-full h-5 w-5 items-center justify-center">
              <Text className="text-white text-xs">{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Tabs */}
        <View className="flex-row gap-4 mx-4 mt-4 mb-2">
          <TouchableOpacity
            onPress={() => handleSearch('product')}
            className={`pb-1 ${active === "product" ? "border-b-2 border-primary-100" : ""}`}
          >
            <Text className="text-md font-semibold">Dishes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSearch('shop')}
            className={`pb-1 ${active === "shop" ? "border-b-2 border-primary-100" : ""}`}
          >
            <Text className="text-md font-semibold">Restaurants</Text>
          </TouchableOpacity>
        </View>

        {/* Content List */}
        {isLoading ? (
          <ActivityIndicator size="large" className="mt-20" />
        ) : active === "shop" ? (
          <FlatList
            data={restaurants}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }: any) => (
              <TouchableOpacity onPress={() => navigation.navigate("ShopDetailsScreen", { shopId: item.id })}>
                <View className="rounded-xl overflow-hidden mb-4 mx-4">
                  <ImageBackground
                    source={item?.restaurant_images?.[0] ? { uri: IMAGE_URL + item.restaurant_images[0] } : ImagePath.restaurant1}
                    className="h-72 w-full justify-end"
                    imageStyle={{ borderRadius: 16 }}
                  >
                    <View className="bg-white p-3 mx-2 mb-2 rounded-xl">
                      <Text className="text-base font-semibold" numberOfLines={1}>{item.restaurant_name}</Text>
                      <Text className="text-xs text-gray-600" numberOfLines={1}>{item.about_business}</Text>
                    </View>
                  </ImageBackground>
                </View>
              </TouchableOpacity>
            )}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderLoadMoreButton}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : (
          <FlatList
            data={dishes}
            keyExtractor={(item: any) => item.id.toString()}
            renderItem={({ item }: any) => {
              const isInCart = cartItems.some((cartItem: any) => cartItem.id == item.id);
              return (
                <View className="flex-row bg-primary-10 rounded-xl p-4 mb-4 mx-4 gap-4">
                  <TouchableOpacity onPress={() => navigation.navigate('ProductDetailsScreen', { productId: item.id })}>
                    <Image
                      source={{ uri: IMAGE_URL + item.images[0] }}
                      className="w-28 h-28 rounded-xl"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                  <View className="flex-1">
                    <Text className="text-xl font-bold">{item?.item_name}</Text>
                    <Text className="text-gray-500">{item?.category?.name}</Text>
                    <View className="flex-row justify-between items-center mt-1">
                      <Text className="text-base font-semibold text-gray-700">₹{item?.price}</Text>
                      <View className="flex-row items-center">
                        <MaterialIcons name="star" size={16} color="#FFC727" />
                        <Text className="text-sm text-gray-600">{item?.average_rating || 0}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (isInCart) {
                          navigation.navigate('CartScreen');
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
              )
            }}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderLoadMoreButton}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default SearchScreen;
