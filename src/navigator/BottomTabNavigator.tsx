import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import HomeScreen from '../(tabs)/HomeScreen';
import CustormerScreen from '../(tabs)/CustormerScreen';
import AnalyticsScreen from '../(tabs)/AnalyticsScreen';
import ProfileScreen from '../(tabs)/ProfileScreen';
import { ImagePath } from '../constants/ImagePath';

const Tab = createBottomTabNavigator();

const iconMap = {
    Home: ImagePath.home,
    Customer: ImagePath.userstar,
    Analytics: ImagePath.analytic,
    Profile: ImagePath.profile,
};

export default function BottomTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <Image
                        source={iconMap[route.name]}
                        resizeMode="contain"
                        style={{
                            width: 24,
                            height: 24,
                            tintColor: focused ? "#B68AD4" : '#313131',
                        }}
                    />
                ),
                tabBarStyle: {
                    height: 75, // increased height
                    paddingTop: 5, // top padding inside tab bar
                    paddingBottom: 10,
                    backgroundColor: '#fff',
                    elevation: 5,
                },
                tabBarLabelStyle: {
                    fontSize: 12, // font size for label
                    paddingTop: 3, // spacing above label
                },
                tabBarItemStyle: {
                    paddingVertical: 5, // spacing within each item
                },
                tabBarActiveTintColor: "#B68AD4",
                tabBarInactiveTintColor: "#313131",
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Customer" component={CustormerScreen} />
            <Tab.Screen name="Analytics" component={AnalyticsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
