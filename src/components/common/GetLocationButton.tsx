import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentLocationWithAddress } from '../../utils/tools/locationServices';

const GetLocationButton = ({ setLocation }: any) => {
    const [showOptions, setShowOptions] = useState(false);
    const [isLocationLoading, setIsLocationLoading] = useState(false);
    const [locationData, setLocationData] = useState<any>(null)
    const dispatch = useDispatch();
    const { status: userStatus, data: user }: any = useSelector(
        (state: any) => state.user,
    );


    const getLiveLocation = async () => {
        try {
            setIsLocationLoading(true);
            await getCurrentLocationWithAddress(setLocation || setLocationData, dispatch, user);
        } catch (error) {
            console.error('Failed to get location:', error);
        } finally {
            setIsLocationLoading(false);
        }
    };

    const manualAddLocation = () => {
        // You can navigate to a modal or screen from here
        console.log('Manual location input requested');
    };

    return (
        <View className="absolute bottom-8 right-8 items-end z-[50000]">
            {/* Floating Button */}
            <TouchableOpacity
                onPress={() => {
                    setShowOptions(false);
                    getLiveLocation();
                }}
                className="bg-primary-90 w-14 h-14 rounded-full justify-center items-center shadow-lg"
            >
                {isLocationLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Ionicons name="location" size={24} color="#fff" />
                )}
            </TouchableOpacity>

            {/* Options */}
            {showOptions && (
                <View className="bg-white rounded-lg p-3 w-48 mt-2 shadow-md space-y-2">
                    <Pressable
                        onPress={() => {
                            setShowOptions(false);
                            getLiveLocation();
                        }}
                        className="flex-row items-center space-x-2 py-2"
                    >
                        <Ionicons name="locate" size={20} color="#333" />
                        <Text className="text-sm text-gray-800">Use Current Location</Text>
                    </Pressable>

                    <Pressable
                        onPress={() => {
                            setShowOptions(false);
                            manualAddLocation();
                        }}
                        className="flex-row items-center space-x-2 py-2 hidden"
                    >
                        <Ionicons name="create-outline" size={20} color="#333" />
                        <Text className="text-sm text-gray-800">Enter Location Manually</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
};

export default GetLocationButton;
