import React, {useState, useRef} from 'react';
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
} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Banner from '../components/common/Banner';
import {ImagePath} from '../constants/ImagePath';
import ProfileCard from '../components/common/ProfileCard';
import ShiftCard from '../components/ShiftCard';
import Menu from '../components/common/Menu';
import Review from '../components/common/Review';
import Post from '../components/common/Posts';
import {useNavigation} from '@react-navigation/native';

const Stack = createNativeStackNavigator();
const {height: SCREEN_HEIGHT} = Dimensions.get('window');

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
  const navigaton = useNavigation<any>();
  const [shopStatus, setShopStatus] = useState(true);
  const [activeTab, setActiveTab] = useState('About');
  const scrollY = useRef(new Animated.Value(0)).current;
  const tabBarRef = useRef<any>(null);
  const [tabBarOffset, setTabBarOffset] = useState<any>(0);

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
          <View className="py-4 flex-1">
            <Text className="text-xl text-gray-600 font-semibold font-poppins mb-2">
              About Us
            </Text>
            <Text className="font-poppins text-gray-600 mb-4">
              A best Hangout Place for everyone to have hot crispy snacks with
              both veg and non-veg options, lorem ipsum dolor sit amet...
            </Text>
            
            <Text className="text-xl text-gray-600 font-semibold font-poppins mb-2">
              Business Contact
            </Text>
            <Text className="font-poppins text-gray-600">+91 9861375868</Text>
            <Text className="text-xl text-gray-600 font-semibold font-poppins mb-4 mt-4">
              Business Hours
            </Text>
            {shiftData.map((item, index) => (
              <ShiftCard
                key={index}
                day={item.day}
                shift={item.shift}
                firstShift={item.firstShift}
                secondShift={item.secondShift}
              />
            ))}
            <Text className="text-xl text-gray-600 font-semibold font-poppins mb-2 mt-4">
              Address
            </Text>
            <Text className="font-poppins text-gray-600 mb-4">
              Store No - 002, Belagere Rd, Near Hilife Pearl Shell, Varthur,
              Bangalore
            </Text>
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

  return (
    <View className="flex-1 bg-white">
      <Animated.ScrollView
        className="p-4"
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={16}>
        <Animated.View style={{transform: [{translateY}]}}>
          <View className="flex-row items-center justify-between py-4">
            <Text className="text-lg font-semibold font-poppins pl-2">
              Burger One (Cafe & Bakery)
            </Text>
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={() => navigaton.navigate('NotificationScreen')}
                className="bg-primary-20 w-7 h-7 rounded-full justify-center items-center">
                <Image
                  source={ImagePath.bellIcon}
                  className="h-3 w-3"
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity className="bg-primary-20 w-7 h-7 rounded-full justify-center items-center">
                <Image
                  source={ImagePath.edit}
                  className="h-3 w-3"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>

          <Banner imageUrl={ImagePath.mystore} showOverlay={false} />
          <ProfileCard
            profileImageUrl={ImagePath.profile1}
            name="John Doe"
            iconImageUrl={ImagePath.crown}
            status="Online"
            rating={4}
            layout="row"
            onProfilePress={() =>
              ToastAndroid.show(
                "John Doe's profile clicked!",
                ToastAndroid.SHORT,
              )
            }
          />

          {shopStatus && (
            <>
              <View className="flex-row items-center justify-between gap-4">
                <TouchableOpacity className="flex-row items-center gap-3">
                  <View className="bg-primary-20 w-10 h-10 rounded-full justify-center items-center">
                    <Image
                      source={ImagePath.home2}
                      className="h-4 w-4"
                      resizeMode="contain"
                    />
                  </View>
                  <Text className="text-lg font-poppins">Burger One</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center gap-3">
                  <View className="bg-primary-20 w-10 h-10 rounded-full justify-center items-center">
                    <Image
                      source={ImagePath.cafe}
                      className="h-4 w-4"
                      resizeMode="contain"
                    />
                  </View>
                  <Text className="text-lg font-poppins">Cafe and Bakery</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity className="bg-primary-20 p-4 rounded-xl mt-6 my-4">
                <Text className="text-center">
                  Member Since - February 3 2025
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View className="flex-row items-center justify-between py-2">
            <Text className="text-lg font-semibold font-poppins pl-2">
              Shop Status:
            </Text>
            <Switch
              value={shopStatus}
              onValueChange={val => {
                console.log(val);
                setShopStatus(val);
              }}
            />
          </View>

          <View className="flex-row items-center justify-between gap-3 py-4">
            <TouchableOpacity
              disabled={!shopStatus}
              className={`${
                shopStatus ? 'bg-primary-70' : 'bg-primary-50'
              } p-4 w-1/2 rounded-xl justify-center items-center`}>
              <Text className="text-white font-bold font-poppins">
                Create Ad
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
            onPress={()=>navigaton.navigate("AddProductScreen")}
              disabled={!shopStatus}
              className={`${
                shopStatus ? 'bg-white' : ' '
              } p-4 w-1/2 border rounded-xl justify-center items-center`}>
              <Text
                className={`font-bold font-poppins ${
                  shopStatus ? '' : 'text-gray-500'
                }`}>
                Add Products
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
                  className={`text-lg px-2 font-poppins ${
                    activeTab === d ? 'font-bold' : 'text-gray-500'
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
        <View style={{minHeight: SCREEN_HEIGHT * 0.7}}>
          {renderTabContent()}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default HomeScreen;
