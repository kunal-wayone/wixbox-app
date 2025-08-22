import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  TouchableWithoutFeedback,
  ToastAndroid,
  RefreshControl,
} from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { ImagePath } from '../../constants/ImagePath';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Banner from '../../components/common/Banner';
import CategorySection from '../../components/CategorySection';
import ProductSlider from '../../components/ProductSlider';
import FreshStoreSection from '../../components/FreshStoreSection';
import PopularAreaSection from '../../components/PopularAreaSection';
import VisitNearByStores from '../../components/VisitNearByStores';
import { TokenStorage } from '../../utils/apiUtils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { getCurrentLocationWithAddress } from '../../utils/tools/locationServices';
import GetLocationButton from '../../components/common/GetLocationButton';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { fetchWishlist } from '../../store/slices/wishlistSlice';

const tastyBrightGradients = [
  ['#fdba74', '#f97316'],
  ['#fca5a5', '#ef4444'],
  ['#93c5fd', '#3b82f6'],
  ['#c084fc', '#9333ea'],
  ['#fde68a', '#f59e0b'],
  ['#34d399', '#059669'],
];
const featureData = [
  {
    id: 1,
    name: 'Near Me',
    image: ImagePath.location,
    link: 'Moment',
  },
  {
    id: 2,
    name: 'Top Cafes',
    image: ImagePath.cofee,
    link: 'TopCafesScreen',
  },
  {
    id: 3,
    name: 'High On Demands',
    image: ImagePath.fire,
    link: 'HighOnDemandScreen',
  },
  {
    id: 4,
    name: 'Book a Table',
    image: ImagePath.calender,
    link: 'BookATableScreen',
  },
]

const UserHomeScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [feature, setFeature] = useState(featureData);
  const [userData, setUserData] = useState<any>(null);
  const isFocused = useIsFocused()
  const [isLoading, setIsLoading] = useState(true);
  const [isLocation, setIsLocation] = useState(false)
  const [locationData, setLocationData] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false);
  const { status: userStatus, data: user }: any = useSelector(
    (state: RootState) => state.user,
  );
  const { shop_ids, menu_items, status, error } = useSelector((state: any) => state.wishlist);
  console.log(menu_items, shop_ids)
  // Fetch wishlist on component mount
  useEffect(() => {
    if (isFocused) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, refreshing, isFocused]);


  // Fetch user data
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const user = await TokenStorage.getUserData();
      if (user) {
        setUserData(user);
      } else {
        ToastAndroid.show('Failed to load user data', ToastAndroid.SHORT);
      }
    } catch (error) {
      ToastAndroid.show('Error loading user data', ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserData().then(() => setRefreshing(false));
  }, []);


  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchScreen', { query: searchQuery });
      setSearchQuery('');
    }
  };

  const getLiveLocation = async () => {
    try {
      setIsLocation(true); // Start loading
      await getCurrentLocationWithAddress(setLocationData, dispatch, user);
    } catch (error) {
      console.error("Failed to get location:", error);
      // Optionally show an alert or toast
    } finally {
      setIsLocation(false); // Stop loading
    }
  };



  useEffect(() => {
    getLiveLocation()
    fetchUserData();
  }, []);


  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <SkeletonPlaceholder>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28 }} />
        <View style={{ marginLeft: 16, flex: 1 }}>
          <View style={{ width: 150, height: 20, borderRadius: 4 }} />
          <View style={{ width: 100, height: 16, borderRadius: 4, marginTop: 8 }} />
        </View>
        <View style={{ width: 28, height: 28, borderRadius: 14 }} />
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ width: '100%', height: 40, borderRadius: 12, marginVertical: 16 }} />
        <View style={{ width: '100%', height: 150, borderRadius: 12 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <View key={index} style={{ width: 80, height: 96, borderRadius: 12 }} />
            ))}
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <View style={{ marginLeft: 16, flex: 1 }}>
          <View style={{ width: 150, height: 20, borderRadius: 4 }} />
          <View style={{ width: 100, height: 16, borderRadius: 4, marginTop: 8 }} />
        </View>
        <View style={{ width: 28, height: 28, borderRadius: 14 }} />
      </View>
      <View style={{ paddingHorizontal: 16 }}>
        <View style={{ width: '100%', height: 40, borderRadius: 12, marginVertical: 16 }} />
        <View style={{ width: '100%', height: 150, borderRadius: 12 }} />
      </View>
    </SkeletonPlaceholder>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <SkeletonLoader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

          <ScrollView
            contentContainerStyle={{ padding: 16 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            {/* Gradient Overlay */}
            <View className="flex-row items-center justify-between" >
              <View className='flex-row items-center gap-2'>
                <View className='bg-primary-100 p-3 rounded-full'>
                  <Image source={ImagePath.eater} className='w-7 h-7' style={{ tintColor: "white" }} resizeMode='contain' />
                </View>
                <View>
                  <Text className="text-lg  pl-1" style={{ fontFamily: 'Raleway-Bold' }} numberOfLines={1} ellipsizeMode='tail'>
                    {user?.name || 'Guest User'}
                  </Text>
                  <View className='flex-row items-center gap-1'>
                    <Ionicons name='location-outline' size={16} />
                    <Text className='text-sm' style={{ fontFamily: 'Raleway-Regular' }} numberOfLines={1} ellipsizeMode='tail' >
                      {(user?.user_addresses[0]?.city || '') +
                        ', ' +
                        (user?.user_addresses[0]?.state || '') + ", (" + (user?.user_addresses[0]?.pincode || '') + ")"}
                    </Text>
                  </View>
                  <Text className='text-sm hidden' style={{ fontFamily: 'Raleway-Regular' }}>
                    {(user?.user_addresses[0]?.longitude || '') +
                      ', ' +
                      (user?.user_addresses[0]?.latitude || '')}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity onPress={() => navigation.navigate("NotificationScreen")} className="rounded-full p-4 justify-center items-center">
                  <Ionicons name='notifications-outline' size={22} />
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <Text className="mb-2   mt-3" style={{ fontFamily: 'Raleway-Regular' }}>What’s your plan for today?</Text>
              <View className="flex-row justify-between mb-6">
                <View className="flex-1 flex-row items-center px-1.5 border border-gray-300 bg-gray-100 rounded-xl">
                  <Ionicons name="search" size={20} color="#4B5563" className="ml-2" />
                  <TextInput
                    className="w-full text-gray-900   "
                    placeholder="Search Food, Restaurants, Dishes"
                    placeholderTextColor={"#000"}
                    value={searchQuery}
                    style={{ fontFamily: 'Raleway-Regular' }}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearchSubmit}
                    returnKeyType="search"
                  />
                </View>
              </View>
            </View>
            <Banner position="Top" showOverlay={false} />
            <CategorySection />
            <ProductSlider />
            <Banner position="Middle" showOverlay={false} />
            <View>
              <View className="mb-3">
                <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-lg   font-semibold text-gray-900">
                  Picked For You
                </Text>
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm   text-gray-500">
                  Discover nearby picks tailored for you
                </Text>
              </View>
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {feature.map((cat: any, index: number) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => navigation.navigate(cat?.link)}
                    style={{
                      width: '24%', // for 2-column responsive layout
                      borderRadius: 16,
                      overflow: 'hidden',
                    }}
                    className="h-28"
                  >
                    <LinearGradient
                      colors={tastyBrightGradients[index + 20 % tastyBrightGradients.length]}
                      // start={{ x: 0, y: 0 }}
                      // end={{ x: 1, y: 1 }}
                      className="flex-1 justify-center items-center p-3 rounded-xl"
                    >
                      <Image
                        source={cat.image}
                        resizeMode="contain"
                        className="w-10 h-10 mb-2"
                        style={{ tintColor: "#fff" }}
                      />
                      <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-xs   font-semibold text-white text-center">
                        {cat.name}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <FreshStoreSection />
            <VisitNearByStores />
            <PopularAreaSection />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <GetLocationButton />
    </SafeAreaView >
  );
};

export default UserHomeScreen;