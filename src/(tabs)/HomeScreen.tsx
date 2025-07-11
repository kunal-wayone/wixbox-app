import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  ToastAndroid,
  Animated,
  Dimensions,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Banner from '../components/common/Banner';
import { ImagePath } from '../constants/ImagePath';
import ProfileCard from '../components/common/ProfileCard';
import ShiftCard from '../components/ShiftCard';
import Menu from '../components/common/Menu';
import Review from '../components/common/Review';
import Post from '../components/common/Posts';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Fetch, IMAGE_URL, TokenStorage } from '../utils/apiUtils';
import LoadingComponent from '../screens/otherScreen/LoadingComponent';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchUser } from '../store/slices/userSlice';

const Stack = createNativeStackNavigator();
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const shiftData = [
  {
    day: 'Mon',
    shift: 2,
    firstShift: '9:00 AM - 1:00 PM',
    secondShift: '4:00 PM - 10:00 PM',
  },
  {
    day: 'Tue',
    shift: 1,
    firstShift: '10:00 AM - 6:00 PM',
  },
  {
    day: 'Wed',
    shift: 0,
  },
  {
    day: 'Thu',
    shift: 2,
    firstShift: '8:00 AM - 12:00 PM',
    secondShift: '3:00 PM - 9:00 PM',
  },
  {
    day: 'Fri',
    shift: 1,
    firstShift: '11:00 AM - 5:00 PM',
  },
  {
    day: 'Sat',
    shift: 2,
    firstShift: '7:00 AM - 11:00 AM',
    secondShift: '2:00 PM - 8:00 PM',
  },
  {
    day: 'Sun',
    shift: 0,
  },
];

