import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ToastAndroid,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ImagePath } from '../../constants/ImagePath';
import { Fetch, Post } from '../../utils/apiUtils';

interface NotificationProps {
  id: string;
  title: string;
  message: string;
  time: string;
  type: string;
  is_read: number;
}

const SkeletonLoader: React.FC = () => {
  return (
    <View className="flex-1 px-4 pt-4">
      {[...Array(3)].map((_, index) => (
        <View key={index} className="flex-row items-center gap-4 mb-4 p-4 bg-gray-100 rounded-xl animate-pulse">
          <View className="w-8 h-8 bg-gray-300 rounded-full" />
          <View className="flex-1">
            <View className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
            <View className="h-3 bg-gray-300 rounded w-1/2" />
          </View>
        </View>
      ))}
    </View>
  );
};

const NotificationCard: React.FC<{
  notification: NotificationProps;
  onViewDetails: (notification: NotificationProps) => void;
}> = ({ notification, onViewDetails }) => {
  return (
    <TouchableOpacity
      onPress={() => onViewDetails(notification)}
      className={`flex-row items-center gap-4 mb-4 p-4 rounded-xl ${notification.is_read ? 'bg-primary-10' : 'bg-primary-30'
        } shadow-sm`}
    >
      <View
        className={`w-10 h-10 flex-row items-center justify-center rounded-full ${notification.is_read ? 'bg-primary-80' : 'bg-primary-100'
          }`}
      >
        <Image
          source={ImagePath.bellIcon}
          className="w-5 h-5"
          tintColor="#fff"
          resizeMode="contain"
        />
      </View>
      <View className="flex-1">
        <Text className="text-black font-poppins font-medium">{notification.title}</Text>
        <Text className="text-gray-600 font-poppins text-sm" numberOfLines={2}>
          {notification.message}
        </Text>
        <Text className="text-gray-400 font-poppins text-xs">
          {new Date(notification.time).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </Text>
        {!notification.is_read && (
          <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const NotificationDetailModal: React.FC<{
  visible: boolean;
  notification: NotificationProps | null;
  onClose: () => void;
}> = ({ visible, notification, onClose }) => {
  if (!notification) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-2xl p-6 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-poppins font-semibold text-black">
              {notification.title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 font-poppins mb-4">
            {notification.message}
          </Text>
          <Text className="text-gray-400 font-poppins text-sm mb-4">
            Type: {notification.type}
          </Text>
          <Text className="text-gray-400 font-poppins text-sm">
            {new Date(notification.time).toLocaleString('en-IN', {
              timeZone: 'Asia/Kolkata',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </Text>
          <TouchableOpacity
            className="mt-6 bg-primary-80 py-3 rounded-lg"
            onPress={onClose}
          >
            <Text className="text-white font-poppins text-center font-medium">
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const NotificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<NotificationProps | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response: any = await Fetch('/user/notifications', undefined, 5000);

      if (!response.success) {
        throw new Error('Failed to fetch notifications');
      }

      const formattedNotifications = response.notifications.map(
        (item: any) => ({
          id: item.id.toString(),
          title: item.title,
          message: item.message,
          time: item.created_at,
          type: item.type,
          is_read: item.is_read,
        }),
      );
      setNotifications(formattedNotifications);
    } catch (error: any) {
      setError(error.message || 'Failed to load notifications');
      ToastAndroid.show(
        error.message || 'Failed to load notifications',
        ToastAndroid.LONG,
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response: any = await Post(`/user/notifications/${notificationId}/read`, {}, 5000,);
      console.log(response)
      if (!response.success) {
        throw new Error('Failed to mark notification as read');
      }

      // Update local state to mark notification as read
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: 1 }
            : notification,
        ),
      );
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Failed to mark notification as read',
        ToastAndroid.LONG,
      );
    }
  };

  const handleViewDetails = (notification: NotificationProps) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchNotifications();
  };

  useEffect(() => {
    if (isFocused) {
      fetchNotifications();
    }
  }, [isFocused]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white shadow-sm">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-poppins font-semibold text-black">
          Notifications
        </Text>
        <View className="p-2 w-10" />
      </View>

      {/* Error State */}
      {error && !isLoading && (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500 font-poppins mb-4">{error}</Text>
          <TouchableOpacity
            onPress={fetchNotifications}
            className="bg-primary-80 py-2 px-4 rounded-lg"
          >
            <Text className="text-white font-poppins">Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading State */}
      {isLoading && <SkeletonLoader />}

      {/* Notifications List */}
      {!isLoading && !error && notifications.length === 0 && (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-500 font-poppins text-lg">
            No notifications found
          </Text>
        </View>
      )}

      {!isLoading && !error && notifications.length > 0 && (
        <ScrollView
          className="flex-1 px-4 pt-4"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']} // Primary color for refresh indicator
            />
          }
        >
          {notifications.map(notification => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onViewDetails={handleViewDetails}
            />
          ))}
        </ScrollView>
      )}

      {/* Notification Details Modal */}
      <NotificationDetailModal
        visible={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />
    </SafeAreaView>
  );
};

export default NotificationScreen;