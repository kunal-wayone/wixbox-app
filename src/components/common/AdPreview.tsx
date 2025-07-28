import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const AdPreview = ({ values = {}, images = [] }: any) => {
    const {
        ad_title = 'Your Ad Title Here',
        ad_type = 'Special Offer',
        caption = 'Your short caption goes here!',
        offer_starts_at,
        offer_ends_at,
        offer_start_time,
        offer_end_time,
        original_price = '0',
        discounted_price = '',
        budget = '0',
    }: any = values;

    const getAdTypeIcon = () => {
        switch (ad_type) {
            case 'Promote Product':
                return '🛍️';
            case 'Special Offer':
                return '🎉';
            case 'Event':
                return '🎈';
            default:
                return '📢';
        }
    };

    const formattedDate = (date: string | number | Date, fallback: string) =>
        date ? new Date(date).toLocaleDateString() : fallback;

    const formattedTime = (time: string | number | Date, fallback: string) =>
        time ? new Date(time).toLocaleTimeString() : fallback;

    const previewImage = images

    return (
        <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6" style={styles.shadow}>
            <View className="flex-row items-center mb-3">
                <MaterialIcons name="visibility" size={22} color="#ac94f4" />
                <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-base font-semi<Text style={{fontFamily:'Raleway-Regular'}} ml-2 text-gray-900 dark:text-white">Ad Preview</Text>
            </View>

            <View className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <Text style={{ fontFamily: 'Raleway-Bold' }} numberOfLines={1} ellipsizeMode='tail' className="text-xl  text-gray-900 dark:text-white mb-1">{ad_title}</Text>

                <View className="flex-row items-center mb-2">
                    <Text style={{ fontFamily: 'Raleway-Regular' }} numberOfLines={1} ellipsizeMode='tail' className="text-sm text-gray-600 dark:text-gray-300">{ad_type}</Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="ml-2 text-lg">{getAdTypeIcon()}</Text>
                </View>

                {previewImage ? (
                    <Image
                        source={previewImage}
                        className="w-full h-48 rounded-lg mb-3"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="w-full h-48 rounded-lg bg-gray-200 dark:bg-gray-600 justify-center items-center mb-3">
                        <FontAwesome name="image" size={40} color="#ccc" />
                        <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-xs text-gray-500 mt-1">No image uploaded</Text>
                    </View>
                )}

                <Text style={{ fontFamily: 'Raleway-Regular' }} numberOfLines={2} ellipsizeMode='tail' className="text-base text-gray-800 dark:text-gray-900 mb-3">{caption}</Text>

                <View className="flex-col justify-between mb-1">
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600 dark:text-gray-300">
                        Start: {formattedDate(offer_starts_at, 'Date')} • {formattedTime(offer_start_time, 'Time')}
                    </Text>
                    <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-gray-600 dark:text-gray-300">
                        End: {formattedDate(offer_ends_at, 'Date')} • {formattedTime(offer_end_time, 'Time')}
                    </Text>
                </View>

                <View className="flex-row justify-between mt-2">
                    <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-sm text-gray-800 dark:text-white">
                        Price: ${original_price}
                        {discounted_price ? (
                            <Text style={{ fontFamily: 'Raleway-Regular' }} className="text-sm text-red-500"> → ${discounted_price}</Text>
                        ) : null}
                    </Text>
                    <Text style={{ fontFamily: 'Raleway-SemiBold' }} className="text-sm text-gray-800 dark:text-white">
                        Budget: ${budget} 💸
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 4,
    },
});

export default AdPreview;
