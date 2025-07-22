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
  StyleSheet,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../../constants/ImagePath';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import LoadingComponent from '../otherScreen/LoadingComponent';
import ImageSliderWithBookmark from '../../components/common/ImageSliderWithBookmark';
import LinearGradient from 'react-native-linear-gradient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface showReviewFull {
  id: string;
  show: boolean;
}


const availableTags = [
  { id: 'spicy', label: 'Spicy 🌶️' },
  { id: 'bestseller', label: 'Bestseller ⭐' },
  { id: 'hot', label: 'Hot 🔥' },
  { id: 'fresh', label: 'Fresh 🥗' },
  { id: 'gluten_free', label: 'Gluten-Free 🌾' },
  { id: 'vegan', label: 'Vegan 🌱' },
];

const ProductDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused()
  const productId = route.params?.productId || null;
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('Medium');
  const [itemDetails, setItemDetails] = useState<any>(null);
  const [images, setImages] = useState<any>([]); // Store selected images
  const [isLoading, setIsLoading] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.menu_items);
  const isFavorite = wishlistItems?.some((i: any) => i.id === itemDetails?.id);
  const [showReviewFull, setShowReviewFull] = useState<{
    [key: string]: { show: boolean };
  }>({});

  const [shopStatus, setShopStatus] = useState({
    isOpen: false,
    openingTime: null,
    closingTime: null,
  });
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const shiftDetails = itemDetails?.shop?.shift_details
    ? JSON.parse(itemDetails?.shop?.shift_details)
    : [];

  const formatToAMPM = (time24: string) => {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const isShopOpen: any = () => {
    const currentDay = new Date()
      .toLocaleString('en-US', { weekday: 'short' })
      .toLowerCase();
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const shiftData = itemDetails?.shop?.shift_details ? JSON.parse(itemDetails?.shop?.shift_details) : null;
    const todayShift = shiftData?.find(
      (shift: any) => shift.day.toLowerCase() === currentDay && shift.status
    );
    // console.log(shiftData, item)

    if (!todayShift || !todayShift.first_shift_start) return false;

    return (
      currentTime >= todayShift.first_shift_start &&
      currentTime <= todayShift.first_shift_end
    );
  };



  const getShopStatus = () => {
    const currentDay = new Date()
      .toLocaleString('en-US', { weekday: 'short' })
      .toLowerCase();

    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

    const todayShift = shiftDetails.find(
      (shift: any) => shift.day.toLowerCase() === currentDay && shift.status
    );

    if (!todayShift || !todayShift.first_shift_start) {
      return {
        isOpen: false,
        openingTime: null,
        closingTime: null,
      };
    }

    const isOpen =
      currentTime >= todayShift.first_shift_start &&
      currentTime <= todayShift.first_shift_end;

    return {
      isOpen,
      openingTime: formatToAMPM(todayShift.first_shift_start),
      closingTime: formatToAMPM(todayShift.first_shift_end),
    };
  };



  useEffect(() => {
    if (isFocused) {
      const status: any = getShopStatus();
      console.log(isShopOpen(), status)
      setShopStatus(status);
    }
  }, [isFocused]);



  const defaultDescription =
    'Classic Margherita pizza with fresh tomatoes, mozzarella, and basil on a crispy thin crust.';

  const content = itemDetails?.description || defaultDescription;

  const shouldShowReadMore = content.length > 150; // You can adjust this threshold

  const toggleText = () => setShowFull(prev => !prev);
  const shortDescription = itemDetails?.description.slice(0, 120);

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
          `/user/menu-item/${id}`,
          undefined,
          5000,
        );
        if (!response.success) {
          throw new Error('Failed to fetch product');
        }
        const data = response?.menu_item; // Fixed typo here
        const images = response?.menu_item?.images || [];
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



  // Place order
  const handlePlaceOrder = (item: any) => {
    navigation.navigate('AddCustomerFormScreen', {
      item: [
        {
          id: item.id,
          quantity: 1,
          price: Math.floor(Number(item.price)),
          name: item.item_name,
          image: item?.images?.length ? { uri: IMAGE_URL + item.images[0] } : '',
          shop_id: item?.shop?.id ?? item?.store_id
        },
      ],
    });
  };


  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Gradient Overlay */}
        <View className="flex-row items-center justify-between mb-6 px-4 pt-4 absolute w-full top09 z-50">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center gap-4 "
          >
            <Ionicons name="arrow-back" size={20} color={'white'} />
          </TouchableOpacity>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              // onPress={() => navigation.navigate('NotificationScreen')}
              className="bg-gray-100 w-10 h-10 rounded justify-center items-center"
            >
              {!isFavorite ? <Ionicons name='heart-outline' size={22} /> : <Ionicons name='heart' color={"red"} size={22} />}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationScreen')}
              className="bg-gray-100 w-10 h-10 rounded justify-center items-center"
            >
              <Image source={ImagePath.share} className="h-4 w-4" resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>





        <View className="mb-4 relative h-72 bg-white">
          {/* Image with overlay gradient */}
          <Image
            source={
              itemDetails?.images?.[0]
                ? { uri: IMAGE_URL + itemDetails.images[0] }
                : ImagePath.item1
            }
            style={{ borderRadius: 0 }}
            className="w-full h-full"
            resizeMode='stretch'
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%', // bottom half gradient
            }}
          />
          <View className="absolute bg-white right-5"
            style={{ top: "60%" }}>


            <Image
              source={itemDetails?.isVegetarian === 1 ? ImagePath.veg : ImagePath.nonveg}
              className="w-6 h-6 "
              resizeMode="contain"
            />
          </View>

          {/* Info on gradient bottom */}
          <View className="absolute bottom-0 left-4 right-4 mb-4">
            <Text className="text-white text-xl font-bold" numberOfLines={1}>
              {itemDetails?.item_name || 'Unknown Restaurant'}
            </Text>
            <View className="flex-row items-center gap-2 mb-1 ">
              <Entypo name="shop" size={16} color="white" />
              <Text className='text-white'>
                {itemDetails?.shop?.restaurant_name || 'The Gourmet Kitchen'}
              </Text>
            </View>
            <View className="flex-row flex-wrap gap-2 mt-1">
              {availableTags.map(tag => (
                <View
                  key={tag.id}
                  className={`rounded-full px-3 py-1 bg-primary-80 `}
                >
                  <Text className={`text-xs font-medium text-white`}>{tag.label}</Text>
                </View>
              ))}

            </View>
          </View>


        </View>



        <View className="bg-white dark:bg-gray-100 p-4 py-2 border border-gray-100 rounded-xl mx-4 mb-4" style={styles.shadow}>
          <View className="flex-row items-center justify-between gap-8">
            {/* Row 1 - Column 1 */}
            <View className="flex-1 mr-2 flex-row items-center gap-2 mb-2">
              <Ionicons name='star' size={18} color={'#eba834'} />
              <Text className="text- font-semibold text-gray-900">{itemDetails?.average_rating || 0}</Text>
              <Text className="text-xs text-gray-600">(1.2K reviews)</Text>
            </View>
            <View className="flex-1 flex-row items-center gap-2 ">
              <Text className="text-lg font-bold text-green-600">
                ₹ {itemDetails?.price || 'NA'}/-
              </Text>
            </View>
          </View>

          {/* Row 1 - Column 2 */}
          <View className="flex-row items-center justify-between gap-8 mb-2">
            <View className="flex-1 flex-row items-center gap-2">
              <Image source={ImagePath.chef} className='w-5 h-5' style={{ tintColor: "#000" }} resizeMode='contain' />
              <Text className="text-sm font-medium text-gray-900">12–15 mins</Text>
            </View>
            {/* Row 1 - Column 1 */}
            <View className="flex-1 mr-2 flex-row items-center gap-1 pl-2">
              <MaterialIcons name='directions-run' size={16} />
              <Text className="text-sm text-gray-900">{itemDetails?.shop?.distance_km || "NA"} Km</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between gap-8 mb-2">
            {/* Row 2 - Column 1 */}
            <View className="flex-1 flex-row items-center ">
              <View className={`${shopStatus.isOpen ? "bg-green-500" : "bg-red-400"} w-4 h-4 rounded-full`} />
              <Text className="text-sm text-gray-900 ml-2">
                {shopStatus.openingTime && shopStatus.closingTime
                  ? shopStatus.isOpen
                    ? `Open till ${shopStatus.closingTime}`
                    : `Opens at ${shopStatus.openingTime}`
                  : "Closed today"}
              </Text>
            </View>
            <View className="flex-1 flex-row items-center  gap-2">
              <IonIcons name='timer-outline' size={16} />
              <Text className="text-gray-600">
                <Text className='text-sm w-32' numberOfLines={1} ellipsizeMode='tail' >
                  {`${Math.floor((itemDetails?.travel_time_mins || 0) / 60)}h ${(itemDetails?.travel_time_mins || 0) % 60}m`}
                  {/* {itemDetails?.shop?.address + ", " + itemDetails?.shop?.city} */}
                </Text>
              </Text>
            </View>
          </View>

        </View>


        {/* Product Details */}
        <View className="px-4">
          {/* Size Selection */}
          <Text className="text-gray-700 font-medium mb-2">Variants</Text>
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
          <Text className="text-gray-700 font-medium mb-2 hidden">Add Quantity</Text>
          <View className="flex-row items-center justify-between w-2/6 bg-gray-100 mb-4 hidden">
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


          {/* Detailed Description */}
          <Text className="text-gray-700 text-lg font-semibold mb-1">Description</Text>
          <Text className="text-gray-600 mb-1">
            {showFull ? itemDetails?.description : `${shortDescription}...`}
          </Text>
          <TouchableOpacity className="mb-4" onPress={toggleText}>
            <Text className="text-gray-800 text-right">
              {showFull ? 'Read less' : 'Read more'}
            </Text>
          </TouchableOpacity>
          {/* Review Section */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-800">Reviews</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text className="text-gray-800">View All</Text>
            </TouchableOpacity>
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
      <View className="flex-col justify-between px-4 gap-2 mb-4">
        <TouchableOpacity
          className="bg-primary-100 py-4 px-6 rounded-xl "
          onPress={() => handlePlaceOrder(itemDetails)}>
          <Text className="text-white text-center font-semibold">
            Add To Plate 🍽️
          </Text>
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
            <View className="flex-row justify-between mb-4">
              <TouchableOpacity
                className="bg-green-500 py-3 px-6 rounded-full flex-1 mr-2"
                onPress={() => setModalVisible(false)}>
                <Text className="text-white text-center font-semibold">
                  Close
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



const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 5.84,
    elevation: 2,
    backgroundColor: '#fff',
  },
})