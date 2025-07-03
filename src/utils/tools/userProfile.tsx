import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useState, useCallback } from 'react';
import PermissionsHelper from './PermissionHelper';
// Optional: for reverse geocoding
// import Geocoding from 'react-native-geocoding';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string;
  loading: boolean;
  error: string | null;
}

const UserProfile = () => {
  const { data: user } = useSelector((state: any) => state.user);
  const [location, setLocation] = useState<LocationState>({
    error: null,
    loading: true,
    latitude: null,
    longitude: null,
    address: 'Fetching location...',
  });
  // const [avatarUri, setAvatarUri] = useState(
  //   user?.image || 'https://randomuser.me/api/portraits/men/32.jpg',
  // );

  // Check if location services are enabled
  const checkLocationServices = useCallback((): Promise<boolean> => {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        () => resolve(true),
        error => {
          if (error.code === 1) {
            resolve(false); // Permission denied
          } else if (error.code === 2) {
            resolve(false); // Location services disabled
          } else {
            resolve(true); // Other errors, but services might be available
          }
        },
        { enableHighAccuracy: false, timeout: 1000, maximumAge: 0 },
      );
    });
    // return Promise.resolve(false);
  }, []);

  // Get current position
   const getCurrentLocation = useCallback(async () => {
    try {
      setLocation(prev => ({ ...prev, loading: true, error: null }));

      const hasPermission = await PermissionsHelper.requestLocationPermission();
      if (!hasPermission) {
        setLocation({
          latitude: null,
          loading: false,
          longitude: null,
          error: 'Permission denied',
          address: 'Location permission denied',
        });
        return;
      }

      const servicesEnabled = await checkLocationServices();
      if (!servicesEnabled) {
        setLocation({
          latitude: null,
          loading: false,
          longitude: null,
          error: 'Location services disabled',
          address: 'Please enable location services',
        });
        return;
      }

      Geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          console.log('Location obtained:', { latitude, longitude });

          setLocation({
            latitude,
            longitude,
            address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(
              4,
            )}`,
            loading: false,
            error: null,
          });

          // Optional: Reverse geocoding to get address
          // reverseGeocode(latitude, longitude);
        },
        error => {
          console.log('Geolocation error:', error);
          let errorMessage = 'Location fetch failed';

          switch (error.code) {
            case 1:
              errorMessage = 'Permission denied';
              break;
            case 2:
              errorMessage = 'Location unavailable';
              break;
            case 3:
              errorMessage = 'Location request timed out';
              break;
            case 5:
              errorMessage = 'Location service disabled';
              break;
            default:
              errorMessage = `Location error: ${error.message}`;
          }

          setLocation({
            latitude: null,
            longitude: null,
            address: errorMessage,
            loading: false,
            error: errorMessage,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          distanceFilter: 10,
        },
      );
    } catch (err) {
      console.log('Location fetch exception:', err);
      setLocation({
        latitude: null,
        longitude: null,
        address: 'Unexpected error while fetching location',
        loading: false,
        error: 'Unexpected error',
      });
    }
  }, [checkLocationServices]);

  // Optional: Reverse geocoding function
  // const reverseGeocode = async (latitude: number, longitude: number) => {
  //   try {
  //     // Initialize the module (you need to set your API key)
  //     // Geocoding.init("YOUR_GOOGLE_MAPS_API_KEY");
  //
  //     // const response = await Geocoding.from(latitude, longitude);
  //     // const address = response.results[0]?.formatted_address;
  //
  //     // setLocation(prev => ({
  //     //   ...prev,
  //     //   address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
  //     // }));
  //   } catch (error) {
  //     console.log('Reverse geocoding error:', error);
  //   }
  // };

  // Watch position for continuous tracking
  const watchLocation = useCallback(() => {
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation(prev => ({
          ...prev,
          latitude,
          longitude,
          address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`,
          loading: false,
          error: null,
        }));
      },
      error => {
        console.log('Watch position error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 10000,
        fastestInterval: 5000,
      },
    );

    return () => Geolocation.clearWatch(watchId);
  }, []);

  // Retry location fetch
  const retryLocation = () => {
    getCurrentLocation();
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      getCurrentLocation();
    }, 500);

    return () => clearTimeout(timeout);
  }, [getCurrentLocation]);

  const renderLocationContent = () => {
    if (location.loading) {
      return (
        <View className="flex-row items-center">
          <ActivityIndicator size="small" color="#ffffff" />
          <Text className="text-sm text-white ml-2">Fetching location...</Text>
        </View>
      );
    }

    if (location.error) {
      return (
        <TouchableOpacity onPress={retryLocation}>
          <Text className="text-sm text-red-200">
            {location.address} (Tap to retry)
          </Text>
        </TouchableOpacity>
      );
    }

    return <Text className="text-sm text-white">{location.address}</Text>;
  };

  return (
    <View className="flex-row items-center gap-2 w-[70%]">
      {/* <Image
        resizeMode="cover"
        source={
          user.image
            ? { uri: user.image }
            : require('../assets/images/placeholder.png')
        }
        className="w-16 h-16 border-2 border-white text-white rounded-full"
      /> */}
      <View className="flex-1">
        <Text className="text-lg font-semibold text-white">
          Hello, {user?.name || 'User'}
        </Text>
        {renderLocationContent()}
      </View>
    </View>
  );
};

export default UserProfile;