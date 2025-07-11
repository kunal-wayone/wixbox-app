import React, { useCallback, useEffect, useState } from 'react';
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

const Menu = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<any[]>([]);
  const [toggleLoadingIds, setToggleLoadingIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Fetch menu items from server
  const fetchProducts = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setIsLoading(!append);
      setIsLoadingMore(append);
      const response: any = await Fetch(`/user/menu-items?per_page=5&page=${page}`, {}, 5000);
      console.log(response, "fetch items");
      if (!response.success) throw new Error('Failed to fetch products');
      
      const { menu_items, current_page, last_page } = response.data;
      setProducts((prev) => (append ? [...prev, ...menu_items] : menu_items));
      setCurrentPage(current_page);
      setLastPage(last_page);
    } catch (error: any) {
      console.error('fetchProducts error:', error.message);
      ToastAndroid.show(
        error?.message || 'Failed to load products.',
        ToastAndroid.SHORT
      );
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Load more products
  const loadMoreProducts = useCallback(() => {
    if (currentPage < lastPage && !isLoadingMore) {
      fetchProducts(currentPage + 1, true);
    }
  }, [currentPage, lastPage, isLoadingMore, fetchProducts]);

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

        // Update products state optimistically
        setProducts((prevProducts) =>
          prevProducts.map((item) =>
            item.id === id ? { ...item, status: currentStatus ? 0 : 1 } : item
          )
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

  useEffect(() => {
    if (isFocused) {
      fetchProducts(1);
    }
  }, [isFocused, fetchProducts]);

  // Memoized filtered products
  const filteredProducts = React.useMemo(() =>
    products.filter((item) =>
      item?.item_name?.toLowerCase().includes(search?.toLowerCase())
    ),
    [products, search]
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <View key={item?.id} className="flex-row bg-gray-100 rounded-xl p-4 mb-4 shadow-sm">
        {/* Left: Image + Switch */}
        <View className="w-2/5 mr-3 items-center">
          <Image
            source={item?.images?.length > 0 ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1}
            className="w-full h-40 rounded-lg mb-2"
            resizeMode="cover"
          />
          <View className="flex-row items-center h-10">
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

        {/* Right: Content */}
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
            <Text className="ml-1 text-sm text-gray-700">{item?.rating || '0'}</Text>
          </View>
          <View className="flex-row items-center justify-between mt-1">
            <Text className="text-sm text-gray-600">Stock Count:</Text>
            <Text className="font-semibold">{item?.stock_quantity || '0'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddProductScreen', { productId: item?.id })}
            className="mt-2 bg-primary-90 w-full px-3 py-2 rounded-lg"
          >
            <Text className="text-white text-center text-md font-medium">
              Edit Item Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [toggleLoadingIds, toggleProductStatus, navigation]
  );

  const renderFooter = useCallback(() => {
    if (isLoadingMore) {
      return (
        <View className="py-4">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      );
    }
    if (currentPage < lastPage) {
      return (
        <TouchableOpacity
          onPress={loadMoreProducts}
          className="bg-primary-90 py-3 px-4 rounded-lg my-4 mx-4"
        >
          <Text className="text-white text-center text-md font-medium">Load More</Text>
        </TouchableOpacity>
      );
    }
    return null;
  }, [isLoadingMore, currentPage, lastPage, loadMoreProducts]);

  return (
    <View className="min-h-[85vh] bg-gray-50">
      {/* Search & Add Button */}
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
          onPress={() => navigation.navigate('AddProductScreen')}
          className="bg-primary-90 p-3 rounded-lg"
        >
          <Icon name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center mt-10">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View className="flex-1 justify-center items-center mt-10">
          <Text className="text-gray-500 text-lg">No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

export default Menu;