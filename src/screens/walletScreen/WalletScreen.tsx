import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    ToastAndroid,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { Fetch } from '../../utils/apiUtils';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const formatDate = (date: any) => date.toISOString().split('T')[0];
const displayDate = (date: any) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const WalletScreen = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [walletData, setWalletData] = useState<any>(null);
    const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
    const [showPicker, setShowPicker] = useState({ from: false, to: false });
    const [selectedTab, setSelectedTab] = useState('Today');

    const getPresetRange = (tab: string) => {
        const today = new Date();
        if (tab === 'Today') return { from: today, to: today };
        if (tab === 'Weekly') {
            const weekStart = new Date();
            weekStart.setDate(today.getDate() - 6);
            return { from: weekStart, to: today };
        }
        if (tab === 'Monthly') {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return { from: monthStart, to: today };
        }
        return dateRange;
    };

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            const response: any = await Fetch(`/user/vendor/wallet?from=${formatDate(dateRange.from)}&to=${formatDate(dateRange.to)}`, {}, 5000);
            if (response?.success) {
                setWalletData(response.data);
            } else {
                ToastAndroid.show('Failed to load wallet data', ToastAndroid.SHORT);
            }
        } catch (err) {
            ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWalletData();
    }, [dateRange]);

    const handleDateChange = (type: 'from' | 'to', event: any, selectedDate: Date) => {
        if (event.type === 'dismissed') {
            setShowPicker(prev => ({ ...prev, [type]: false }));
            return;
        }
        setShowPicker(prev => ({ ...prev, [type]: false }));
        setDateRange(prev => ({ ...prev, [type]: selectedDate || prev[type] }));
    };

    const renderInfoCard = (title: string, value: string | number, color = '#7D6AFF') => (
        <View className="w-[48%] bg-white shadow-md p-4 rounded-xl mb-4 border" style={{ borderColor: color }}>
            <Text className="text-gray-700 font-medium text-sm">{title}</Text>
            <Text className="text-xl font-bold mt-1 text-black">{value}</Text>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView className="flex-1 bg-gray-100 px-4 pt-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="absolute top-0 left-4 z-10">
                    <Icon name='arrow-back' size={20} />
                </TouchableOpacity>

                <Text className="text-2xl font-bold text-center mb-4">Wallet & Settlement</Text>

                {/* Tabs */}
                <View className="flex-row justify-around mb-4">
                    {['Today', 'Weekly', 'Monthly', 'Custom'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => {
                                setSelectedTab(tab);
                                if (tab !== 'Custom') setDateRange(getPresetRange(tab));
                            }}
                            className={`px-4 py-2 rounded-lg ${selectedTab === tab ? 'bg-primary-90' : 'bg-white'} shadow`}
                        >
                            <Text className={`${selectedTab === tab ? 'text-white' : 'text-gray-700'} font-semibold`}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Date Filter (only for Custom) */}
                {selectedTab === 'Custom' && (
                    <View className="flex-row justify-between mb-4">
                        <TouchableOpacity onPress={() => setShowPicker({ ...showPicker, from: true })} className="flex-1 mr-2 bg-white py-3 px-4 rounded-lg shadow">
                            <Text className="text-base text-gray-700">From: {displayDate(dateRange.from)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowPicker({ ...showPicker, to: true })} className="flex-1 ml-2 bg-white py-3 px-4 rounded-lg shadow">
                            <Text className="text-base text-gray-700">To: {displayDate(dateRange.to)}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {loading ? (
                    <View className="items-center justify-center mt-10">
                        <ActivityIndicator size="large" color="#B68AD4" />
                        <Text className="text-sm mt-2 text-gray-500">Loading wallet info...</Text>
                    </View>
                ) : walletData ? (
                    <>
                        <View className="flex-row flex-wrap justify-between">
                            {renderInfoCard('Total Orders', walletData.total_orders)}
                            {renderInfoCard('Total Earnings', `₹${walletData.total_earnings}`, '#28a745')}
                            {renderInfoCard('Commission Deducted', `₹${walletData.commission_deducted}`, '#dc3545')}
                            {renderInfoCard('Final Earning', `₹${walletData.final_earning}`, '#007bff')}
                        </View>

                        <View className="bg-white p-4 mt-2 rounded-xl shadow">
                            <Text className="text-base text-gray-800">Statement Period</Text>
                            <Text className="text-sm text-gray-500">{walletData.from} to {walletData.to}</Text>
                        </View>
                    </>
                ) : (
                    <Text className="text-center text-gray-500 mt-10">No wallet data found</Text>
                )}

                {showPicker.from && (
                    <DateTimePicker
                        value={dateRange.from}
                        mode="date"
                        display="calendar"
                        onChange={(e, d) => handleDateChange('from', e, d)}
                    />
                )}
                {showPicker.to && (
                    <DateTimePicker
                        value={dateRange.to}
                        mode="date"
                        display="calendar"
                        onChange={(e, d) => handleDateChange('to', e, d)}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default WalletScreen;