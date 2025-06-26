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
} from 'react-native';
import React, { useEffect, useState } from 'react';
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
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';


const UserHomeScreen = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [feature, setFeature] = useState([
    {
      id: 1,
      name: 'Near Me',
      image: ImagePath.location,
      link: '',
    },
    {
      id: 2,
      name: 'Top Cafes',
      image: ImagePath.cofee,
      link: '',
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
  const { status: userStatus, data: user }: any = useSelector(
    (state: RootState) => state.user,
  );

  // Fetch user data on component mount
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       setIsLoading(true);
  //       const user = await TokenStorage.getUserData();
  //       if (user) {
  //         setUserData(user);
  //       } else {
  //         ToastAndroid.show('Failed to load user data', ToastAndroid.SHORT);
  //       }
  //     } catch (error) {
  //       ToastAndroid.show('Error loading user data', ToastAndroid.SHORT);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigation.navigate('SearchScreen', { query: searchQuery });
      setSearchQuery('')
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4 w-11/12 overflow-hidden ">
                <Image
                  source={ImagePath.profile1}
                  className="w-14 h-14 rounded-full "
                />
                <Text>{user?.name || "Jaydev Vihar"}, {user?.user_addresses[0]?.city + ", " + user?.user_addresses[0]?.state || "Bhuvaneshwar"}</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('NotificationScreen')}
                className="bg-primary-20 w-7 h-7 rounded-full justify-center items-center">
                <Image
                  source={ImagePath.bellIcon}
                  className="h-3 w-3"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-lg my-4">What’s your plan for today ?</Text>
              <View className="flex-row justify-between mb-6">
                <View className="flex-1 flex-row items-center px-1.5 border border-gray-300 bg-gray-100 rounded-xl">
                  <Ionicons
                    name="search"
                    size={20}
                    color="#4B5563"
                    className="ml-2"
                  />
                  <TextInput
                    className=" text-lg w-full "
                    placeholder="Search Food, Restaurants, Dishes"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearchSubmit}
                    returnKeyType="search" // optional: makes the keyboard show "Search"
                  />
                </View>
              </View>
            </View>
            <Banner imageUrl={ImagePath.grandopening} showOverlay={false} />
            <CategorySection />
            <ProductSlider />
            <Banner imageUrl={ImagePath.banner} showOverlay={false} />

            <View>
              {/* Section Header */}
              <View className="mb-3">
                <Text className="text-lg font-semibold text-gray-900">
                  Picked For You
                </Text>
                <Text className="text-sm text-gray-500">
                  Discover nearby picks tailored for you
                </Text>
              </View>
              <View className="flex-row items-center">
                {feature.map((cat: any) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => navigation.navigate(cat?.link)}
                    className="flex-col justify-center items-center bg-primary-10 rounded-xl mx-2 w-20 h-24">
                    <Image
                      source={cat.image}
                      className="w-8 h-8  mb-2"
                      resizeMode="contain"
                    />
                    <Text className="text-xs font-poppins font-bold px-2 text-center text-gray-700">
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <FreshStoreSection />
            <PopularAreaSection />
            <VisitNearByStores />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UserHomeScreen;
