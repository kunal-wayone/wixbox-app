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
  ActivityIndicator,
  RefreshControl,
  StyleSheet
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
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import Switch from '../components/common/Switch';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';


const Stack = createNativeStackNavigator();
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const quickActions = [
  {
    label: 'Add Product',
    icon: 'plus',
    emoji: '➕',
    screen: 'AddProductScreen',
    gradient: ['#34d399', '#059669'], // green gradient
  },
  {
    label: 'Create Ads',
    icon: 'target',
    emoji: '🎯',
    screen: 'CreateAdScreen',
    gradient: ['#fde68a', '#f59e0b'], // yellow-orange
  },
  {
    label: 'Stock Manager',
    icon: 'box',
    emoji: '📦',
    screen: 'ManageStockScreen',
    gradient: ['#c084fc', '#9333ea'], // purple
  },
  {
    label: 'Dine-in Setup',
    icon: 'coffee',
    emoji: '🪑',
    screen: 'ManageDineInServiceScreen',
    gradient: ['#93c5fd', '#3b82f6'], // blue
  },
  {
    label: 'Manage Orders',
    icon: 'shopping-cart',
    emoji: '🛒',
    screen: 'ManageAllOrders',
    gradient: ['#fca5a5', '#ef4444'], // red
  },
  {
    label: 'View Reviews',
    icon: 'star',
    emoji: '⭐',
    screen: 'ManageReviewScreen',
    gradient: ['#fdba74', '#f97316'], // orange
  },
  {
    label: 'Manage Wallet',
    icon: 'credit-card',
    emoji: '💳',
    screen: 'ManageTransection',
    gradient: ['#34d300', '#34d3a9'], // orange
  },
  {
    label: 'Manage Profile',
    icon: 'edit-3',
    emoji: '👤',
    screen: 'EditProfileScreen',
    gradient: ['#ac94f4', '#ac94f4'], // orange
  },
];



