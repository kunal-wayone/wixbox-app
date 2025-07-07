import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../constants/ImagePath';
import { useDispatch, useSelector } from 'react-redux';
import { TokenStorage } from '../utils/apiUtils';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store/store';

const ProfileScreen = () => {
  const dispatch = useDispatch<any>();
  const navigation = useNavigation<any>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const { status: userStatus, data: user }: any = useSelector(
    (state: RootState) => state.user,
  );


  const tabs = [
    {
      name: 'Edit My Profile',
      icon: 'person-outline',
      link: 'EditProfileScreen',
    },
    { name: 'Manage Stock', icon: 'cube-outline', link: 'ManageStockScreen' },
    { name: 'Manage Ads', icon: 'cube-outline', link: 'AdsListScreen' },
    { name: 'Manage Orders', icon: 'people-outline', link: 'AddCustomerScreen' },
  ];

  const userTabs = [
    {
      name: 'Edit My Profile',
      icon: 'person-outline',
      link: 'EditProfileScreen',
    },
    {
      name: 'Visited Stores',
      icon: 'storefront-outline',
      link: 'CreateShopScreen',
    },
    { name: 'Order History', icon: 'grid-outline', link: '' },
    {
      name: 'Booked Table',
      icon: 'restaurant-outline',
      link: 'BookedTablesScreen',
    },
    // {name: 'Added Customer', icon: 'people-outline', link: 'AddCustomerScreen'},
  ];

  const moreLinks = [
    { name: 'About Us', route: 'AboutUs', link: 'AboutUsScreen' },
    { name: 'Contact Us', route: 'ContactUs', link: 'ContactUsScreen' },
    { name: 'Terms & Conditions', route: 'TermsConditions', link: 'TermsConditionScreen' },
    { name: 'Privacy Policy', route: 'PrivacyPolicy', link: 'PrivecyPolicyScreen' },
    { name: 'FAQs', route: 'Faqs', link: 'FaqsScreen' },

  ];

  const handleAction = (action: string) => {
    setModalAction(action);
    setModalVisible(true);
  };

  const confirmAction = () => {
    if (modalAction === 'Logout') {
      dispatch(logout())
        .unwrap()
        .then((success: any) => {
          console.log('Fetched User:', success);
          navigation.reset({
            index: 0,
            routes: [{ name: 'LoginScreen' }], // ⛔ Reset navigation stack
          });
          // navigation.navigate('LoginScreen');
        });
      TokenStorage.removeToken();

      // Implement logout logic here
      console.log('Logging out...');
    } else if (modalAction === 'Delete') {
      navigation.navigate('DeleteAccountScreen');
      // Implement delete account logic here
      console.log('Deleting account...');
    }
    setModalVisible(false);
  };

  useEffect(() => {
    TokenStorage.getUserData().then((user: any) => setUserData(user));
  }, []);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4 pt-10">
        {/* Notification Icon */}
        <TouchableOpacity className="absolute top-10 right-4">
          <Image source={ImagePath.what} className="w-5 h-5" />
        </TouchableOpacity>

        {/* Profile Image */}
        <View className="items-center mt-8">
          <Image
            source={ImagePath.profile1} // Replace with actual image
            className="w-24 h-24 rounded-full"
          />
        </View>

        {/* Name and Email */}
        <Text className="text-xl font-bold text-center mt-4">
          {user?.name || 'John Doe'}
        </Text>
        <Text className="text-base text-center text-gray-600">
          {user?.email || 'john.doe@example.com'}
        </Text>

        {/* Tabs */}
        <View className="mt-6">
          {user?.role === 'vendor'
            ? tabs?.map((tab, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center justify-between p-4 bg-primary-10 rounded-xl mb-2"
                onPress={() => navigation.navigate(tab?.link)}>
                <View className="flex-row items-center">
                  <Icon
                    name={tab?.icon}
                    size={20}
                    color="#000"
                    className="bg-primary-20 p-2 rounded-full"
                  />
                  <Text className="ml-3 text-base text-gray-900">
                    {tab?.name}
                  </Text>
                </View>
                <Icon name="chevron-forward-outline" size={20} color="#000" />
              </TouchableOpacity>
            ))
            : userTabs?.map((tab, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center justify-between p-4 bg-primary-10 rounded-xl mb-2"
                onPress={() => navigation.navigate(tab.link)}>
                <View className="flex-row items-center">
                  <Icon
                    name={tab?.icon}
                    size={20}
                    color="#000"
                    className="bg-primary-20 p-2 rounded-full"
                  />
                  <Text className="ml-3 text-base text-gray-900">
                    {tab?.name}
                  </Text>
                </View>
                <Icon name="chevron-forward-outline" size={20} color="#000" />
              </TouchableOpacity>
            ))}
        </View>

        {/* More Links */}
        <View className="mt-6">
          <Text className="text-lg font-bold  mb-2">More Us</Text>
          {moreLinks.map((tab, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center justify-between p-4 bg-primary-10 rounded-xl mb-2"
              onPress={() => navigation.navigate(tab.link)}>
              <View className="flex-row items-center">
                <Text className="ml-3 text-base text-gray-900">{tab.name}</Text>
              </View>
              <Icon name="chevron-forward-outline" size={20} color="#000" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout and Delete Buttons */}
        <View className="mt-6">
          <TouchableOpacity
            className="p-4 bg-primary-100 rounded-xl mb-2"
            onPress={() => handleAction('Logout')}>
            <Text className="text-base text-center text-white">Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="p-4 border border-red-500 rounded-xl"
            onPress={() => handleAction('Delete')}>
            <Text className="text-base text-center text-red-500">
              Delete Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-center items-center bg-black/30 bg-opacity-50">
          <View className="bg-white p-6 rounded-xl w-4/5">
            <Text className="text-lg font-bold text-center text-primary-100">
              {modalAction === 'Logout'
                ? 'Confirm Logout'
                : 'Confirm Account Deletion'}
            </Text>
            <Text className="text-base text-center mt-2 text-gray-600">
              {modalAction === 'Logout'
                ? 'Are you sure you want to log out?'
                : 'Are you sure you want to delete your account? This action cannot be undone.'}
            </Text>
            <View className="flex-row justify-between mt-6">
              <TouchableOpacity
                className="p-3 bg-gray-300 rounded-xl flex-1 mr-2"
                onPress={() => setModalVisible(false)}>
                <Text className="text-base text-center text-black">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="p-3 bg-red-500 rounded-xl flex-1 ml-2"
                onPress={confirmAction}>
                <Text className="text-base text-center text-white">
                  {modalAction === 'Logout' ? 'Logout' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ProfileScreen;
