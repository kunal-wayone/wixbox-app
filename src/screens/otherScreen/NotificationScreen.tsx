import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../../constants/ImagePath';

interface NotificationProps {
  id: string;
  message: string;
  time: string;
}

const NotificationCard: React.FC<NotificationProps> = ({
  message,
  time,
}: any) => {
  return (
    <View className="flex-row items-center gap-4 mb-4 p-4 bg-primary-10 rounded-xl">
        <View className='w-8 h-8 bg-primary-80 flex-row items-center justify-center  rounded-full'>
            <Image source={ImagePath.bellIcon} className='w-4 h-4' tintColor={"#fff"} resizeMode='contain' />
        </View>
      <View className="flex-1">
        <Text className="text-black font-poppins">{message}</Text>
        <Text className="text-gray-500 font-poppins text-sm">{time}</Text>
      </View>
    </View>
  );
};

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation();

  // Sample notification data
  const notifications: NotificationProps[] = [
    {id: '1', message: 'New message from Admin', time: '10:30 AM'},
    {id: '2', message: 'System update scheduled', time: 'Yesterday, 3:15 PM'},
    {id: '3', message: 'Profile updated successfully', time: '2 days ago'},
    {id: '4', message: 'Reminder: Complete your profile', time: '3 days ago'},
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with Back Button and Custom Title */}
      <View className="flex-row items-center px-4 py-3 border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-poppins font-semibold text-black">
          Notifications
        </Text>
        {/* Empty view to balance the layout */}
        <View className="p-2 w-10" />
      </View>

      {/* Notification Cards */}
      <ScrollView className="flex-1 px-4 pt-4">
        {notifications.map(notification => (
          <NotificationCard
            key={notification.id}
            message={notification.message}
            time={notification.time}
            id={''}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;