const HomeScreen = () => {
  const dispatch = useDispatch<any>();
  const isFocused = useIsFocused();
  const navigaton = useNavigation<any>();
  const { status: userStatus, data: user }: any = useSelector(
    (state: RootState) => state.user,
  );
  const [shopStatus, setShopStatus] = useState(true);
  const [activeTab, setActiveTab] = useState('About');
  const scrollY = useRef(new Animated.Value(0)).current;
  const tabBarRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toggleLoadingIds, setToggleLoadingIds] = useState<any>();
  const [storeStatus, setStoreStatus] = useState(user?.shop?.status === 1 ? true : false)
  const [tabBarOffset, setTabBarOffset] = useState<any>(0);
  const [userData, setUserData] = useState<any>(null);

  const onTabBarLayout = (event: any) => {
    tabBarRef.current?.measure?.(
      (x: any, y: any, width: any, height: any, pageX: any, pageY: any) => {
        setTabBarOffset(pageY);
      },
    );
  };

  const translateY = scrollY.interpolate({
    inputRange: [0, tabBarOffset],
    outputRange: [0, -tabBarOffset],
    extrapolate: 'clamp',
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'About':
        return (
          <View className="py-4">
            <View className=' p-2 rounded-xl shadow-xl'>
              <Text className="text-base text-gray-800 font-semibold font-poppins hidden">
                About Us
              </Text>
              <Text className="font-poppins text-base text-gray-600 mb-2">
                {user?.shop?.about_business}
              </Text>


            </View>
            <Text className="text-xl text-gray-600 font-semibold font-poppins mb-2">
              Business Hours
            </Text>
            {user?.shop?.shift_details && JSON.parse(user?.shop?.shift_details).map((item: any, index: any) => (
              <ShiftCard
                key={index}
                day={item.day}
                shift={item.shift}
                firstShift={item.firstShift}
                secondShift={item.secondShift}
                first_shift_start={item?.first_shift_start}
                first_shift_end={item?.first_shift_end}
                second_shift_start={item?.second_shift_start}
                second_shift_end={item?.second_shift_end}
                status={item?.status}
              />
            ))}
            <Text className="text-base text-gray-600 font-semibold font-poppins mb-1 mt-2">
              Address
            </Text>
            <Text className="font-poppins ml-1 text-gray-600 mb-2">
              {user?.shop?.address + ", " + user?.shop?.city + ", " + user?.shop?.state + ", " + "(" + user?.shop?.zip_code + ")" || "Store No - 002, Belagere Rd, Near Hilife Pearl Shell, Varthur,Bangalore"}
            </Text>
            <Text className="text-base text-gray-600 font-semibold font-poppins ">
              Business Contact
            </Text>
            <Text className="font-poppins text-sm text-gray-600 ml-1">{user?.shop?.phone ?? "NA"}</Text>
            {/* <Text className="font-poppins text-sm text-gray-600 ml-1">{user?.shop?.email ?? "NA"}</Text> */}

          </View>
        );
      case 'Menu':
        return <Menu />;
      case 'Reviews':
        return <Review />;
      case 'Post':
        return <Post />;
      default:
        return null;
    }
  };

  const getUserData = async () => {
    const user = await dispatch(fetchUser());
    console.log(user);
  };


  // Toggle ads status
  const toggleStoreStatus = useCallback(
    async (id: string, currentStatus: boolean) => {
      console.log(id)
      try {
        setToggleLoadingIds(true);
        const response: any = await Fetch(
          `/user/shop/${id}/active-inactive`,
          { status: currentStatus ? 0 : 1 },
          5000
        );
        console.log(response)
        if (!response.success) throw new Error('Failed to toggle status');

        // Update ads state optimistically
        setStoreStatus((prevStatus) => !prevStatus);

        ToastAndroid.show('Status updated successfully!', ToastAndroid.SHORT);
        return response.data;
      } catch (error: any) {
        console.error('toggleAdsStatus error:', error);
        ToastAndroid.show(
          error?.message || 'Failed to toggle status.',
          ToastAndroid.SHORT
        );
        throw error;
      } finally {
        setToggleLoadingIds(false)
      }
    },
    []
  );


  useEffect(() => {
    if (isFocused) {
      getUserData();
    }
  }, [isFocused, storeStatus]);

  if (!user) {
    return <ActivityIndicator size={42} className='m-auto' color={"#B68AD4"} />;
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="p-4"
        scrollEventThrottle={16}>
        <Animated.View style={{ transform: [{ translateY }] }}>
          <View className="flex-row items-center justify-between mb-4" >
            <View>
              <Text className="text-lg font-semibold font-poppins" numberOfLines={1} ellipsizeMode='tail'>
                {user?.shop?.restaurant_name || ' Burger One (Cafe & Bakery)'}
              </Text>
              <Text className='text-sm pl-1' numberOfLines={2} ellipsizeMode='tail'>
                {user?.shop?.address + ", " + user?.shop?.city}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => navigaton.navigate('NotificationScreen')}
                className="bg-primary-20 w-8 h-8 rounded-full justify-center items-center">
                <Image
                  source={ImagePath.bellIcon}
                  className="h-4 w-4"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigaton.navigate("CreateShopScreen", { shopId: user?.shop?.id })} className="bg-primary-20 w-8 h-8 rounded-full justify-center items-center">
                <Image
                  source={ImagePath.edit}
                  className="h-4 w-4"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Banner
            imageUrl={user?.shop?.restaurant_images[0] ? {
              uri: IMAGE_URL + user?.shop?.restaurant_images[0]
            } : ImagePath?.restaurant1}
            showOverlay={false}
          />
          <ProfileCard
            profileImageUrl={ImagePath.profile1}
            name={user?.name || "John Doe"}
            iconImageUrl={ImagePath.crown}
            status={storeStatus ? "Online" : "Offline"}
            rating={4}
            layout="row"
            onProfilePress={() =>
              navigaton.navigate("Profile")
            }

            toggleLoadingIds={toggleLoadingIds}
            toggleStoreStatus={toggleStoreStatus}
            storeStatus={storeStatus}
            shopId={user?.shop?.id}
            shopCategory={user?.shop?.shop_category ?? "Restaurent"}

          />



          <View className="flex-row items-center justify-between gap-3 py-4">
            <TouchableOpacity
              onPress={() => navigaton.navigate('AddOrderScreen')}
              disabled={!shopStatus}
              className={`${shopStatus ? 'bg-primary-70' : 'bg-primary-50'
                } p-4 w-1/2 rounded-xl justify-center items-center`}>
              <Text className="text-white font-bold font-poppins">
                Add Orders
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigaton.navigate('ManageStockScreen')}
              disabled={!shopStatus}
              className={`${shopStatus ? 'bg-white' : ' '
                } p-4 w-1/2 border rounded-xl justify-center items-center`}>
              <Text
                className={`font-bold font-poppins ${shopStatus ? '' : 'text-gray-500'
                  }`}>
                Manage Stocks
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Sticky Tab Bar */}
        <View
          ref={tabBarRef}
          onLayout={onTabBarLayout}
          style={{
            position: 'relative',
            top: 0,
            zIndex: 10,
            backgroundColor: 'white',
          }}>
          <View className="flex-row items-center justify-between gap-4 border-b-[2px]">
            {['About', 'Menu', 'Reviews', 'Post'].map((d, i) => (
              <TouchableOpacity key={i} onPress={() => setActiveTab(d)}>
                <Text
                  className={`text-lg px-2 font-poppins ${activeTab === d ? 'font-bold' : 'text-gray-500'
                    }`}>
                  {d}
                </Text>
                {activeTab === d && (
                  <View className="w-full h-1 bg-black rounded-t-lg" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Render Tab Content (NO nested ScrollView) */}
        <View className=''>
          {renderTabContent()}
        </View>



      </ScrollView>
    </View>
  );
};

export default HomeScreen;
