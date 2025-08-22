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
import { Fetch, Post, TokenStorage } from '../utils/apiUtils';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store/store';
import { googleSignOut } from '../utils/authentication/googleAuth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      name: 'My Transection',
      icon: 'wallet-outline',
      link: 'ManageTransection',
    },
  ];

  const userTabs = [
    // {
    //   name: 'Edit My Profile',
    //   icon: 'person-outline',
    //   link: 'EditProfileScreen',
    // },
    // {
    //   name: 'Visited Stores',
    //   icon: 'storefront-outline',
    //   link: 'CreateShopScreen',
    // },
    { name: 'Order History', icon: 'grid-outline', link: 'AddCustomerScreen' },
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
    console.log(action)
    setModalAction(action);
    setModalVisible(true);
  };

  const handelSendDeleteOtp = async () => {
    try {
      const response: any = await Post('/user/send-delete-otp', {}, 5000);
      console.log(response)
      if (response?.success) {
        throw new Error(response?.message || 'Faield to send otp, Please try again.')
      }
      return response
    } catch (error) {

    }
    const response = await Post('/user/send-delete-otp', {}, 5000);

  }
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
      TokenStorage.removeUser()
      TokenStorage.removeRole()
      TokenStorage.removeToken();
      googleSignOut()

      // Implement logout logic here
      console.log('Logging out...');
    } else if (modalAction === 'Delete') {
      handelSendDeleteOtp()

      navigation.navigate('DeleteAccountVerifyOtpScreen', { email: user?.email });
      // Implement delete account logic here
      console.log('Deleting account...');
    }
    setModalVisible(false);
  };

  useEffect(() => {
    TokenStorage.getUserData().then((user: any) => setUserData(user));
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView className="flex-1 bg-white">
        <View className="p-4 pt-10">
          {/* Notification Icon */}
          <TouchableOpacity className="absolute top-10 right-4">
            <Image source={ImagePath.what} className="w-5 h-5" />
          </TouchableOpacity>

          {/* Profile Image */}
          <View className="items-center mt-8">
            <Image
              source={ImagePath.profile} // Replace with actual image
              className="w-24 h-24 rounded-full"
            />
            <TouchableOpacity onPress={() => navigation.navigate('EditProfileScreen')} className=''>
              <Feather name="edit" size={22} className='ml-24 mt-[-6%]' color={"#ac94f4"} />
            </TouchableOpacity>
          </View>

          {/* Name and Email */}
          <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-xl text-center mt-3">
            {user?.name || 'John Doe'}
          </Text>
          <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-center text-gray-600">
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
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="ml-3 text-base text-gray-900">
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
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="ml-3 text-base text-gray-900">
                      {tab?.name}
                    </Text>
                  </View>
                  <Icon name="chevron-forward-outline" size={20} color="#000" />
                </TouchableOpacity>
              ))}
          </View>

          {/* More Links */}
          <View className="mt-6">
            <Text style={{ fontFamily: 'Raleway-Bold' }} className="text-lg   mb-2">More Us</Text>
            {moreLinks.map((tab, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center justify-between p-4 bg-primary-10 rounded-xl mb-2"
                onPress={() => navigation.navigate(tab.link)}>
                <View className="flex-row items-center">
                  <Text style={{ fontFamily: 'Raleway-Regular' }} className="ml-3 text-base text-gray-900">{tab.name}</Text>
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
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-center text-white">Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-4 border border-red-500 rounded-xl"
              onPress={() => handleAction('Delete')}>
              <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base text-center text-red-500">
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
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.3)',
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                padding: 24,
                borderRadius: 16,
                width: '80%',
              }}
            >
              <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 18, textAlign: 'center', color: '#B68AD4' }}>
                {modalAction === 'Logout' ? 'Confirm Logout' : 'Confirm Account Deletion'}
              </Text>
              <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 16, textAlign: 'center', marginTop: 8, color: '#666' }}>
                {modalAction === 'Logout'
                  ? 'Are you sure you want to log out?'
                  : 'Are you sure you want to delete your account? This action cannot be undone.'}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 }}>
                <TouchableOpacity
                  style={{
                    padding: 12,
                    backgroundColor: '#e5e5e5',
                    borderRadius: 12,
                    flex: 1,
                    marginRight: 8,
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 16, textAlign: 'center', color: '#000' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    padding: 12,
                    backgroundColor: 'red',
                    borderRadius: 12,
                    flex: 1,
                    marginLeft: 8,
                  }}
                  onPress={confirmAction}
                >
                  <Text style={{ fontFamily: 'Raleway-Regular', fontSize: 16, textAlign: 'center', color: '#fff' }}>
                    {modalAction === 'Logout' ? 'Logout' : 'Delete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
