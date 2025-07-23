import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ToastAndroid,
  Dimensions,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BarChart } from 'react-native-gifted-charts';
import { Fetch } from '../utils/apiUtils';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const formatDate = (date: any) => date.toISOString().split('T')[0];
const displayDate = (date: any) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const AnalyticsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [showPicker, setShowPicker] = useState({ from: false, to: false });
  const [selectedTab, setSelectedTab] = useState<'Today' | 'Weekly' | 'Yearly' | 'Custom'>('Today');

  const predefinedRanges = {
    Today: { from: new Date(), to: new Date() },
    Weekly: { from: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), to: new Date() },
    Yearly: { from: new Date(new Date().getFullYear(), 0, 1), to: new Date() },
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { from, to } = selectedTab !== 'Custom' ? predefinedRanges[selectedTab] : dateRange;
      const response: any = await Fetch(`/user/vendor/analytics?from=${formatDate(from)}&to=${formatDate(to)}`, {}, 5000);
      if (response?.success) {
        setAnalyticsData(response.data);
      } else {
        ToastAndroid.show('Failed to load analytics', ToastAndroid.SHORT);
      }
    } catch (err) {
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab !== 'Custom') {
      setDateRange(predefinedRanges[selectedTab]);
    }
    fetchData();
  }, [selectedTab]);

  const handleDateChange = (type: 'from' | 'to', event: any, selectedDate: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(prev => ({ ...prev, [type]: false }));
      return;
    }
    setShowPicker(prev => ({ ...prev, [type]: false }));
    setDateRange(prev => ({ ...prev, [type]: selectedDate || prev[type] }));
  };

  const renderTabs = () => {
    const tabs = ['Today', 'Weekly', 'Yearly', 'Custom'];
    return (
      <View className="flex-row justify-around mb-4">
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab as any)}
            className={`px-4 py-2 rounded-xl ${selectedTab === tab ? 'bg-primary-90' : 'bg-white'}`}
          >
            <Text className={selectedTab === tab ? 'text-white font-bold' : 'text-gray-700'}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderInfoCard = (title: string, value: string | number) => (
    <View className="w-[48%] bg-white shadow-md p-4 rounded-xl mb-4">
      <Text className="text-gray-700 font-medium text-sm">{title}</Text>
      <Text className="text-xl font-bold mt-1">{value}</Text>
    </View>
  );

  const renderCragData = () => {
    const cragMetrics = [
      { label: 'Conversion Rate', value: '12.5%' },
      { label: 'Avg. Delivery Time', value: '32 mins' },
      { label: 'New vs Returning Users', value: '68% / 32%' },
      { label: 'Most Visited Time', value: '2 PM - 5 PM' },
    ];

    return (
      <View className="mt-4">
        <Text className="text-lg font-bold mb-2">Advanced Insights</Text>
        <View className="flex-row flex-wrap justify-between">
          {cragMetrics.map((item, index) => (
            <View
              key={index}
              className="w-[48%] bg-white shadow-md p-4 m-1 rounded-xl"
            >
              <Text className="text-sm text-gray-600 font-semibold">{item.label}</Text>
              <Text className="text-xl text-gray-900 font-bold mt-1">{item.value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getBarChartData = () => {
    const now = new Date();
    const days = [...Array(7).keys()].map(i => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      return {
        value: Math.floor(Math.random() * 200),
        label: `${d.toLocaleDateString('en-GB', { weekday: 'short' })}\n${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`,
      };
    });
    return days.reverse();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView className="flex-1 bg-gray-100 px-4 pt-10">
        <Text className="text-2xl font-bold text-center mb-4">Business Analytics Dashboard</Text>

        {renderTabs()}

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
            <Text className="text-sm mt-2 text-gray-500">Loading analytics...</Text>
          </View>
        ) : analyticsData ? (
          <>
            <View className="flex-row flex-wrap justify-between">
              {renderInfoCard('Total Earnings', `₹${analyticsData.total_earnings}`)}
              {renderInfoCard('Total Orders', analyticsData.total_orders)}
              {renderInfoCard('Avg. Order Value', `₹${analyticsData.average_order_price}`)}
              {renderInfoCard('Table Bookings', analyticsData.table_booking_count)}
              {renderInfoCard('Users', analyticsData.user_count)}
              {renderInfoCard('Best Selling', `${analyticsData.best_selling_item} (${analyticsData.best_selling_quantity})`)}
            </View>

            <View className="bg-white p-4 mt-4 rounded-xl shadow mb-20">
              <Text className="text-lg font-bold mb-2">Sales Over Time</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={getBarChartData()}
                  barWidth={10}
                  spacing={30}
                  roundedTop
                  frontColor="#B68AD4"
                  isAnimated
                  xAxisTextStyle={{ color: '#444' }}
                  barBorderRadius={6}
                  yAxisThickness={1}
                  hideYAxisText
                  showValuesOnTopOfBars
                  width={screenWidth * 1.8}
                />
              </ScrollView>
            </View>

            {/* {renderCragData()} */}
          </>
        ) : (
          <Text className="text-center text-gray-500 mt-10">No data found</Text>
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

export default AnalyticsScreen;