const DashboardScreen = () => {
  const dispatch = useDispatch<any>();
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const { status: userStatus, data: user }: any = useSelector(
    (state: RootState) => state.user,
  );
  const [shopStatus, setShopStatus] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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



  const getUserData = async () => {
    const user = await dispatch(fetchUser());
    console.log(user);
  };


  // Toggle ads status
  const toggleStoreStatus = useCallback(
    async (id: string, currentStatus: boolean) => {
      setToggleLoadingIds(true);
      const user = await dispatch(fetchUser());

      console.log(user)
      if (user?.payload?.admin_approved === 0) {
        ToastAndroid.show("Admin has not approved your shop. Please try again later.", ToastAndroid.SHORT);
        setToggleLoadingIds(false)
        return;
      }
      console.log(id)
      try {
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


  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await getUserData(); // re-fetch user/shop data
    } catch (error) {
      console.error("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);


  useEffect(() => {
    if (isFocused) {
      getUserData();
    }
  }, [isFocused, storeStatus]);

  if (!user) {
    return <ActivityIndicator size={42} className='m-auto' color={"#B68AD4"} />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View className="flex-1 bg-white">
        <ScrollView
          className="p-4"
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#B68AD4']} // optional: for Android
              tintColor="#B68AD4"   // optional: for iOS
            />
          }>
          <Animated.View className={"mb-4"} style={{ transform: [{ translateY }] }}>
            <View className="flex-row items-center justify-between mb-4" >
              <View className='flex-row items-center gap-2'>

                <View className='bg-primary-100 p-3 rounded-full'>
                  <Image source={ImagePath.chef} className='w-7 h-7' style={{ tintColor: "white" }} resizeMode='contain' />
                </View>
                <View>
                  <Text className="text-lg font-bold font-poppins pl-1" numberOfLines={1} ellipsizeMode='tail'>
                    {user?.shop?.restaurant_name || ' Burger One (Cafe & Bakery)'}
                  </Text>
                  <View className='flex-row items-center gap-1'>
                    <Icon name='location-outline' size={16} />
                    <Text className='text-sm ' numberOfLines={1} ellipsizeMode='tail' >
                      {(user?.user_addresses[0]?.city || '') +
                        ', ' +
                        (user?.user_addresses[0]?.state || '') + ", (" + (user?.user_addresses[0]?.pincode || '') + ")"}
                    </Text>
                  </View>
                  <Text className='text-sm hidden'>
                    {(user?.user_addresses[0]?.longitude || '') +
                      ', ' +
                      (user?.user_addresses[0]?.latitude || '')}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <TouchableOpacity onPress={() => navigation.navigate("ShopDetailsScreen", { shop_info: user?.shop })} className="rounded-full p-2 justify-center items-center">
                  <Feather name='eye' size={18} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate("CreateShopScreen", { shopId: user?.shop?.id })} className="rounded-full p-2 justify-center items-center">
                  <Feather name='edit' size={18} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={style.shadow} className=' rounded-lg px-4 py-3 flex-row items-center justify-between gap-2   w-full ' >
              <View className='flex-row items-center gap-3'>
                <View className={`${storeStatus ? "bg-green-500" : "bg-red-400"} w-4 h-4 rounded-full `} />
                <Text className='text-lg font-bold'>{storeStatus ? "Live" : "Offline"}</Text>
                {storeStatus && <Feather name='check-circle' size={15} color={'#00c40a'} />}
              </View>
              <View className='flex-row items-center gap-2'>
                {toggleLoadingIds && <View className='absolute right-0 left-0 top-0 bottom-0  w-full h-full  bg-black/40 z-50 rounded-full flex-row items-center justify-center'>
                  <ActivityIndicator />
                </View>}
                <Switch value={user?.shop?.status} onValueChange={(val: any) => { toggleStoreStatus(user?.shop?.id, val) }} size={"medium"} />
              </View>
            </View>



            <Text className='text-lg font-bold font-poppins mt-4'>
              Today's OverView
            </Text>



            <View className="flex-row flex-wrap justify-between py-4">
              {/* 1. Orders Received */}
              <View className="w-[48%] mb-4 bg-white rounded-xl p-4 justify-center items-center" style={style.shadow}>
                <LinearGradient
                  colors={['#cce7ff', '#e6f2ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-4 mb-2"
                  style={{ borderRadius: 100 }}
                >
                  <Feather name="shopping-cart" size={30} color="#0077ff" />
                </LinearGradient>
                <Text className="text-xl font-bold text-gray-950 font-poppins">4</Text>
                <Text className="text-sm text-gray-800 font-semibold font-poppins">Orders Received</Text>
              </View>

              {/* 2. Sales Today */}
              <View className="w-[48%] mb-4 bg-white rounded-xl p-4 justify-center items-center" style={style.shadow}>
                <LinearGradient
                  colors={['#d1f7e3', '#e0fff1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-4 mb-2"
                  style={{ borderRadius: 100 }}
                >
                  <MaterialIcons name="currency-rupee" size={30} color="#28a745" />
                </LinearGradient>
                <Text className="text-xl font-bold text-gray-950 font-poppins">₹2,350</Text>
                <Text className="text-sm text-gray-800 font-semibold font-poppins">Sales Today</Text>
              </View>

              {/* 3. Visitors Seen */}
              <View className="w-[48%] mb-4 bg-white rounded-xl p-4 justify-center items-center" style={style.shadow}>
                <LinearGradient
                  colors={['#f3e6ff', '#ede6ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-4 mb-2"
                  style={{ borderRadius: 100 }}
                >
                  <Feather name="eye" size={30} color="#c084fc" />
                </LinearGradient>
                <Text className="text-xl font-bold text-gray-950 font-poppins">120</Text>
                <Text className="text-sm text-gray-800 font-semibold font-poppins">Visitors Seen</Text>
              </View>

              {/* 4. Pending Stock */}
              <View className="w-[48%] mb-4 bg-white rounded-xl p-4 justify-center items-center" style={style.shadow}>
                <LinearGradient
                  colors={['#ffe6e6', '#ffebeb']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="p-4 mb-2"
                  style={{ borderRadius: 100 }}
                >
                  <Feather name="box" size={30} color="#dc3545" />
                </LinearGradient>
                <Text className="text-xl font-bold text-gray-950 font-poppins">15</Text>
                <Text className="text-sm text-gray-800 font-semibold font-poppins">Pending Stock</Text>
              </View>
            </View>





            <View className="">
              {/* Section Label */}
              <Text className="text-lg font-bold text-gray-800 mb-2 px-1">Quick Action</Text>

              {/* Quick Action Grid */}
              <View className="flex-row flex-wrap justify-between">
                {quickActions.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => navigation.navigate(item.screen)}
                    disabled={!shopStatus}
                    className="w-[48%] h-20 mb-3 bg-white rounded-xl flex-row items-center gap-2 px-2 pt-2 pb-1"
                    style={[style.shadow]}
                    activeOpacity={0.8}
                  >
                    {/* Left: Gradient Icon Box */}
                    <LinearGradient
                      colors={item.gradient}
                      style={{ borderRadius: 10 }}
                      className="flex-1 w-2/5 p-3 flex-row justify-center items-center"
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Feather name={item.icon} size={25} color="#fff" />
                    </LinearGradient>

                    {/* Right: Label + Emoji */}
                    <View className='w-3/5'>
                      <Text className="text-sm font-bold mb-1 text-gray-600">{item.label}</Text>
                      <Text className="text-base">{item.emoji}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

            </View>

            <Menu />
          </Animated.View>


        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default DashboardScreen;


const style = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.55,
    shadowRadius: 5.84,
    elevation: 3,
    backgroundColor: '#fff',
  },
});