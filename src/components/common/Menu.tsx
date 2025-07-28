import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import Switch from './Switch';
import { addToCart } from '../../store/slices/cartSlice';
import { useDispatch } from 'react-redux';

interface Product {
  id: string;
  item_name: string;
  category?: { name?: string };
  images?: string[];
  price: number;
  currency?: string;
  rating?: string;
  unit?: string;
  status: number;
  offer?: string;
  stock_quantity?: number;
}

const Menu = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const dispatch = useDispatch<any>()
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [toggleLoadingIds, setToggleLoadingIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchProducts = useCallback(async (page = 1, append = false) => {
    try {
      setIsLoading(!append);
      setIsLoadingMore(append);

      const response: any = await Fetch(`/user/menu-items?per_page=5&page=${page}`, {}, 5000);
      if (!response.success) throw new Error('Failed to fetch products');

      const { menu_items, current_page, last_page } = response.data;
      setProducts(prev => (append ? [...prev, ...menu_items] : menu_items));
      setCurrentPage(current_page);
      setLastPage(last_page);
    } catch (error: any) {
      ToastAndroid.show(error?.message || 'Failed to load products.', ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  const loadMoreProducts = useCallback(() => {
    if (currentPage < lastPage && !isLoadingMore) {
      fetchProducts(currentPage + 1, true);
    }
  }, [currentPage, lastPage, isLoadingMore, fetchProducts]);

  const toggleProductStatus = useCallback(async (id: string, currentStatus: boolean) => {
    try {
      setToggleLoadingIds(prev => [...prev, id]);

      const response: any = await Fetch(`/user/menu-items/${id}/active-inactive`, {
        status: currentStatus ? 0 : 1,
      }, 5000);

      if (!response.success) throw new Error('Failed to toggle status');

      setProducts(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status: currentStatus ? 0 : 1 } : item
        )
      );

      ToastAndroid.show('Status updated successfully!', ToastAndroid.SHORT);
    } catch (error: any) {
      ToastAndroid.show(error?.message || 'Failed to toggle status.', ToastAndroid.SHORT);
    } finally {
      setToggleLoadingIds(prev => prev.filter(itemId => itemId !== id));
    }
  }, []);

  useEffect(() => {
    if (isFocused) fetchProducts(1);
  }, [isFocused, fetchProducts]);

  const filteredProducts = useMemo(
    () =>
      products.filter(item =>
        item?.item_name?.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );


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


  const renderItem = ({ item }: { item: Product }) => {
    const isToggling = toggleLoadingIds.includes(item.id);
    const imageSource = item.images?.[0] ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1;
    console.log(item)
    return (
      <View
        key={item.id}
        className="bg-gray-100 border border-gray-200 rounded-xl p-3 mr-4"
        style={{ width: 260 }}
      >
        <Image
          source={imageSource}
          className="w-full h-40 rounded-lg mb-2"
          resizeMode="cover"
        />

        <View className="flex-row items-center mb-2">

        </View>

        {item.offer && (
          <View className="bg-primary-80 px-2 py-1 rounded-md mb-2 self-start">
            <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-white text-xs">{item.offer}</Text>
          </View>
        )}

        <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-lg text-gray-800">{item.item_name}</Text>

        <View className="flex-row justify-between items-center mt-1">
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-500">
            {item.category?.name || 'N/A'} •
          </Text>
          <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-md">
            {item.currency || '₹'}
            {item.price}
          </Text>
        </View>

        {/* <Text style={{fontFamily:'Raleway-Regular'}} className="text-sm text-gray-600 mt-1">{item.unit || 'N/A'}</Text> */}
        <View className='flex-row justify-between items-center '>
          <View className="flex-row items-center mt-1 bg-gray-200 rounded-md px-2 py-1 w-16">
            <AntDesign name="star" color="#FBBF24" size={16} />
            <Text style={{ fontFamily: 'Raleway-Regular' }} className="ml-1 text-sm text-gray-700">{item.rating || '0'}</Text>
          </View>

          {isToggling ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Switch
              value={item.status === 1}
              onValueChange={() => toggleProductStatus(item.id, item.status === 1)}
              size={"small"}
            />
          )}
        </View>

        <View className="flex-row justify-between mt-1">
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600">Stock Count:</Text>
          <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="">{item.stock_quantity || '0'}</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('AddProductScreen', { productId: item.id })}
          className="mt-2 bg-primary-90 px-3 py-2 rounded-lg"
        >
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white text-center font-medium">Edit Item Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
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
          className="bg-primary-90 py-3 px-4 rounded-lg my-4 ml-4"
        >
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white text-center font-medium">Load More</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View className="bg-gray-50 pt-4">
      {/* Search + Add */}
      <View className="flex-row items-center gap-3 mb-4">
        <View className="flex-row items-center flex-1 bg-white px-3 py-1 border rounded-xl shadow-sm">
          <AntDesign name="search1" color="#6B7280" size={20} />
          <Text style={{ fontFamily: 'Raleway-Regular' }} Input
            value={search}
            onChangeText={setSearch}
            placeholder="Search Item..."
            className="ml-2 flex-1 text-sm text-gray-700"
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
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-500 text-lg">No products found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16, paddingBottom: 20 }}
          ListFooterComponent={renderFooter}
        />
      )}
    </View>
  );
};

export default Menu;
