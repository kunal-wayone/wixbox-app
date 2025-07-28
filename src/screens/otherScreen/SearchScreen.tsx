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
  ScrollView,
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
import FoodItem from '../../components/common/FoodItem';
import Shop from '../../components/common/Shop';
import { SafeAreaView } from 'react-native-safe-area-context';



const availableTags = [
  { id: 'spicy', label: 'Spicy 🌶️' },
  { id: 'bestseller', label: 'Bestseller ⭐' },
  { id: 'hot', label: 'Hot 🔥' },
  { id: 'fresh', label: 'Fresh 🥗' },
  { id: 'gluten_free', label: 'Gluten-Free 🌾' },
  { id: 'vegan', label: 'Vegan 🌱' },
];


const SearchScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const route = useRoute<any>();
  const query = route.params?.query || '';
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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
      shop_id: item?.shop?.id ?? item?.store_id,
      tax: item?.tax || 0
    };
    dispatch(addToCart(cartItem));
    ToastAndroid.show(`${item.item_name} added to cart`, ToastAndroid.SHORT);
  };


  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const filteredItems = dishes.filter(item => {
    const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => item?.tags?.includes(tag));
    return matchesTags;
  });



  useEffect(() => {
    if (isFocused) {
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
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white">Load More</Text>
        </TouchableOpacity>
        {loadingMore && <ActivityIndicator size="small" className="mt-2" />}
      </View>
    )
  );


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
        isVegetarian={item.isVegetarian || false}
        isAvailable={item.is_available !== false}
        onAddToCart={() => handleAddToCart}
        handlePlaceOrder={handlePlaceOrder}
        maxQuantity={10}
        item={item}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-white">
        <View className="flex-1">
          {/* Back Button */}
          <TouchableOpacity className="ml-4 mt-3" onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          {/* Search Bar */}
          <View className="flex-row items-center gap-2 mb-4 mx-4 rounded-xl px-3 mt-4 bg-gray-100 border border-gray-300">
            <Text>🍝</Text>
            <TextInput
              className="flex-1 ml-2 text-base text-gray-700"
              placeholder="Search for food or restaurants"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              style={{ fontFamily: 'Ralewat-Regular' }}
              onSubmitEditing={() => handleSearch(active)}
            />
            <Ionicons name="search" size={20} color="gray" />
          </View>



          {active === "product" && <ScrollView
            horizontal
            className="px-4  "
            style={{ maxHeight: "6%", minHeight: "6%", }}
            contentContainerStyle={{ maxHeight: "100%", minHeight: "100%", }}

            showsHorizontalScrollIndicator={false}
          >
            {availableTags.map(tag => (
              <TouchableOpacity
                key={tag.id}
                onPress={() => toggleTag(tag.id)}
                className={`rounded-full px-3 py-1 h-8 mr-2 border border-gray-300 ${selectedTags.includes(tag.id) ? 'bg-green-600' : 'bg-white'
                  }`}
              >
                <Text style={{ fontFamily: 'Raleway-Regular' }} className={`text-sm ${selectedTags.includes(tag.id) ? 'text-white' : 'text-gray-900'}`}>
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          }
          {/* Tabs */}
          <View className="flex-row gap-4 mx-4  mb-2">
            <TouchableOpacity
              onPress={() => handleSearch('product')}
              className={`pb-1 ${active === "product" ? "border-b-2 border-primary-100" : ""}`}
            >
              <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-md ">Dishes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleSearch('shop')}
              className={`pb-1 ${active === "shop" ? "border-b-2 border-primary-100" : ""}`}
            >
              <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-md ">Restaurants</Text>
            </TouchableOpacity>
          </View>

          {/* Content List */}
          {isLoading ? (
            <ActivityIndicator size="large" className="mt-20" />
          ) : active === "shop" ? (
            <FlatList
              data={restaurants}
              keyExtractor={(item: any) => item?.id?.toString()}
              renderItem={(store: any) => (
                <View key={store?.item?.id}>
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
                  />
                </View>
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
              data={filteredItems}
              keyExtractor={(item: any) => item.id.toString()}
              renderItem={renderItem}
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
    </SafeAreaView>
  );
};

export default SearchScreen;
