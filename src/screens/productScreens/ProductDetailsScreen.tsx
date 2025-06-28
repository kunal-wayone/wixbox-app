import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  ScrollView,
  ToastAndroid,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../../constants/ImagePath';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import LoadingComponent from '../otherScreen/LoadingComponent';
import ImageSliderWithBookmark from '../../components/common/ImageSliderWithBookmark';

interface showReviewFull {
  id: string;
  show: boolean;
}

const ProductDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const productId = route.params?.productId || null;
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [images, setImages] = useState<any>([]); // Store selected images
  const [isLoading, setIsLoading] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [showReviewFull, setShowReviewFull] = useState<{
    [key: string]: { show: boolean };
  }>({});

  const description =
    itemDetails?.description ||
    'Our Margherita Pizza is made with hand-tossed dough, fresh ingredients, and baked to perfection in a wood-fired oven. Perfect for a quick meal or a gathering with friends.';

  const toggleText = () => setShowFull(prev => !prev);
  const shortDescription = description.slice(0, 120);

  // Fetch product details if editing
  const getProductData = async (id: any) => {
    if (!id) {
      ToastAndroid.show('Product id not available', ToastAndroid.SHORT);
    }
    console.log(id, "dfdsf");

    if (id) {
      setIsLoading(true);
      try {
        const response: any = await Fetch(
          `/user/menu-items/${id}`,
          undefined,
          5000,
        );
        if (!response.success) {
          throw new Error('Failed to fetch product');
        }
        const data = response?.data?.menu_item; // Fixed typo here
        const images = response?.data?.menu_item?.images || [];
        setItemDetails(data);
        console.log(itemDetails?.status);
        // Convert API images to match the format expected by the UI
        setImages(
          images.map((img: any) => ({
            uri: IMAGE_URL + img.url, // Use the URL from the API
            id: img.id,
          })),
        );
      } catch (error) {
        console.log(error)
        ToastAndroid.show(
          'Failed to fetch product details',
          ToastAndroid.SHORT,
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    console.log('run', productId);
    getProductData(productId);
  }, []);

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
  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="flex-row items-center justify-between px-4 py-2 pt-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center gap-4">
            <Ionicons name={'arrow-back'} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('NotificationScreen')}
            className="bg-primary-20 w-7 h-7 rounded-full justify-center items-center">
            <Image
              source={ImagePath.share}
              className="h-3 w-3"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        {/* Restaurant Name */}
        <View className=" bg-white shadow-md">
          <Text className="text-lg text-center font-bold text-gray-800">
            {itemDetails?.item_name || 'The Gourmet Kitchen'}
          </Text>
        </View>

        <ImageSliderWithBookmark
          images={itemDetails?.images}
          onBookmarkPress={() =>
            ToastAndroid.show('Save in list', ToastAndroid.SHORT)
          }
        />

        {/* Product Details */}
        <View className="p-4">
          {/* Product Name and Price */}
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xl font-semibold text-gray-800">
              {itemDetails?.item_name || ' Margherita Pizza'}
            </Text>
            <Text className="text-lg font-bold text-green-600">
              ₹ {itemDetails?.price || '122.99'}
            </Text>
          </View>

          {/* Description */}
          <Text className="text-gray-600 mb-4">
            {itemDetails?.description ||
              'Classic Margherita pizza with fresh tomatoes, mozzarella, and basil on a crispy thin crust.'}
          </Text>

          {/* Size Selection */}
          <Text className="text-gray-700 font-medium mb-2">Size</Text>
          <View className="flex-row items-center mb-4">
            {['S', 'M', 'XL'].map(size => (
              <TouchableOpacity
                key={size}
                className={`px-3 py-2 rounded mr-2 ${selectedSize === size ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                onPress={() => handleSizeSelect(size)}>
                <Text
                  className={`${selectedSize === size ? 'text-white' : 'text-gray-800'
                    }`}>
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quantity Selector */}
          <Text className="text-gray-700 font-medium mb-2">Add Quantity</Text>
          <View className="flex-row items-center justify-between w-2/6 bg-gray-100 mb-4">
            <TouchableOpacity
              className="bg-gray-200 p-2 rounded"
              onPress={() => handleQuantityChange('decrease')}>
              <IonIcons name="remove" size={20} color="#000" />
            </TouchableOpacity>
            <Text className="mx-4 text-gray-800 font-semibold">{quantity}</Text>
            <TouchableOpacity
              className="bg-gray-200 p-2 rounded"
              onPress={() => handleQuantityChange('increase')}>
              <IonIcons name="add" size={20} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Unit */}
          <View className="flex-row items-center gap-1 mb-4">
            <Text className="text-gray-700">Unit:</Text>
            <Text className="text-gray-700">
              {itemDetails?.unit
                ? itemDetails.unit.charAt(0).toUpperCase() +
                itemDetails.unit.slice(1).toLowerCase()
                : '1 Pizza (Serves 2-3)'}
            </Text>
          </View>

          {/* Detailed Description */}
          <Text className="text-gray-700 text-xl mb-1">Description</Text>
          <Text className="text-gray-600 mb-1">
            {showFull ? description : `${shortDescription}...`}
          </Text>
          <TouchableOpacity className="mb-4" onPress={toggleText}>
            <Text className="text-gray-800 text-right">
              {showFull ? 'Read less' : 'Read more'}
            </Text>
          </TouchableOpacity>
          {/* Review Section */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">Reviews</Text>
            {/* <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text className="text-gray-800">View All</Text>
            </TouchableOpacity> */}
          </View>

          {reviews?.map((item: any, index: number) => {
            const isFullShown = showReviewFull[item?.id]?.show;

            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setShowReviewFull(prev => ({
                    ...prev,
                    [item?.id]: { show: !prev[item?.id]?.show },
                  }));
                }}
                className="mb-4 p-6 border border-gray-200 rounded-xl">
                <View className="flex-row items-center mb-3">
                  <Image
                    source={item?.profileImage}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <View className="flex-1">
                    <View className="flex-row justify-between">
                      <Text className="text-gray-800 font-semibold">
                        {item?.name}
                      </Text>
                      <View className="flex-row mt-1">
                        {renderStars(item?.rating)}
                        <Text className="ml-2 text-gray-600">
                          {item?.rating}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-500 text-sm">{item?.time}</Text>
                  </View>
                </View>

                <Text className="text-gray-600 text-sm">
                  {isFullShown
                    ? item?.description
                    : `${item?.description?.slice(0, 120)}...`}
                </Text>

                {/* Optional Read More/Less toggle text */}
                {item?.description?.length > 120 && (
                  <Text className="text-primary mt-1 text-sm">
                    {isFullShown ? 'Read less' : 'Read more'}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <View className="flex-col justify-between px-4 gap-2">
        <TouchableOpacity
          className="bg-primary-80 py-4 px-6 rounded-xl "
          onPress={() => setModalVisible(false)}>
          <Text className="text-white text-center font-semibold">
            Make It Ready
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white border border-gray-700 py-4 px-6 rounded-xl "
          onPress={() => setModalVisible(false)}>
          <Text className="text-center font-semibold">Visit Shop</Text>
        </TouchableOpacity>
      </View>
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
              renderItem={({ item }) => (
                <View className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <View className="flex-row items-center mb-2">
                    {/* <Image
                      source={{uri: item.profileImage}}
                      className="w-10 h-10 rounded-full mr-3"
                    /> */}
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
