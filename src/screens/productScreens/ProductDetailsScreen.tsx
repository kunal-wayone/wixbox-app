import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import IonIcons from 'react-native-vector-icons/Ionicons';
import {ImagePath} from '../../constants/ImagePath';

const ProductDetailsScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Medium');

  // Sample review data
  const reviews = [
    {
      id: '1',
      name: 'John Doe',
      time: '2 hours ago',
      rating: 4.5,
      description: 'Amazing dish, full of flavor and perfectly cooked!',
      profileImage: ImagePath.item2,
    },
    {
      id: '2',
      name: 'Jane Smith',
      time: '1 day ago',
      rating: 4.0,
      description: 'Really enjoyed the meal, but it could be a bit spicier.',
      profileImage: ImagePath.item1,
    },
  ];

  // Render star rating
  const renderStars = (rating: any) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<IonIcons name="star" key={i} size={16} color="#FFD700" />);
      } else if (i === fullStars && halfStar) {
        stars.push(
          <IonIcons
            name="star"
            key={i}
            size={16}
            color="#FFD700"
            className="opacity-50"
          />,
        );
      } else {
        stars.push(<IonIcons name="star" key={i} size={16} color="#D3D3D3" />);
      }
    }
    return stars;
  };

  // Handle quantity changes
  const handleQuantityChange = (action: any) => {
    if (action === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Handle size selection
  const handleSizeSelect = (size: any) => {
    setSelectedSize(size);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView className="flex-1">
        {/* Restaurant Name */}
        <View className="p-4 bg-white shadow-md">
          <Text className="text-2xl font-bold text-gray-800">
            The Gourmet Kitchen
          </Text>
        </View>

        {/* Product Image */}
        <View className="items-center mt-4">
          <Image
            source={ImagePath.item1}
            className="w-11/12 h-64 rounded-xl"
            resizeMode="cover"
          />
        </View>

        {/* Product Details */}
        <View className="p-4">
          {/* Product Name and Price */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-semibold text-gray-800">
              Margherita Pizza
            </Text>
            <Text className="text-lg font-bold text-green-600">$12.99</Text>
          </View>

          {/* Description */}
          <Text className="text-gray-600 mb-4">
            Classic Margherita pizza with fresh tomatoes, mozzarella, and basil
            on a crispy thin crust.
          </Text>

          {/* Size Selection */}
          <View className="flex-row items-center mb-4">
            <Text className="text-gray-700 font-medium mr-2">Size:</Text>
            {['Small', 'Medium', 'Large'].map(size => (
              <TouchableOpacity
                key={size}
                className={`px-3 py-1 rounded-full mr-2 ${
                  selectedSize === size ? 'bg-green-500' : 'bg-gray-200'
                }`}
                onPress={() => handleSizeSelect(size)}>
                <Text
                  className={`${
                    selectedSize === size ? 'text-white' : 'text-gray-800'
                  }`}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quantity Selector */}
          <View className="flex-row items-center mb-4">
            <Text className="text-gray-700 font-medium mr-2">Quantity:</Text>
            <TouchableOpacity
              className="bg-gray-200 p-2 rounded-full"
              onPress={() => handleQuantityChange('decrease')}>
              <IonIcons name="remove" size={20} color="#000" />
            </TouchableOpacity>
            <Text className="mx-4 text-gray-800 font-semibold">{quantity}</Text>
            <TouchableOpacity
              className="bg-gray-200 p-2 rounded-full"
              onPress={() => handleQuantityChange('increase')}>
              <IonIcons name="add" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Unit */}
          <Text className="text-gray-700 mb-4">Unit: 1 Pizza (Serves 2-3)</Text>

          {/* Detailed Description */}
          <Text className="text-gray-600 mb-4">
            Our Margherita Pizza is made with hand-tossed dough, fresh
            ingredients, and baked to perfection in a wood-fired oven. Perfect
            for a quick meal or a gathering with friends.
          </Text>

          {/* Review Section */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">Reviews</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text className="text-blue-500">View All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal for Reviews */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-4 h-3/4">
            <View className="items-center mb-4">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-4">
              Customer Reviews
            </Text>
            <FlatList
              data={reviews}
              keyExtractor={item => item.id}
              renderItem={({item}) => (
                <View className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <View className="flex-row items-center mb-2">
                    <Image
                      source={{uri: item.profileImage}}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <View className="flex-1">
                      <View className="flex-row justify-between">
                        <Text className="text-gray-800 font-semibold">
                          {item.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                          {item.time}
                        </Text>
                      </View>
                      <View className="flex-row mt-1">
                        {renderStars(item.rating)}
                        <Text className="ml-2 text-gray-600">
                          {item.rating}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text className="text-gray-600">{item.description}</Text>
                </View>
              )}
            />
            <View className="flex-row justify-between mt-4">
              <TouchableOpacity
                className="bg-green-500 py-3 px-6 rounded-full flex-1 mr-2"
                onPress={() => setModalVisible(false)}>
                <Text className="text-white text-center font-semibold">
                  Make It Ready
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-blue-500 py-3 px-6 rounded-full flex-1"
                onPress={() => setModalVisible(false)}>
                <Text className="text-white text-center font-semibold">
                  Visit Shop
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductDetailsScreen;
