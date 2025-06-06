import React, {useState} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image} from 'react-native';

import HomeScreen from '../(tabs)/HomeScreen';
import CustormerScreen from '../(tabs)/CustormerScreen';
import AnalyticsScreen from '../(tabs)/AnalyticsScreen';
import ProfileScreen from '../(tabs)/ProfileScreen';

import {ImagePath} from '../constants/ImagePath';
import UserHomeScreen from '../screens/userScreens/UserHomeScreen';
import UserMomentsScreen from '../screens/userScreens/UserMomentsScreen';
import UserMySavedScreen from '../screens/userScreens/UserMySavedScreen';

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
  // const [user, setuser] = useState('');
  // const getuser = async (role: any) => {
  //   const data: any = await AsyncStorage.setItem('user', role);
  //   setuser(data);
  //   console
  // };

  // const user: any = 'User'; // Change to 'Owner' if needed for testing
  const screenOptions =
    (iconMap: any) =>
    ({route}: {route: any}) => ({
      headerShown: false,
      tabBarIcon: ({focused}: {focused: boolean}) => (
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
  const user = 'user';
  if (user === 'Owner') {
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

  const savedScreenName = 'MY_Saved'.replace('_', ' '); // "MY Saved"

  return (
    <Tab.Navigator
      initialRouteName="Market"
      screenOptions={screenOptions(userIconMap)}>
      <Tab.Screen name="Market" component={UserHomeScreen} />
      <Tab.Screen name="Moment" component={UserMomentsScreen} />
      <Tab.Screen name={savedScreenName} component={UserMySavedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
