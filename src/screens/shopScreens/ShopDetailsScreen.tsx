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
} from 'react-native';
import React, { useRef, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Menu from '../../components/common/Menu';
import Post from '../../components/common/Posts';
import Review from '../../components/common/Review';
import ShiftCard from '../../components/ShiftCard';
import PaymentIcons from '../../components/common/PaymentIcons';
import { ImagePath } from '../../constants/ImagePath';
import { IMAGE_URL } from '../../utils/apiUtils';
import UsersMenuItems from '../../components/common/UsersMenuItems';
import UsersReview from '../../components/common/UsersReview';
import UsersPost from '../../components/common/UsersPosts';

const { width } = Dimensions.get('screen');
const DEFAULT_IMAGE = ImagePath.restaurant1;

const ShopDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const shop_info = route.params?.shop_info || {};
  const [activeTab, setActiveTab] = useState<any>('About');
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [selectedFloor, setSelectedFloor] = useState<any>('Ground');
  const [isModalVisible, setIsModalVisible] = useState<any>(false);
  const [isModalTableReserveVisible, setIsModalTableReserveVisible] = useState<any>(false);
  const scrollY = useRef<any>(new Animated.Value(0)).current;
  const tabBarRef = useRef<any>(null);
  const [tabBarOffset, setTabBarOffset] = useState(0);
  console.log(shop_info)
  // Parse shift_details safely
  const shiftDetails = shop_info?.shift_details
    ? JSON.parse(shop_info.shift_details)
    : [];

  // Format shift data
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

  // Tab bar layout
  // const onTabBarLayout = (event) => {
  //   tabBarRef.current?.measure?.((x, y, width, height, pageX, pageY) => {
  //     setTabBarOffset(pageY);
  //   });
  // };

  // const translateY = scrollY.interpolate({
  //   inputRange: [0, tabBarOffset],
  //   outputRange: [0, -tabBarOffset],
  //   extrapolate: 'clamp',
  // });

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'About':
        return (
          <View className="py-4 flex-1">
            <Text className="text-xl text-gray-600 font-semibold font-poppins mb-2">
              About Us
            </Text>
            <Text className="font-poppins text-gray-600 mb-4">
              {shop_info?.about_business || 'No description available.'}
            </Text>
            <Text className="text-xl text-gray-600 font-semibold font-poppins mb-2">
              Business Contact
            </Text>
            <Text className="font-poppins text-gray-600 mb-4">
              {shop_info?.phone || 'No contact available.'}
            </Text>
            <Text className="text-xl text-gray-600 font-semibold font-poppins mb-2">
              Business Hours
            </Text>
            {formattedShiftData.map((item: any, index: any) => (
              <ShiftCard key={index} {...item} />
            ))}
            <Text className="text-xl text-gray-600 font-semibold font-poppins mb-2 mt-4">
              Address
            </Text>
            <Text className="font-poppins text-gray-600">
              {`${shop_info?.address}, ${shop_info?.city}, ${shop_info?.state} - ${shop_info?.zip_code}`}
            </Text>
          </View>
        );
      case 'Menu':
        return <UsersMenuItems shopId={shop_info?.id} />;
      case 'Reviews':
        return <UsersReview shopId={shop_info?.id} average_rating={shop_info?.average_rating} />;
      case 'Post':
        return <UsersPost vendor_id={shop_info?.vendor_id} />;
      default:
        return null;
    }
  };

  // Table layout rendering
  const renderTableItem = ({ item }: any) => {
    const seats = parseInt(item.seats) || 2;
    const isSelected = selectedTable?.table_number === item.table_number && selectedTable?.floor === item.floor;

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
      if (item.is_booked === "1") return 'lightgray';
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
        disabled={item.is_booked === '1'}
        onPress={() => {
          if (item.is_booked !== '1') {
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
                item.is_booked === '1' ? 'bg-gray-100' : 'border border-green-300 rounded-xl'
              }`}
          >
            <Text
              className={`text-xs font-semibold ${item.is_booked === '1' ? 'text-gray-400' :
                isSelected ? 'text-white' : 'text-black'
                }`}
            >
              T{item.table_number} ({item.seats})
            </Text>
            <Text
              className={`text-xs font-semibold ${item.is_booked === '1' ? 'text-gray-400' :
                isSelected ? 'text-white' : 'text-black'
                }`}
            >
              ₹ {item.price}/-
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
      className={`py-2 px-4 m-2 h-10 mb-8 rounded-lg ${selectedFloor === item.floor ? 'bg-primary-90' : 'bg-gray-200'
        }`}
      onPress={() => setSelectedFloor(item.floor)}
    >
      <Text
        className={`font-poppins-regular ${selectedFloor === item.floor ? 'text-white' : 'text-black'
          }`}
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

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        // onScroll={Animated.event(
        //   [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        //   { useNativeDriver: true }
        // )}
        scrollEventThrottle={16}
      >
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center gap-4"
          >
            <Ionicons name="arrow-back" size={20} />
          </TouchableOpacity>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationScreen')}
              className="bg-[#E6E6FA] w-7 h-7 rounded-full justify-center items-center"
            >
              <Image source={ImagePath.bellIcon} className="h-3 w-3" resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationScreen')}
              className="bg-[#E6E6FA] w-7 h-7 rounded-full justify-center items-center"
            >
              <Image source={ImagePath.share} className="h-3 w-3" resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <Image
            source={
              shop_info?.restaurant_images?.[0]
                ? { uri: IMAGE_URL + shop_info.restaurant_images[0] }
                : DEFAULT_IMAGE
            }
            className="w-full h-64 rounded-xl mb-4"
          />
          <Text className="text-lg font-bold" numberOfLines={1}>
            {shop_info?.restaurant_name || 'Unknown Restaurant'}
          </Text>
          <View className="flex-row items-center w-3/5 mb-2">
            <MaterialIcons name="location-on" size={16} color="black" />
            <Text className="font-poppins ml-1">
              {`${shop_info?.city}, ${shop_info?.state}`}
            </Text>
          </View>
          <Text className={`mb-2 ${isShopOpen() ? 'text-green-600' : 'text-red-600'}`}>
            {isShopOpen() ? 'Open Now' : 'Closed'}
          </Text>
          <View className="flex-row items-center gap-4 mb-3">
            <Text>Payment:</Text>
            <PaymentIcons paymentMethods={paymentMethods} />
          </View>
          {shop_info?.dine_in_service && (
            <TouchableOpacity
              className="p-4 bg-primary-80 rounded-xl"
              onPress={() => setIsModalVisible(true)}
            >
              <Text className="text-center text-white font-semibold">View Tables</Text>
            </TouchableOpacity>
          )}
        </View>

        <Animated.View
          ref={tabBarRef}
          // onLayout={()=>onTabBarLayout}
          className="flex-row justify-between border-b-2 border-gray-200 mb-4"
        // style={{ transform: [{ translateY }] }}
        >
          {['About', 'Menu', 'Reviews', 'Post'].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} className="flex-1 items-center">
              <Text
                className={`text-lg font-poppins px-2 ${activeTab === tab ? 'font-bold text-black' : 'text-gray-500'
                  }`}
              >
                {tab}
              </Text>
              {activeTab === tab && <View className="w-full h-1 bg-black rounded-t-lg" />}
            </TouchableOpacity>
          ))}
        </Animated.View>

        <View className="rounded-xl">
          {renderTabContent()}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-200">
        <TouchableOpacity
          className="bg-primary-90 p-4 rounded-xl"
          onPress={() => navigation.navigate('')} // Add proper navigation route
        >
          <Text className="text-center text-white font-bold font-poppins">
            Get Directions
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
            <View className="bg-white rounded-t-3xl  pt-6 pb-4 " style={{ height: '85%' }}>
              <View className="w-12 h-1 bg-gray-400 rounded-full self-center mb-3" />
              <Text className="text-lg font-bold mb-3 px-4">Select a Table</Text>
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
                <Text className="text-center text-white font-semibold font-poppins">
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
            <View className="bg-white rounded-2xl p-4 ">
              <TouchableOpacity
                onPress={() => setIsModalTableReserveVisible(false)}
                className="absolute top-0 right-0 z-[1000]"
              >
                <Ionicons name="close" size={30} />
              </TouchableOpacity>
              <Image
                source={
                  shop_info?.restaurant_images?.[0]
                    ? { uri: IMAGE_URL + shop_info.restaurant_images[0] }
                    : DEFAULT_IMAGE
                }
                className="w-full h-56 rounded-xl mb-2"
                resizeMode="cover"
              />
              <Text className="text-lg text-center font-bold mb-1">
                {shop_info?.restaurant_name || 'Restaurant'}
              </Text>
              <Text className="text-center mb-4">Restaurant & Café</Text>
              <Text className="py-2 mx-4 border-b border-gray-400 border-dashed">
                Price Breakdown
              </Text>
              <View className="flex-row justify-between mx-4 my-2">
                <View className="flex-1 mr-2">
                  <Text className="text-base mb-1">Floor:</Text>
                  <Text className="text-base mb-1">Table Number:</Text>
                  <Text className="text-base mb-1">Table Type:</Text>
                  <Text className="text-base mb-1">Seats:</Text>
                  <Text className="text-base mb-1">Price:</Text>
                </View>
                <View className="flex-1 ml-2 items-end">
                  <Text className="text-base mb-1">{selectedTable?.floor}</Text>
                  <Text className="text-base mb-1">{selectedTable?.table_number}</Text>
                  <Text className="text-base mb-1">
                    {selectedTable?.premium === "0" ? "Not Premium" : "Premium"}
                  </Text>
                  <Text className="text-base mb-1">{selectedTable?.seats}</Text>
                  <Text className="text-base mb-1">₹ {selectedTable?.price}/-</Text>
                </View>
              </View>
              <View className="border-b border-dashed border-gray-400 mx-4 my-2" />
              <TouchableOpacity
                className="bg-primary-80 rounded-xl p-4 mx-4 mt-5"
                onPress={() => {
                  if (selectedTable) {
                    navigation.navigate("TableBookingFormScreen", {
                      shop_id: shop_info?.id,
                      table_info: [selectedTable],
                    });
                  }
                }}
              >
                <Text className="text-center text-white font-semibold font-poppins">
                  Pay ₹ {selectedTable?.price}/- & Reserve Now
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ShopDetailsScreen;