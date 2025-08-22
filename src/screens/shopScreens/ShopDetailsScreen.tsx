import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ToastAndroid,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Menu from '../../components/common/Menu';
import Post from '../../components/common/Posts';
import Review from '../../components/common/Review';
import ShiftCard from '../../components/ShiftCard';
import PaymentIcons from '../../components/common/PaymentIcons';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch, IMAGE_URL } from '../../utils/apiUtils';
import UsersMenuItems from '../../components/common/UsersMenuItems';
import UsersReview from '../../components/common/UsersReview';
import UsersPost from '../../components/common/UsersPosts';
import LinearGradient from 'react-native-linear-gradient';
import Entypo from 'react-native-vector-icons/Entypo'
import CallButton from '../../components/common/CallButton';
import DirectionButton from '../../components/common/DirectionButton';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { addWishlistShop, removeWishlistShop } from '../../store/slices/wishlistSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import Octicons from 'react-native-vector-icons/Octicons';

const { width } = Dimensions.get('screen');
const DEFAULT_IMAGE = ImagePath.restaurant1;



const availableTags = [
  { id: 'spicy', label: 'Spicy 🌶️' },
  { id: 'bestseller', label: 'Bestseller ⭐' },
  { id: 'hot', label: 'Hot 🔥' },
  { id: 'fresh', label: 'Fresh 🥗' },
  { id: 'gluten_free', label: 'Gluten-Free 🌾' },
  { id: 'vegan', label: 'Vegan 🌱' },
];



const ShopDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<any>();
  const isFocused = useIsFocused();
  const shop_info = route.params?.shop_info || {};
  const [shopId, setShopId] = useState(shop_info?.id)
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { status: userStatus, data: user }: any = useSelector(
    (state: RootState) => state.user,
  );
  const wishlistShopIds = useSelector((state: RootState) => state.wishlist.shop_ids);
  const isWishlisted = wishlistShopIds.includes(shop_info?.id);
  const [itemData, setItemData] = useState([]);
  const [isLoadingItem, setIsLoadingItem] = useState(false)
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [selectedFloor, setSelectedFloor] = useState<any>('Ground');
  const [isModalVisible, setIsModalVisible] = useState<any>(false);
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [shopStatus, setShopStatus] = useState({
    isOpen: false,
    openingTime: null,
    closingTime: null,
  });
  const [isModalTableReserveVisible, setIsModalTableReserveVisible] = useState<any>(false);
  const scrollY = useRef<any>(new Animated.Value(0)).current;
  const tabBarRef = useRef<any>(null);
  const [tabBarOffset, setTabBarOffset] = useState(0);
  let shiftDetails = [];

  if (shop_info?.shift_details) {
    if (typeof shop_info.shift_details === 'string') {
      try {
        shiftDetails = JSON.parse(shop_info.shift_details);
      } catch (error) {
        console.error("Invalid JSON in shift_details:", error);
      }
    } else if (typeof shop_info.shift_details === 'object') {
      shiftDetails = shop_info.shift_details; // Already parsed
    } else {
      console.warn("shift_details is neither a string nor an object.");
    }
  }

  console.log(shop_info)
  const formatShiftData = (shifts: any) => {
    return shifts.map((shift: any) => ({
      day: shift.day,
      shift: shift.status ? (shift.first_shift_start ? 1 : 0) : 0,
      firstShift: shift.first_shift_start
        ? `${shift.first_shift_start} - ${shift.first_shift_end}`
        : '',
      first_shift_start: shift.first_shift_start,
      first_shift_end: shift.first_shift_end,
      second_shift_start: shift.second_shift_start,
      second_shift_end: shift.second_shift_end,
      status: shift.status,
    }));
  };

  const formatToAMPM = (time24: string) => {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };


  const formattedShiftData = formatShiftData(shiftDetails);

  // Check if shop is open
  const isShopOpen = () => {
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
    if (!todayShift || !todayShift.first_shift_start) return false;

    return (
      currentTime >= todayShift.first_shift_start &&
      currentTime <= todayShift.first_shift_end
    );
  };

  // Handle payment methods
  const paymentMethods = [];
  if (shop_info?.payment_cash) paymentMethods.push('Cash');
  if (shop_info?.payment_card) paymentMethods.push('Card');
  if (shop_info?.payment_upi) paymentMethods.push('UPI');

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

  // Table layout rendering
  const renderTableItem = ({ item }: any) => {
    const seats = parseInt(item.seats) || 2;
    const isSelected = selectedTable?.table_number === item.table_number && selectedTable?.floor === item.floor;
    const isAvailable = item.is_booked !== '1';

    const getSeatDistribution = (count: any) => {
      if (count <= 8) {
        return [
          { side: 'top', count: 1 },
          { side: 'right', count: 1 },
          { side: 'bottom', count: 1 },
          { side: 'left', count: 1 },
        ];
      }
      return [
        { side: 'top', count: 3 },
        { side: 'right', count: 1 },
        { side: 'bottom', count: 3 },
        { side: 'left', count: 1 },
      ];
    };

    const seatDistribution = getSeatDistribution(seats);
    const seatSize = 28;
    const seatThickness = 6;

    const getLineColor = () => {
      if (!isAvailable) return 'lightgray';
      if (item.premium === 1) return isSelected ? "#00C01A80" : '#B68AD480';
      return '#00C01A80';
    };

    const renderChairLines = (side: any, count: any) => {
      if (count === 0) return null;
      const lines = [];
      const color = getLineColor();
      const isHorizontal = side === 'top' || side === 'bottom';
      const spacing = isHorizontal ? (seats <= 8 ? 80 : 155) : 80;

      for (let i = 0; i < count; i++) {
        const gap = spacing / (count + 1);
        const center = gap * (i + 1);

        const style: any = {
          position: 'absolute',
          backgroundColor: color,
          borderRadius: 6,
          ...(isHorizontal
            ? {
              width: seatSize,
              height: seatThickness,
              left: center - seatSize / 2,
              [side]: 1,
            }
            : {
              width: seatThickness,
              height: seatSize,
              top: center - seatSize / 2,
              [side]: -1,
            }),
        };

        lines.push(<View key={`${side}-seat-${i}`} style={style} />);
      }
      return lines;
    };

    return (
      <TouchableOpacity
        className={`flex-1 m-2 items-center justify-center ${seats > 8 ? 'col-span-2' : ''}`}
        disabled={!isAvailable}
        onPress={() => {
          if (isAvailable) {
            setSelectedTable(item);
          } else {
            ToastAndroid.show("This table is already booked.", ToastAndroid.SHORT);
          }
        }}
      >
        <View
          className={`justify-center items-center ${seats <= 8 ? 'w-24 h-24' : 'w-44 h-24'} rounded-xl`}
        >
          <View
            className={`w-10/12 h-16 rounded-xl flex-col justify-center items-center ${isSelected ? 'bg-green-500' :
              item.premium === 1 ? 'border border-[#B68AD480] rounded-xl' :
                !isAvailable ? 'bg-gray-100' : 'border border-green-300 rounded-xl'
              }`}
          >
            <Text
              className={`text-xs font-semibold ${!isAvailable ? 'text-gray-400' :
                isSelected ? 'text-white' : 'text-black'
                }`}
            >
              T{item.table_number} ({item.seats})
            </Text>
            <Text
              className={`text-xs font-semibold ${!isAvailable ? 'text-gray-400' :
                isSelected ? 'text-white' : 'text-black'
                }`}
            >
              ₹ {item.price}/-
            </Text>
            <Text
              className={`text-xs font-semibold ${!isAvailable ? 'text-red-500' :
                isSelected ? 'text-white' : 'text-green-500'
                }`}
            >
              {isAvailable ? 'Available' : 'Booked'}
            </Text>
          </View>
          {seatDistribution.map(({ side, count }) => renderChairLines(side, count))}
        </View>
      </TouchableOpacity>
    );
  };

  // Floor tab rendering
  const renderFloorTab = ({ item }: any) => (
    <TouchableOpacity
      className={`py-2 px-4 m-2 h-10 mb-8 rounded-lg ${selectedFloor === item.floor ? 'bg-primary-90' : 'bg-gray-200'}`}
      onPress={() => setSelectedFloor(item.floor)}
    >
      <Text
        className={`  -regular ${selectedFloor === item.floor ? 'text-white' : 'text-black'}`}
      >
        {item.floor}
      </Text>
    </TouchableOpacity>
  );
 
  // Get unique floors 
  const getUniqueFloors = (tables = []) => {
    const seen = new Set();
    return tables
      .filter((item: any) => {
        if (seen.has(item.floor)) return false;
        seen.add(item.floor);
        return true;
      })
      .map((item: any) => ({ floor: item.floor }));
  };


  const getProductData = async () => {
    try {
      setIsLoadingItem(true)
      const response: any = await Fetch(`/user/shop-menu-items?shop_id=${shopId}&page=1&per_page=5`);
      if (!response?.success) {
        throw new Error("Failed to fetch item data.");
      }

      const data = response?.menu_items;
      console.log(response, data)
      setItemData(data);
    } catch (error) {
      console.error("Error fetching product data:", error);
      // Optionally show a toast or alert to the user
    } finally {
      setIsLoadingItem(false);
    }
  };


  useEffect(() => {
    if (isFocused) {
      getProductData()
    }
  }, [])



  const handleToggleWishlist = async () => {
    try {
      if (isWishlisted) {
        await dispatch(removeWishlistShop({ shop_id: shop_info?.id })).unwrap();
        ToastAndroid.show('Removed from wishlist', ToastAndroid.SHORT);
      } else {
        await dispatch(addWishlistShop({ shop_id: shop_info?.id })).unwrap();
        ToastAndroid.show('Added to wishlist', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Error updating wishlist', ToastAndroid.SHORT);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View className="flex-1 bg-white">
        <ScrollView
          contentContainerStyle={{ marginBottom: 100 }}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {user?.role === "vendor" && (
            <TouchableOpacity
              onPress={() =>
                ToastAndroid.show("You're viewing your shop profile", ToastAndroid.SHORT)
              }
              className="absolute z-50 bg-black/10 right-0 top-0 bottom-0 left-0"
            />
          )}
          {/* Gradient Overlay */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center gap-4 absolute left-2 z-50 p-4 "
          >
            <Ionicons name="arrow-back" size={20} color={'white'} />
          </TouchableOpacity>
          <View className="flex-row items-center justify-end mb-6 px-4 pt-4 absolute w-full z-20">
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                onPress={() => navigation.navigate('NotificationScreen')}
                className="bg-gray-100 w-10 h-10 rounded justify-center items-center"
              >
                {!isWishlisted ? <Ionicons name='heart-outline' size={22} /> : <Ionicons name='heart' color={"red"} size={22} />}
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
                shop_info?.restaurant_images?.[0]
                  ? { uri: IMAGE_URL + shop_info.restaurant_images[0] }
                  : DEFAULT_IMAGE
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
            <View
              className={`rounded-full px-3 py-1 right-2 absolute bg-primary-100 `}
              style={{ top: '25%' }}
            >
              <Text style={{ fontFamily: 'Raleway-Regular' }} className={`text-xs  text-white`}>{"Wisbox Verified"}</Text>
            </View>


            {/* Info on gradient bottom */}
            <View className="absolute bottom-0 left-4 right-4 mb-4">
              <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-white text-xl " numberOfLines={1}>
                {shop_info?.restaurant_name || 'Unknown Restaurant'}
              </Text>
              <View className="flex-row items-center mb-1 ">
                <MaterialIcons name="location-on" size={16} color="white" />
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-white ml-1">
                  {`${shop_info?.city}, ${shop_info?.state}`}
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2 mt-1">
                {availableTags.map(tag => (
                  <View
                    key={tag.id}
                    className={`rounded-full px-3 py-1 bg-primary-80 `}
                  >
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className={`text-xs font-medium text-white`}>{tag.label}</Text>
                  </View>
                ))}

                {/* <View className="flex-row items-center gap-4">
                <PaymentIcons paymentMethods={paymentMethods} />
              </View> */}

              </View>
            </View>


          </View>

          <View className="bg-white dark:bg-gray-100 p-4 border border-gray-100 rounded-xl mx-4 mb-4" style={styles.shadow}>
            <View className="flex-row justify-between mb-2">
              {/* Row 1 - Column 1 */}
              <View className="flex-1 mr-2 flex-row items-center gap-2">
                <Ionicons name='star' size={18} color={'#eba834'} />
                <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-xl  text-gray-900">{shop_info?.average_rating || 0}</Text>
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-xs text-gray-600 mt-1">(1.2K reviews)</Text>
              </View>

              {/* Row 1 - Column 2 */}
              <View className="flex-1 flex-row items-center gap-2 ml-2">
                <Ionicons name='timer-outline' size={18} color={'#eb7a34'} />

                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-gray-900">12–15 mins</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              {/* Row 2 - Column 1 */}
              <View className="flex-1 flex-row items-center mr-2">
                <View className={`${shopStatus.isOpen ? "bg-green-500" : "bg-red-400"} w-4 h-4 rounded-full`} />
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-gray-900 ml-2">
                  {shopStatus.openingTime && shopStatus.closingTime
                    ? shopStatus.isOpen
                      ? `Open till ${shopStatus.closingTime}`
                      : `Closed now • Opens at ${shopStatus.openingTime}`
                    : "Closed today"}
                </Text>
              </View>

              {/* Row 2 - Column 2 */}
              <View className="flex-1 flex-row items-center  ml-2">
                <Ionicons name='shield-outline' size={18} color={'#eba834'} />

                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-gray-900"> Hygiene: 4.5/5</Text>
              </View>
            </View>
          </View>


          <View className="bg-white dark:bg-gray-100 flex-row items-center gap-4 justify-between  p-5 border border-gray-100 px-3 rounded-xl mx-4 mb-4" style={styles.shadow}>
            <View className='flex-row items-center gap-1 w-[48%] '>
              <Ionicons name='location-outline' size={22} color={"#ac94f4"} />
              <View className='' >
                <Text style={{ fontFamily: 'Raleway-Regular' }} className='text-xs' numberOfLines={1} ellipsizeMode='tail' >{shop_info?.distance_km} Km away   {`${Math.floor((shop_info?.travel_time_mins || 0) / 60)}h ${(shop_info?.travel_time_mins || 0) % 60}m`}</Text>
                <Text style={{ fontFamily: 'Raleway-Regular' }} className='text-xs w-36' numberOfLines={1} ellipsizeMode='tail' >{shop_info?.address + ", " + shop_info?.city}</Text>
              </View>
            </View>
            <View className='flex-row items-center justify- gap-2 w-[48%] '>
              {shop_info?.dine_in_service && (
                <TouchableOpacity
                  className="flex-row items-center gap-1 border border-gray-300 p-2 px-4 rounded-lg"
                  onPress={() => setIsModalVisible(true)}
                >
                  <MaterialIcons name='chair-alt' size={16} />
                </TouchableOpacity>
              )}
              <DirectionButton latitude={shop_info.latitude} longitude={shop_info.longitude} />
              <CallButton phone={shop_info?.phone} />
            </View>
          </View>

          <View className="bg-white dark:bg-gray-100 flex-col items-center gap-4 justify-between  p-5 border border-gray-100 px-3 rounded-xl mx-4 mb-4" style={styles.shadow}>
            <View className='flex-row items-center justify-between flex- w-full gap-4 '>
              <Text style={{ fontFamily: 'Raleway-SemiBold' }}>Top Dishes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ViewAllMenuItems', { shopId: shop_info?.id })} className='flex-row items-center  gap-3'>
                <Ionicons name='eye-outline' color={"#ac94f4"} size={18} />
                <Text style={{ fontFamily: 'Raleway-Regular' }} className='text-primary-100'>View Full Menu</Text>
              </TouchableOpacity>
            </View>

            {isLoadingItem ? (
              <ActivityIndicator color={"#ac94f4"} />
            ) : (itemData?.length === 0 ? (
              <View className="items-center justify-center py-8">
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-gray-500">No Item Found</Text>
              </View>
            ) : (
              <View className="flex flex-wrap flex-row justify-between">
                {itemData.slice(0, 4).map((item: any, index: number) => {
                  console.log(itemData)
                  const disabled = !shopStatus?.isOpen && item.status === 0;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      // disabled={disabled}
                      activeOpacity={0.7}
                      className={`w-[48%] mb-4 rounded-2xl border p-3 ${!shopStatus?.isOpen ? 'opacity-50 bg-gray-100 border-gray-300' : 'bg-white border-primary-100'
                        }`}
                      onPress={() => {
                        if (shopStatus?.isOpen) {
                          console.log('View Item:', item.item_name);
                        }
                        navigation.navigate("ProductDetailsScreen", { productId: item?.id })
                      }}
                    >
                      <Image
                        source={item.images?.length > 0 ? { uri: `${IMAGE_URL}${item.images[0]}` } : ImagePath.item1}
                        className="h-28 w-full rounded-xl mb-2"
                        resizeMode="cover"
                      />
                      <Text style={{ fontFamily: 'Raleway-Bold' }} numberOfLines={1} ellipsizeMode='tail' className="text-base  text-black mb-1">
                        {item.item_name}
                      </Text>
                      <Text style={{ fontFamily: 'Raleway-Regular' }} numberOfLines={1} ellipsizeMode='tail' className="text-sm text-gray-600 mb-1">
                        {item.category?.name || 'Uncategorized'}
                      </Text>
                      <View className='flex-row items-center justify-between gap-1'>
                        <Text style={{ fontFamily: 'Raleway-SemiBold' }} numberOfLines={1} ellipsizeMode='tail' className={`text-xs ${!shopStatus?.isOpen ? 'text-red-400' : 'text-green-600'}`}>
                          {!shopStatus?.isOpen ? ' Closed' : ' Available'}
                        </Text>
                        <Text>
                          <Ionicons name='star' color={'#ffb31c'} /> {item?.average_rating || 0}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

          </View>



          <View className="bg-white dark:bg-gray-100 flex-col items-center gap-4 justify-between  p-5 border border-gray-100 px-3 rounded-xl mx-4 mb-4" style={styles.shadow}>
            <View className='flex-row items-center justify-between flex- w-full gap-4 '>
              <Text style={{ fontFamily: 'Raleway-SemiBold' }} className=''>What People Are Saying</Text>
              <TouchableOpacity className='flex-row items-center  gap-3 hidden'>
                <Ionicons name='eye-outline' color={"#ac94f4"} size={18} />
                <Text style={{ fontFamily: 'Raleway-Regular' }} className='text-primary-100'>View All</Text>
              </TouchableOpacity>
            </View>

            <UsersReview shopId={shopId} />

          </View>



          <View className="bg-white dark:bg-gray-100 flex-col items-center gap-4 justify-between mb-40 p-5 border border-gray-100 px-3 rounded-xl mx-4 " style={styles.shadow}>
            <View className='flex-row items-center justify-between flex- w-full gap-4 '>
              <Text style={{ fontFamily: 'Raleway-SemiBold' }} className=''>Latest Post</Text>
              <TouchableOpacity className='flex-row items-center  gap-3 hidden'>
                <Ionicons name='eye-outline' color={"#ac94f4"} size={18} />
                <Text style={{ fontFamily: 'Raleway-Regular' }} className='text-primary-100'>View All</Text>
              </TouchableOpacity>
            </View>

            <UsersPost />

          </View>


        </ScrollView>

        <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-200">

          {user?.role === "vendor" && (
            <TouchableOpacity
              onPress={() =>
                ToastAndroid.show("You're viewing your shop profile", ToastAndroid.SHORT)
              }
              className="absolute z-50 bg-black/10 right-0 top-0 bottom-0 left-0"
            />
          )}
          <TouchableOpacity
            disabled={cartItems?.length > 0 ? false : true}
            className="bg-primary-90 p-4 rounded-xl flex-row items-center justify-center gap-2  "
            onPress={() => navigation.navigate('CartScreen')} // Add proper navigation route
          >
            {cartItems?.length > 0 && < Text className='absolute  bg-red-600 rounded-full p-1 px-2 text-white z-50'
              style={{ right: '-2%', top: "-40%" }}
            >{cartItems?.length || 0}</Text>}
            <Ionicons name='cart-outline' color={"#fff"} size={22} />
            <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-center text-white   ">
              View Cart
            </Text>
          </TouchableOpacity>
        </View>

        {/* Table Selection Modal */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsModalVisible(false)}
            className="flex-1 bg-black/50 justify-end"
          >
            <TouchableOpacity
              activeOpacity={1}
              className="w-full justify-end"
              onPress={() => setIsModalVisible(false)}
            >
              <View className="bg-white rounded-t-3xl pt-6 pb-4" style={{ height: '85%' }}>
                <View className="w-12 h-1 bg-gray-400 rounded-full self-center mb-3" />
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-lg font-bold mb-3 px-4">Select a Table</Text>
                <FlatList
                  data={getUniqueFloors(shop_info?.tables)}
                  horizontal
                  keyExtractor={(item) => item.floor}
                  renderItem={renderFloorTab}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16 }}
                  className="mb-4"
                />
                <FlatList
                  data={shop_info?.tables?.filter((t: any) => t.floor === selectedFloor)}
                  renderItem={renderTableItem}
                  keyExtractor={(item) => `${item.floor}-${item.table_number}`}
                  numColumns={2}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                />
                <TouchableOpacity
                  className="bg-primary-80 rounded-xl p-4 mx-4"
                  onPress={() => {
                    if (selectedTable) {
                      setIsModalTableReserveVisible(true);
                    } else {
                      ToastAndroid.show("Please select a table first", ToastAndroid.SHORT);
                    }
                  }}
                >
                  <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-center text-white ">
                    Reserve a Table
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Reservation Info Modal */}
        <Modal
          visible={isModalTableReserveVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setIsModalTableReserveVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setIsModalTableReserveVisible(false)}
            className="flex-1 bg-black/50 justify-center items-center"
          >
            <TouchableOpacity
              activeOpacity={1}
              className="w-11/12"
              onPress={() => { }}
            >
              <View className="bg-white rounded-2xl p-4">
                <TouchableOpacity
                  onPress={() => setIsModalTableReserveVisible(false)}
                  className="absolute top-0 right-0 z-[1000]"
                >
                  <Ionicons name="close" size={30} />
                </TouchableOpacity>
                {/* <Image
                source={
                  shop_info?.restaurant_images?.[0]
                    ? { uri: IMAGE_URL + shop_info.restaurant_images[0] }
                    : DEFAULT_IMAGE
                }
                className="w-full h-56 rounded-xl mb-2"
                resizeMode="cover"
              /> */}
                <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-lg text-center font-bold mb-1">
                  {shop_info?.restaurant_name || 'Restaurant'}
                </Text>
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-center mb-4">Restaurant & Café</Text>
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="py-2 mx-4 border-b border-gray-400 border-dashed">
                  Price Breakdown
                </Text>
                <View className="flex-row justify-between mx-4 my-2">
                  <View className="flex-1 mr-2">
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base mb-1">Floor:</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base mb-1">Table Number:</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base mb-1">Table Type:</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base mb-1">Seats:</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base mb-1">Price:</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base mb-1">Availability:</Text>
                  </View>
                  <View className="flex-1 ml-2 items-end">
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base mb-1">{selectedTable?.floor}</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base mb-1">{selectedTable?.table_number}</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base mb-1">
                      {selectedTable?.premium === "0" ? "Not Premium" : "Premium"}
                    </Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base mb-1">{selectedTable?.seats}</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base mb-1">₹ {selectedTable?.price}/-</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className={`text-base mb-1 ${selectedTable?.is_booked === "1" ? 'text-red-500' : 'text-green-500'}`}>
                      {selectedTable?.is_booked === "1" ? 'Booked' : 'Available'}
                    </Text>
                  </View>
                </View>
                <View className="border-b border-dashed border-gray-400 mx-4 my-2" />

                {/* <View>
                  {selectedTable?.time_slot?.length > 0 && (
                    <View style={{ marginTop: 16 }}>
                      {selectedTable.time_slot.map((slot: any, idx: number) => {
                        const isSelected = slot === selectedSlot;
                        const bgClass = isSelected ? 'bg-primary-100 text-white' : 'bg-gray-100';
                        console.log(isSelected, selectedSlot, slot)
                        return (
                          <TouchableOpacity
                            key={idx}
                            className={`${bgClass} mb-2 rounded p-2`}
                            onPress={() => setSelectedSlot(slot)}
                          >
                            <Text style={{fontFamily:'Raleway-Regular'}} style={{ fontSize: 12 }}
                              className={`${bgClass} `}
                            >
                              📅 {slot.date} |  {slot.start_time} - {slot.end_time} •  ₹{slot.price}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View> */}


                <TouchableOpacity
                  className={`rounded-xl p-4 mx-4 mt-5 ${selectedTable?.is_booked === "1" ? 'bg-gray-300' : 'bg-primary-100'}`}
                  onPress={() => {
                    if (selectedTable && selectedTable.is_booked !== "1") {
                      navigation.navigate("TableBookingFormScreen", {
                        shop_id: shop_info?.id,
                        table_info: [selectedTable],
                        slot: selectedSlot
                      });
                    } else {
                      ToastAndroid.show("This table is already booked.", ToastAndroid.SHORT);
                    }
                  }}
                  disabled={selectedTable?.is_booked === "1"}
                >
                  <Text style={{ fontFamily: 'Raleway-SemiBold' }} className={`text-center  ${selectedTable?.is_booked === "1" ? 'text-gray-500' : 'text-white'}`}>
                    Pay ₹ {selectedTable?.price}/- & Reserve Now
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View >
    </SafeAreaView>
  );
};

export default ShopDetailsScreen;




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