import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import React, {useRef, useState} from 'react';
import {ImagePath} from '../../constants/ImagePath';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import MaterialIcon from 'react-native-vector-icons/';

import Menu from '../../components/common/Menu';
import Post from '../../components/common/Posts';
import Review from '../../components/common/Review';
import ShiftCard from '../../components/ShiftCard';

const {height} = Dimensions.get('screen');

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

const ShopDetailsScreen = () => {
  const navigation = useNavigation<any>();
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
            <Text className="text-lg text-gray-600 font-semibold font-poppins mb-2 mt-4">
              Address
            </Text>
            <Text className="font-poppins text-sm text-gray-600 mb-4">
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
    <>
      <ScrollView contentContainerStyle={{padding: 16}} className="bg-white">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-row items-center gap-4">
            <Ionicons name={'arrow-back'} size={20} />
          </TouchableOpacity>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => navigation.navigate('NotificationScreen')}
              className="bg-primary-20 w-7 h-7 rounded-full justify-center items-center">
              <Image
                source={ImagePath.pin}
                className="h-3 w-3"
                resizeMode="contain"
              />
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
        </View>

        <View className="mb-4">
          <Image
            source={ImagePath.restaurant1}
            className="w-full h-64 rounded-xl mb-4 "
          />
          <Text className="text-lg">{'Burger One (Cafe & Bakery)'}</Text>
          {/* Address */}
          <View className="flex-row items-center mt-2 bg-primary-80 w-3/5 mb-2 rounded-xl p-2 overflow-hidden">
            <MaterialIcons
              name="location-on"
              size={16}
              color="white"
              className="mr-1"
            />
            <Text className="font-poppins text-white">
              Electronic City, Banglore
            </Text>
          </View>
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-green-600">Open Now</Text>
            <Text>Closing Soon</Text>
          </View>
          <View className="flex-row items-center gap-4 mb-3">
            <Text>Payment:</Text>
            <View className="flex-row items-center gap-4">
              <Image
                source={ImagePath.gpay}
                className="w-6 h-6"
                resizeMode="contain"
              />
              <Image
                source={ImagePath.ppay}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </View>
          </View>
          <TouchableOpacity className="p-4 bg-primary-80 rounded-xl ">
            <Text className="text-center text-white">Reserve a Table</Text>
          </TouchableOpacity>
        </View>

        <View
          ref={tabBarRef}
          onLayout={onTabBarLayout}
          className="mb-4"
          style={{
            position: 'relative',
            top: 0,
            zIndex: 10,
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
        <View className="bg-primary-10 p-4 rounded-xl overflow-hidden  ">
          {renderTabContent()}
        </View>
      </ScrollView>
      <View className="absolute bottom-0 z-[1000] bg-white w-full h-24">
        <TouchableOpacity
          onPress={() => navigation.navigate('')}
          className="flex-row items-center gap-4 bg-primary-100 w-11/12 m-auto p-4 rounded-xl ">
          <Text className="text-center w-full font-bold font-poppins text-white ">
            Get Directions
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default ShopDetailsScreen;
