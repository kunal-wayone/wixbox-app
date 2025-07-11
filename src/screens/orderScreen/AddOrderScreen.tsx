import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Dimensions, ToastAndroid, ActivityIndicator } from 'react-native';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '../../store/slices/cartSlice';
import { ImagePath } from '../../constants/ImagePath';
import { RootState } from '../../store/store';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { useCallback, useEffect, useState } from 'react';

const AddOrderScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const route = useRoute<any>();
  const shopId = route.params?.shopId || null;
  const isFocused = useIsFocused();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartVisible, setIsCartVisible] = useState(false);
  const itemsPerPage = 10;

  const fetchProducts = useCallback(async (pageNum: number, append = false) => {
    if (pageNum > totalPages && append) return;

    const endpoint = shopId
      ? `/user/menu-items?store_id=${shopId}&page=${pageNum}&per_page=${itemsPerPage}`
      : `/user/menu-items?page=${pageNum}&per_page=${itemsPerPage}`;

    try {
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);

      const response: any = await Fetch(endpoint, {}, 5000);

      if (!response.success) throw new Error('Failed to fetch products');

      const newProducts = response.data.menu_items || [];
      setProducts(prev => (append ? [...prev, ...newProducts] : newProducts));
      setTotalPages(response.data.last_page || 1);

      if (newProducts.length === 0 && append) {
        ToastAndroid.show('No more products to load.', ToastAndroid.SHORT);
      }
    } catch (error: any) {
      console.error('fetchProducts error:', error);
      ToastAndroid.show(error?.message || 'Failed to load products.', ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [shopId, totalPages]);

  useEffect(() => {
    if (isFocused && page === 1 && products.length === 0) {
      fetchProducts(1);
    }
  }, [isFocused, fetchProducts]);

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  const filteredProducts = products.filter((product: any) =>
    product.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: any) => {
    dispatch(
      addToCart({
        id: product?.id.toString(),
        name: product?.item_name,
        price: parseFloat(product?.price),
        quantity: 1,
        image: product?.images[0] ?? '',
      })
    );
    ToastAndroid.show(`${product?.item_name} added to cart`, ToastAndroid.SHORT);
  };

  const updateQuantity = (id: string, change: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    const newQty = item.quantity + change;
    if (newQty <= 0) {
      dispatch(removeFromCart(id));
      ToastAndroid.show(`${item.name} removed from cart`, ToastAndroid.SHORT);
    } else {
      dispatch(
        addToCart({
          ...item,
          quantity: change,
        })
      );
    }
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{ flex: 1, margin: 8, alignItems: 'center', elevation: 2 }}
      onPress={() => handleAddToCart(item)}>
      <View style={{ height: 140, width: '100%', marginBottom: 10 }}>
        <Image
          source={item.images.length > 0 ? { uri: IMAGE_URL + item.images[0] } : ImagePath.item1}
          style={{ width: '100%', height: '100%', borderRadius: 12 }}
          resizeMode="stretch"
        />
      </View>
      <Text style={{ fontSize: 14, color: '#374151', textAlign: 'center' }}>
        {item?.item_name}
      </Text>
      <Text style={{ fontSize: 12, color: '#6B7280', textAlign: 'center' }}>
        ₹{item?.price}
      </Text>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: any }) => (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginVertical: 8,
        padding: 12,
      }}>
      <Image
        source={item.image ? { uri: IMAGE_URL + item.image } : ImagePath.item1}
        style={{ width: 80, height: 80, borderRadius: 10, marginRight: 12 }}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
          {item?.name}
        </Text>
        <Text style={{ color: '#6B7280', marginBottom: 4 }}>
          ₹{item?.price}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }} className='gap-2'>
          <TouchableOpacity
            className='bg-primary-30'
            style={{
              borderRadius: 6,
              paddingHorizontal: 10,
            }}
            onPress={() => updateQuantity(item.id, -1)}>
            <Text style={{ fontSize: 18 }}>-</Text>
          </TouchableOpacity>
          <Text style={{ color: '#6B7280', marginBottom: 4 }}>
            {item?.quantity}
          </Text>
          <TouchableOpacity
            className='bg-primary-30'
            style={{
              borderRadius: 6,
              paddingHorizontal: 10,
            }}
            onPress={() => updateQuantity(item?.id, 1)}>
            <Text style={{ fontSize: 18 }}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View className="pb-20 flex-row justify-center items-center">
      {page < totalPages && (
        <TouchableOpacity
          className='bg-primary-80 rounded-lg p-2 w-32'
          onPress={handleLoadMore}
          disabled={isLoadingMore}
        >
          <Text className='text-white text-center'>
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Text>
        </TouchableOpacity>
      )}
      {isLoadingMore && (
        <ActivityIndicator size="small" color="#007AFF" style={{ marginLeft: 10 }} />
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      {/* Header */}
      <View
        className='absolute left-2 top-2'
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingBottom: 8,
        }}>
        <TouchableOpacity className='z-50' onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text
        style={{
          textAlign: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          color: '#374151',
          marginBottom: 16,
        }}>
        Add Products
      </Text>

      {/* Search & Cart */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#D1D5DB',
            backgroundColor: '#F3F4F6',
            borderRadius: 10,
            paddingHorizontal: 12,
          }}>
          <Ionicons name="search-outline" size={20} color="#374151" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, fontSize: 16, paddingVertical: 10 }}
            placeholder="Search product"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          onPress={() => setIsCartVisible(true)}
          style={{ backgroundColor: '#B68AD4', padding: 12, borderRadius: 10, marginLeft: 12 }}>
          <Ionicons name="cart-outline" size={24} color="#fff" />
          {cartItems.length > 0 && (
            <View
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                backgroundColor: 'red',
                borderRadius: 10,
                width: 18,
                height: 18,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{ color: '#fff', fontSize: 10 }}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
        Tap to Add Product
      </Text>

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
          renderItem={renderProductItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={renderFooter}
        />
      )}
      {/* Cart Modal */}
      <Modal
        isVisible={isCartVisible}
        onBackdropPress={() => setIsCartVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}>
        <View
          style={{
            height: Dimensions.get('window').height * 0.75,
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 8,
          }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, paddingHorizontal: 8 }}>
            Your Cart
          </Text>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
          />
          <TouchableOpacity
            className='bg-primary-90 p-4 rounded-xl m-2'
            onPress={() => {
              setIsCartVisible(false);
              navigation.navigate('AddCustomerFormScreen', { shopId });
            }}
            disabled={cartItems.length === 0}
          >
            <Text className='text-center text-white'>
              {cartItems.length === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default AddOrderScreen;