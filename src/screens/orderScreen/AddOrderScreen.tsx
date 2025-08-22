import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ToastAndroid,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import { ImagePath } from '../../constants/ImagePath';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, clearCart } from '../../store/slices/cartSlice';

// Type definitions for clarity
interface Product {
  id: string;
  item_name: string;
  price: string | number;
  images: string[];
  shop?: { id: string };
  tax?: string;
}

interface CartState {
  cart: {
    items: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      image?: string;
      shop_id?: string;
      tax?: string;
    }[];
    totalAmount: number;
    totalTax: number;
    totalWithTax: number;
  };
}

const AddOrderScreen = ({ navigation, route }: any) => {
  const shopId = route?.params?.shopId || null;
  const orderData = route?.params?.user || null;
  const dispatch = useDispatch();
  const { items: cartItems, totalWithTax } = useSelector((state: CartState) => state.cart);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCartVisible, setIsCartVisible] = useState(false);
  const itemsPerPage = 10;
  console.log(orderData)
  const fetchProducts = useCallback(
    async (pageNum: number, append = false) => {
      if (pageNum > totalPages && append) return;

      try {
        if (append) setIsLoadingMore(true);
        else setIsLoading(true);

        const response: any = await Fetch('/user/menu-items', {}, 5000);
        console.log(response)
        if (!response.success) throw new Error('Failed to fetch products');

        // Adjust based on actual API response structure
        const newProducts = response.data.menu_items || response.data || [];
        const lastPage = response.data.last_page || 1;

        setProducts(prev => (append ? [...prev, ...newProducts] : newProducts));
        setTotalPages(lastPage);

        if (newProducts.length === 0 && append) {
          ToastAndroid.show('No more products to load.', ToastAndroid.SHORT);
        }
      } catch (error: any) {
        ToastAndroid.show(error?.message || 'Failed to load products.', ToastAndroid.SHORT);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [totalPages]
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  };

  const filteredProducts = products.filter(product =>
    product.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.item_name,
        price: parseFloat(product.price.toString()),
        quantity: 1,
        image: product.images?.[0] || '',
        shop_id: product.shop?.id || shopId || '',
        tax: product.tax || '0',
      })
    );
  };

  const handleUpdateQuantity = (id: string, change: number) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) return;

    if (item.quantity + change <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(
        addToCart({
          ...item,
          quantity: change, // addToCart will increment quantity
        })
      );
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        margin: 8,
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
      }}
      onPress={() => handleAddToCart(item)}
    >
      <Image
        source={
          item?.images?.length > 0 && item?.images[0]
            ? { uri: IMAGE_URL + item.images[0] }
            : ImagePath?.item1
        }
        style={{
          width: '100%',
          height: 130,
          borderRadius: 14,
        }}
        resizeMode="cover"
      />
      <View className="absolute top-0 right-0 left-0 bottom-0 bg-black/10 rounded-xl">
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
          }}
        />
        <View className="mt-auto p-2">
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ fontFamily: 'Raleway-Regular', fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'left' }}
          >
            {item?.item_name}
          </Text>
          <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 13, color: '#fff', marginTop: 2 }}>₹{item?.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: CartState['cart']['items'][0] }) => (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginVertical: 8,
        padding: 12,
      }}
    >
      <Image
        source={item.image ? { uri: IMAGE_URL + item.image } : ImagePath.item1}
        style={{ width: 80, height: 80, borderRadius: 10, marginRight: 12 }}
        resizeMode="cover"
      />
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ fontSize: 13, fontFamily: 'Raleway-Regular', marginBottom: 4 }}
        >
          {item.name}
        </Text>
        <Text style={{ fontFamily: 'Raleway-Regular', color: '#6B7280', marginBottom: 4 }}>₹{item.price}</Text>
        <View
          className="border flex-row items-center justify-center border-gray-100 rounded-lg w-1/2"
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#fafafa',
              borderRadius: 6,
              paddingHorizontal: 10,
            }}
            onPress={() => handleUpdateQuantity(item.id, -1)}
          >
            <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 18, color: '#000' }}>−</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 16, fontWeight: '500', color: '#374151' }}>
            {item.quantity}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#fafafa',
              borderRadius: 6,
              paddingHorizontal: 10,
            }}
            onPress={() => handleUpdateQuantity(item.id, 1)}
          >
            <Text style={{ fontSize: 18, color: '#000', fontFamily: 'Raleway-Regular', }}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={{ paddingBottom: 20, flexDirection: 'row', justifyContent: 'center' }}>
      {page < totalPages && (
        <TouchableOpacity
          style={{ backgroundColor: '#6D28D9', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 10 }}
          onPress={handleLoadMore}
          disabled={isLoadingMore}
        >
          <Text style={{ color: '#fff' }}>{isLoadingMore ? 'Loading...' : 'Load More'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: 18,
              fontFamily: 'Raleway-Regular',
              color: '#374151',
              marginRight: 32,
            }}
          >
            Add Products
          </Text>
        </View>

        {/* Search & Cart */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 16 }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              backgroundColor: '#F9FAFB',
              borderRadius: 12,
              paddingHorizontal: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 1.5,
              elevation: 2,
            }}
          >
            <Ionicons name="search-outline" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, fontSize: 13, fontFamily: 'Raleway-Regular', }}
              placeholder="Search product..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>

          <TouchableOpacity
            onPress={() => setIsCartVisible(true)}
            style={{
              backgroundColor: '#ac94f4',
              padding: 10,
              borderRadius: 12,
              marginLeft: 12,
              position: 'relative',
            }}
          >
            <Ionicons name="cart-outline" size={26} color="#fff" />
            {cartItems.length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  backgroundColor: '#EF4444',
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                }}
              >
                <Text style={{ fontFamily: 'Raleway-Regular', color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                  {cartItems.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontSize: 12,
            fontWeight: '500',
            color: '#374151',
            marginBottom: 12,
            textAlign: 'center',
            opacity: 0.7,
            fontFamily: 'Raleway-Regular',
          }}
        >
          Tap on a product to add to your cart 🛒
        </Text>

        {/* Product List */}
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
            <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 16, color: '#9CA3AF' }}>No products found</Text>
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

        {/* Checkout Button */}
        <TouchableOpacity
          style={{
            backgroundColor: cartItems.length === 0 ? '#d1c4e9' : '#ac94f4',
            padding: 16,
            borderRadius: 16,
            marginVertical: 12,
            marginHorizontal: 8,
          }}
          onPress={() => {
            setIsCartVisible(false);
            navigation.navigate('AddCustomerFormScreen', { shopId, items: cartItems, orderData });
          }}
          disabled={cartItems.length === 0}
        >
          <Text style={{ fontFamily: 'Raleway-Regular', color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600' }}>
            {cartItems.length === 0
              ? 'Cart is Empty'
              : `Proceed to Checkout (₹${totalWithTax.toFixed(2)})`}
          </Text>
        </TouchableOpacity>

        {/* Cart Modal */}
        <Modal
          isVisible={isCartVisible}
          onBackdropPress={() => setIsCartVisible(false)}
          style={{ justifyContent: 'flex-end', margin: 0 }}
        >
          <View
            style={{
              height: Dimensions.get('window').height * 0.75,
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            <Text style={{ fontSize: 16, fontFamily: 'Raleway-Regular', marginBottom: 12, textAlign: 'center' }}>
              🛒 Your Cart
            </Text>

            {cartItems.length === 0 ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 12, color: '#9CA3AF' }}>Your cart is empty</Text>
              </View>
            ) : (
              <>
                <FlatList
                  data={cartItems}
                  renderItem={renderCartItem}
                  keyExtractor={item => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 16 }}
                />
                <TouchableOpacity
                  style={{
                    backgroundColor: '#ac94f4',
                    padding: 16,
                    borderRadius: 16,
                    marginTop: 8,
                  }}
                  onPress={() => {
                    setIsCartVisible(false);
                    navigation.navigate('AddCustomerFormScreen', { shopId, items: cartItems, orderData });
                  }}
                >
                  <Text style={{ fontFamily: 'Raleway-Regular', color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600' }}>
                    Proceed to Checkout (₹{totalWithTax.toFixed(2)})
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#EF4444',
                    padding: 16,
                    borderRadius: 16,
                    marginTop: 8,
                  }}
                  onPress={() => dispatch(clearCart())}
                >
                  <Text style={{ fontFamily: 'Raleway-Regular', color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: '600' }}>
                    Clear Cart
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default AddOrderScreen;