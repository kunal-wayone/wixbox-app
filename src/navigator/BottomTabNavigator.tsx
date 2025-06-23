import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, ActivityIndicator, View } from 'react-native';

import HomeScreen from '../(tabs)/HomeScreen';
import CustormerScreen from '../(tabs)/CustormerScreen';
import AnalyticsScreen from '../(tabs)/AnalyticsScreen';
import ProfileScreen from '../(tabs)/ProfileScreen';

import { ImagePath } from '../constants/ImagePath';
import UserHomeScreen from '../screens/userScreens/UserHomeScreen';
import UserMomentsScreen from '../screens/userScreens/UserMomentsScreen';
import UserMySavedScreen from '../screens/userScreens/UserMySavedScreen';
import { TokenStorage } from '../utils/apiUtils';
import LoadingComponent from '../screens/otherScreen/LoadingComponent';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const Tab = createBottomTabNavigator();

const ownerIconMap = {
  Home: ImagePath.home,
  Customer: ImagePath.userstar,
  Analytics: ImagePath.analytic,
  Profile: ImagePath.profile,
};

const userIconMap = {
  Market: ImagePath.home,
  Moment: ImagePath.location2,
  'MY Saved': ImagePath.saved,
  Profile: ImagePath.profile,
};

export default function BottomTabNavigator() {
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { status: userStatus, data: user }: any = useSelector(
    (state: RootState) => state.user,
  );


  // useEffect(() => {
  //   if (!user) {
  //     TokenStorage.getUserData()
  //       .then(user => {
  //         setUserData(user);
  //         console.log(user);
  //       })
  //       .finally(() => setIsLoading(false));
  //   } else {
  //     setUserData(user)
  //   }
  // }, []);

  const screenOptions =
    (iconMap: any) =>
      ({ route }: { route: any }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }: { focused: boolean }) => (
          <Image
            source={iconMap[route.name]}
            resizeMode="contain"
            style={{
              width: 24,
              height: 24,
              tintColor: focused ? '#B68AD4' : '#313131',
            }}
          />
        ),
        tabBarStyle: {
          height: 75,
          paddingTop: 5,
          paddingBottom: 10,
          backgroundColor: '#fff',
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingTop: 3,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarActiveTintColor: '#B68AD4',
        tabBarInactiveTintColor: '#313131',
      });

  // if (isLoading) {
  //   return <LoadingComponent />;
  // }

  console.log(user)
  if (user?.role === 'vendor') {
    return (
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={screenOptions(ownerIconMap)}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Customer" component={CustormerScreen} />
        <Tab.Screen name="Analytics" component={AnalyticsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName="Market"
      screenOptions={screenOptions(userIconMap)}>
      <Tab.Screen name="Market" component={UserHomeScreen} />
      <Tab.Screen name="Moment" component={UserMomentsScreen} />
      <Tab.Screen name="MY Saved" component={UserMySavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
