import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import {ImagePath} from '../../constants/ImagePath';

const mockProducts = [
  {id: '1', name: 'Product 1', price: 19.99, image: ImagePath.item2},
  {id: '2', name: 'Product 2', price: 29.99, image: ImagePath.item2},
  {id: '3', name: 'Product 3', price: 39.99, image: ImagePath.item3},
  {id: '4', name: 'Product 4', price: 49.99, image: ImagePath.item3},
];

const AddOrderScreen = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartVisible, setIsCartVisible] = useState(false);

  const filteredProducts = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const addToCart = (product: any) => {
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
      setCartItems(prev =>
        prev.map(item =>
          item.id === product.id ? {...item, quantity: item.quantity + 1} : item,
        ),
      );
    } else {
      setCartItems(prev => [...prev, {...product, quantity: 1}]);
    }
  };

  const updateQuantity = (id: string, change: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + change),
            }
          : item,
      ),
    );
  };

  const renderProductItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={{flex: 1, margin: 8, alignItems: 'center'}}
      onPress={() => addToCart(item)}>
      <View style={{height: 180, width: '100%'}}>
        <Image
          source={item.image}
          style={{width: '100%', height: '100%', borderRadius: 12, marginBottom: 8}}
          resizeMode="contain"
        />
      </View>
      <Text style={{fontSize: 14, color: '#374151', textAlign: 'center'}}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderCartItem = ({item}: {item: any}) => (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        marginVertical: 8,
        padding: 12,
      }}>
      <Image
        source={item.image}
        style={{width: 80, height: 80, borderRadius: 10, marginRight: 12}}
        resizeMode="cover"
      />
      <View style={{flex: 1}}>
        <Text style={{fontSize: 16, fontWeight: 'bold', marginBottom: 4}}>
          {item.name}
        </Text>
        <Text style={{color: '#6B7280', marginBottom: 4}}>
          ${item.price.toFixed(2)}
        </Text>
        <Text style={{color: '#6B7280', marginBottom: 4}}>
          Quantity: {item.quantity}
        </Text>
        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
          <TouchableOpacity
            style={{
              backgroundColor: '#D1D5DB',
              borderRadius: 6,
              paddingHorizontal: 10,
              marginRight: 10,
            }}
            onPress={() => updateQuantity(item.id, -1)}>
            <Text style={{fontSize: 18}}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#D1D5DB',
              borderRadius: 6,
              paddingHorizontal: 10,
            }}
            onPress={() => updateQuantity(item.id, 1)}>
            <Text style={{fontSize: 18}}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: '#B68AD4',
            paddingVertical: 8,
            borderRadius: 8,
            alignItems: 'center',
          }}>
          <Text style={{color: '#fff', fontWeight: 'bold'}}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{flex: 1, backgroundColor: '#fff', padding: 16}}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#D1D5DB',
          paddingBottom: 8,
        }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 8}}>
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
          marginVertical: 16,
        }}>
        Add Order
      </Text>

      {/* Search & Cart */}
      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
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
          <Ionicons name="search-outline" size={20} color="#374151" style={{marginRight: 8}} />
          <TextInput
            style={{flex: 1, fontSize: 16, paddingVertical: 10}}
            placeholder="Search product"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          onPress={() => setIsCartVisible(true)}
          style={{backgroundColor: '#B68AD4', padding: 12, borderRadius: 10, marginLeft: 12}}>
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
              <Text style={{color: '#fff', fontSize: 10}}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={{fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 12}}>
        Tap to Add Product
      </Text>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={{paddingBottom: 16}}
        showsVerticalScrollIndicator={false}
      />

      {/* Cart Modal */}
      <Modal
        isVisible={isCartVisible}
        onBackdropPress={() => setIsCartVisible(false)}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <View
          style={{
            height: Dimensions.get('window').height * 0.75,
            backgroundColor: '#fff',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 16,
          }}>
          <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 12}}>Your Cart</Text>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
};

export default AddOrderScreen;
