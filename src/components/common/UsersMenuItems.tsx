import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
  ScrollView,
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
import Switch from './Switch';
// import Slider from '@react-native-community/slider';


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
  const shop_info = route.params?.shop_info;
  const shopId = shop_info?.id
  const isFocused = useIsFocused();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [categoryData, setCategoryData] = useState([])
  const [selectedCategory, setSelectedCategory] = useState({})
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false)
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [toggleLoadingIds, setToggleLoadingIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const flatListRef = useRef<FlatList>(null);
  const [isVegetarian, setIsVegetarian] = useState(false)
  const [tags, setTags] = useState('')
  const [min_price, setMin_price] = useState(0);
  const [max_price, setMax_price] = useState(1000); // Adjust upper limit as needed
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [availableTags, setAvailableTags] = useState<string[]>(['vegan', 'spicy', 'sweet', 'gluten-free',]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  console.log(shop_info)
  const fetchProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!shopId) return;
    try {
      if (page === 1) setIsLoading(true);
      else setIsFetchingMore(true);

      const categoryParam = selectedCategory?.id ? `&category_id=${selectedCategory.id}` : '';
      const vegParam = isVegetarian ? `&isVegetarian=1` : '';
      // const priceParams =
      //   min_price > 0 || max_price > 0
      //     ? `&min_price=${min_price}&max_price=${max_price}`
      //     : '';
      // const tagParams = selectedTags.length
      //   ? selectedTags.map((tag) => `&tags[]=${encodeURIComponent(tag)}`).join('')
      //   : '';


      const url = `/user/shop-menu-items?shop_id=${shopId}${categoryParam}${vegParam}`;

      const response: any = await Fetch(url, {}, 5000);

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
  }, [shopId, selectedCategory, isVegetarian, max_price, tags]);


  const fetchCategories = async (
    setLoading: (loading: boolean) => void,
  ): Promise<any[]> => {
    try {
      setLoading(true);
      const response: any = await Fetch(`/user/food/category`, {}, 5000);
      console.log(response)
      if (!response.success) throw new Error('Failed to fetch categories');
      setCategoryData(response?.data)
      return response.data;
    } catch (error: any) {
      ToastAndroid.show(error?.message || 'Failed to load categories.', ToastAndroid.SHORT);
      return [];
    } finally {
      setLoading(false);
    }
  };


  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };


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
  }, [isFocused, shopId, selectedCategory, isVegetarian, min_price, max_price, selectedTags]);


  useEffect(() => {
    if (isFocused && shopId) {
      fetchCategories(setIsCategoryLoading)
    }
  }, [isFocused, shopId]);

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



  const renderCategoryItem = ({ item }: { item: any }) => (
    <View className="items-center bg-gray-100 m-2 rounded-xl shadow-md">
      <TouchableOpacity
        onPress={() => setSelectedCategory(item)}
        disabled={isLoading}
        className="relative"
      >
        <Image
          source={{ uri: `${IMAGE_URL}${item.image}` }}
          resizeMode="cover"
          className="h-20 w-20 rounded-xl"
        />
        <View className="absolute inset-0 bg-black/50 rounded-xl" />
        <Text style={{ fontFamily: 'Raleway-SemiBold' }} numberOfLines={1} ellipsizeMode='tail' className="absolute bottom-2 left-2 right-2 text-white text-sm  text-center">
          {item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );


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
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white text-center text-md font-medium">Load More</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [isFetchingMore, currentPage, lastPage, handleLoadMore]);

  return (
    <View className="">
      <View className="bg-white  shadow-md overflow-hidden">
        {/* Banner image */}
        {shop_info?.restaurant_images?.length > 0 && (
          <Image
            source={{ uri: `${IMAGE_URL}/${shop_info?.restaurant_images[0]}` }}
            className="w-full h-40"
            resizeMode="cover"
          />
        )}

        <View className="p-4 absolute top-0 bg-black/50 w-full">
          {/* Restaurant Name */}
          <Text className="text-lg font-bold text-gray-50 mb-1">
            {shop_info?.restaurant_name}
          </Text>

          {/* Address & Shop Type */}
          <View className="flex-row items-center mb-2 ">
            <Icon name="location-on" size={16} color="#fff" />
            <Text className="ml-1 text-sm text-gray-50">
              {shop_info?.address}, {shop_info?.city}
            </Text>
          </View>

          {/* Cuisine Tags */}
          <View className="flex-row flex-wrap gap-2 mb-3 hidden">
            {shop_info?.shop_category?.map((cat, idx) => (
              <View key={idx} className="bg-gray-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-gray-100">{cat.name}</Text>
              </View>
            ))}
          </View>

          {/* Payment + Dine-in Tags */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            {shop_info?.payment_cash && (
              <View className="bg-green-100 px-2 py-1 rounded-full flex-row items-center">
                <Icon name="money" size={14} color="#2E7D32" />
                <Text className="text-xs text-green-800 ml-1">Cash</Text>
              </View>
            )}
            {shop_info?.payment_card && (
              <View className="bg-blue-100 px-2 py-1 rounded-full flex-row items-center">
                <Icon name="credit-card" size={14} color="#1565C0" />
                <Text className="text-xs text-blue-800 ml-1">Card</Text>
              </View>
            )}
            {shop_info?.payment_upi && (
              <View className="bg-purple-100 px-2 py-1 rounded-full flex-row items-center">
                <Icon name="qr-code" size={14} color="#6A1B9A" />
                <Text className="text-xs text-purple-800 ml-1">UPI</Text>
              </View>
            )}
            {shop_info?.dine_in_service && (
              <View className="bg-orange-100 px-2 py-1 rounded-full flex-row items-center">
                <Icon name="restaurant" size={14} color="#EF6C00" />
                <Text className="text-xs text-orange-800 ml-1">Dine-in</Text>
              </View>
            )}
          </View>

          {/* Rating and Shop Type */}
          <View className="flex-row justify-between gap-4 items-center">
            {/* Rating */}
            {shop_info?.average_rating > 0 ? (
              <View className="flex-row items-center">
                <Icon name="star" size={16} color="#FFC107" />
                <Text className="ml-1 text-sm font-semibold text-gray-50">
                  {shop_info.average_rating.toFixed(1)}
                </Text>
              </View>
            ) : (
              <View className='flex-row items-center gap-2'>
                <Icon name="star" size={16} color="#FFC107" />
                <Text className='text-white'>
                  0
                </Text>
              </View>
            )}

            {/* Shop Type */}
            {shop_info?.shop_type?.name && (
              <View className="bg-red-100 px-2 py-1 rounded-full">
                <Text className="text-xs text-red-700 capitalize">
                  {shop_info.shop_type.name}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className="flex-row items-center gap-3 mt-4 mb-0 px-5">
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




      <View className="px-6 py-2">
        <View className="flex-row items-center justify-between hidden">

          <View className=" w-4/5 hidden">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 8 }}
              className="flex-row gap-2"
            >
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    className={`px-4 py-0.5 rounded-full border 
            ${isSelected ? 'bg-primary-90 border-primary-90' : 'bg-white border-gray-300'}`}
                  >
                    <Text
                      className={`${isSelected ? 'text-white' : 'text-gray-700'} text-sm`}
                      style={{ fontFamily: 'Raleway-Regular' }}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
          <View className='flex-row gap-2 items-center justify-center '>
            <Text className='text-sm'>{isVegetarian ? "Veg" : "Veg"}</Text>
            <Switch
              value={isVegetarian}
              onValueChange={(value) => setIsVegetarian(value)}
              size={'small'}
            />
          </View>
        </View>

        <View className="mb-4 hidden">
          <Text style={{ fontFamily: 'Raleway-Medium' }} className="text-sm mb-2">Price Range</Text>

          <View className="flex-row justify-between mb-2">
            <Text className="text-sm">₹{priceRange[0]}</Text>
            <Text className="text-sm">₹{priceRange[1]}</Text>
          </View>

          {/* <Slider
            minimumValue={0}
            maximumValue={2000}
            step={10}
            value={priceRange[0]}
            onValueChange={(value) => {
              setPriceRange([value, priceRange[1]]);
            }}
            onSlidingComplete={() => {
              setMin_price(priceRange[0]);
              setMax_price(priceRange[1]);
            }}
          />

          <Slider
            minimumValue={0}
            maximumValue={2000}
            step={10}
            value={priceRange[1]}
            onValueChange={(value) => {
              setPriceRange([priceRange[0], value]);
            }}
            onSlidingComplete={() => {
              setMin_price(priceRange[0]);
              setMax_price(priceRange[1]);
            }}
          /> */}
        </View>



      </View>

      {/* Categories Section */}
      <View className="px-4">
        <View className="flex-row justify-between items-center ">
          <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-xl ">Categories</Text>
          <View className='flex-row gap-2 items-center justify-center '>
            <Text className='text-xs'>{isVegetarian ? "Veg" : "Veg"}</Text>
            <Switch
              value={isVegetarian}
              onValueChange={(value) => setIsVegetarian(value)}
              size={'small'}
            />
          </View>
        </View>
        {isLoading && !categoryData?.length ? (
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-500 text-center">Loading categories...</Text>
        ) : categoryData?.length === 0 ? (
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-500 text-center">No categories added yet</Text>
        ) : (
          <View className='flex-row items-center'><View className="items-center bg-gray-100 m-2 rounded-xl shadow-md">
            <TouchableOpacity
              onPress={() => setSelectedCategory({})}
              disabled={isLoading}
              className="relative"
            >
              <Image
                source={ImagePath.item3}
                resizeMode="cover"
                className="h-20 w-20 rounded-xl" />
              <View className="absolute inset-0 bg-black/50 rounded-xl" />
              <Text style={{ fontFamily: 'Raleway-SemiBold' }} numberOfLines={1} ellipsizeMode='tail' className="absolute bottom-2 left-2 right-2 text-white text-md text-center">
                {"All"}
              </Text>
            </TouchableOpacity>
          </View><FlatList
              data={categoryData}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              className="" /></View>
        )}
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
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-500 text-lg">No products found</Text>
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
          className='px-2'
        />
      )}
    </View>
  );
};

export default UsersMenuItems;