import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {ImagePath} from '../../constants/ImagePath';

const mockCartItems = [
  {id: '1', name: 'Product 1', price: 20, quantity: 2, image: ImagePath.item2},
  {id: '2', name: 'Product 2', price: 15, quantity: 1, image: ImagePath.item3},
];

const OrderSummaryScreen = () => {
  const [cartItems, setCartItems] = useState(mockCartItems);
  const [discount, setDiscount] = useState('0');
  const [taxInputs, setTaxInputs] = useState([
    {id: 1, label: 'Service Tax', value: '0'},
  ]);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const totalTax = useMemo(
    () => taxInputs.reduce((sum, t) => sum + parseFloat(t.value || '0'), 0),
    [taxInputs],
  );

  const totalAmount = useMemo(() => {
    return subtotal - parseFloat(discount || '0') + totalTax;
  }, [subtotal, discount, totalTax]);

  const addTaxField = () => {
    setTaxInputs(prev => [
      ...prev,
      {
        id: prev.length + 1,
        label: `Service Tax ${prev.length + 1}`,
        value: '0',
      },
    ]);
  };

  const removeTaxField = (id: number) => {
    setTaxInputs(prev => prev.filter(t => t.id !== id));
  };

  const updateTaxValue = (id: number, value: string) => {
    setTaxInputs(prev => prev.map(t => (t.id === id ? {...t, value} : t)));
  };

  const renderCartItem = ({item}: {item: any}) => (
    <View className="flex-row bg-gray-100 rounded-xl mb-4 p-3">
      <Image
        source={item.image}
        className="w-20 h-20 rounded-lg mr-4"
        resizeMode="cover"
      />
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800">
          {item.name}
        </Text>
        <Text className="text-gray-500">Price: ${item.price.toFixed(2)}</Text>
        <Text className="text-gray-500">Qty: {item.quantity}</Text>
        <Text className="text-gray-600 mt-1 font-medium">
          Subtotal: ${(item.price * item.quantity).toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{paddingBottom: 120}} className="px-4">
        {/* Title */}
        <Text className="text-xl font-bold text-center text-gray-700 my-4">
          Order Summary
        </Text>

        {/* Cart Items */}
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />

        {/* Subtotal */}
        <View className="flex-row justify-between my-2">
          <Text className="text-base font-semibold text-gray-700">
            Subtotal:
          </Text>
          <Text className="text-base text-gray-800">
            ${subtotal.toFixed(2)}
          </Text>
        </View>

        {/* Discount */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-1">
            Discount ($)
          </Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-2 text-base"
            placeholder="Enter discount"
            keyboardType="numeric"
            value={discount}
            onChangeText={setDiscount}
          />
        </View>

        {/* Service Tax Inputs */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Service Taxes
          </Text>

          {taxInputs.map(tax => (
            <View key={tax.id} className="mb-3">
              <View className="flex-row items-center">
                <TextInput
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-base mr-2"
                  placeholder="Enter tax amount"
                  keyboardType="numeric"
                  value={tax.value}
                  onChangeText={val => updateTaxValue(tax.id, val)}
                />
                <TouchableOpacity
                  className="p-2 bg-red-100 rounded-md"
                  onPress={() => removeTaxField(tax.id)}>
                  <Ionicons name="trash" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
              <Text className="text-xs text-gray-500 mt-1">{tax.label}</Text>
            </View>
          ))}

          <TouchableOpacity
            className="mt-2 bg-gray-200 rounded-lg py-2 items-center"
            onPress={addTaxField}>
            <Text className="text-sm text-gray-700 font-medium">+ Add Tax</Text>
          </TouchableOpacity>
        </View>

        {/* Total */}
        <View className="border-t border-gray-200 pt-3 flex-row justify-between mb-6">
          <Text className="text-lg font-bold text-gray-700">Total:</Text>
          <Text className="text-lg font-bold text-gray-900">
            ${totalAmount.toFixed(2)}
          </Text>
        </View>
        {/* Checkout Button */}
        <TouchableOpacity
          className="bg-primary-80 w-44 py-4 rounded-xl items-center"
          onPress={() =>
            ToastAndroid.show('Proceed to Checkout', ToastAndroid.SHORT)
          }>
          <Text className="text-white text-base font-bold">Checkout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default OrderSummaryScreen;
