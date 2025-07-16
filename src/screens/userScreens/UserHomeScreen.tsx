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
import { useNavigation } from '@react-navigation/native';
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

const UserHomeScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [feature, setFeature] = useState([
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
  ]);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocation, setIsLocation] = useState(false)
  const [locationData, setLocationData] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false);
  const { status: userStatus, data: user }: any = useSelector(
    (state: RootState) => state.user,
  );

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
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4 w-11/12 overflow-hidden">
                <Image
                  source={ImagePath.profile1}
                  className="w-14 h-14 rounded-full"
                  resizeMode="cover"
                />
                <View>
                  <Text className='text-semibold'>
                    {user?.name || 'Jaydev Vihar'},{' '}
                  </Text>
                  <Text className='text-xs'>
                    {(user?.user_addresses[0]?.city || '') +
                      ', ' +
                      (user?.user_addresses[0]?.state || '') + ", (" + (user?.user_addresses[0]?.pincode || '') + ")"}
                  </Text>
                  <Text className='text-xs'>
                    {(user?.user_addresses[0]?.longitude || '') +
                      ', ' +
                      (user?.user_addresses[0]?.latitude || '')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('NotificationScreen')}
                className="bg-primary-20 w-9 h-9 rounded-full justify-center items-center">
                <Image
                  source={ImagePath.bellIcon}
                  className="h-5 w-5"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-lg my-4">What’s your plan for today?</Text>
              <View className="flex-row justify-between mb-6">
                <View className="flex-1 flex-row items-center px-1.5 border border-gray-300 bg-gray-100 rounded-xl">
                  <Ionicons name="search" size={20} color="#4B5563" className="ml-2" />
                  <TextInput
                    className="text-lg w-full"
                    placeholder="Search Food, Restaurants, Dishes"
                    value={searchQuery}
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
                <Text className="text-lg font-semibold text-gray-900">
                  Picked For You
                </Text>
                <Text className="text-sm text-gray-500">
                  Discover nearby picks tailored for you
                </Text>
              </View>
              <View className="flex-row items-center justify-between gap-1 m-auto">
                {feature.map((cat: any) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => navigation.navigate(cat?.link)}
                    style={{ width: "24%" }}
                    className="flex-col justify-center items-center bg-primary-10 rounded-xl h-24">
                    <Image
                      source={cat.image}
                      className="w-8 h-8 mb-2"
                      resizeMode="contain"
                    />
                    <Text className="text-xs font-poppins font-semibold px-2 text-center text-gray-700">
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <FreshStoreSection />
            <VisitNearByStores />
            {/* <PopularAreaSection /> */}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      <GetLocationButton />
    </SafeAreaView>
  );
};

export default UserHomeScreen;