import {View, Text, Image, TouchableOpacity, ScrollView} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {BarChart, PieChart} from 'react-native-gifted-charts';
import LinearGradient from 'react-native-linear-gradient';
import {ImagePath} from '../constants/ImagePath';

const AnalyticsScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedPeriod, setSelectedPeriod] = useState('Today');

  // Sample data for charts
  const barData = [
    {value: 50, label: '8 AM'},
    {value: 80, label: '11 AM'},
    {value: 120, label: '2 PM'},
    {value: 90, label: '5 PM'},
    {value: 70, label: '8 PM'},
  ];

  const pieData = [
    {value: 30, color: '#31313180', text: 'Female'},
    {value: 50, color: '#B68AD4', text: 'Male'},
    // {value: 10, color: '#45B7D1', text: 'Youth'},
    // {value: 5, color: '#96CEB4', text: 'Kids'},
    // {value: 5, color: '#FFEEAD', text: 'Family'},
  ];

  // Sample stats data
  const stats: any = {
    today: {
      date: '5th June',
      totalEarnings: '₹1,234',
      totalOrders: '45',
      avgOrderValue: '₹27.42',
      bestSellingItem: 'Product A',
    },
    weekly: {
      date: '1st June to 7th June',
      totalEarnings: '₹8,765',
      totalOrders: '320',
      avgOrderValue: '₹27.39',
      bestSellingItem: 'Product B',
    },
    monthly: {
      date: 'June-July',
      totalEarnings: '₹32,456',
      totalOrders: '1,200',
      avgOrderValue: '₹27.05',
      bestSellingItem: 'Product C',
    },
  };

  const gridData = [
    {title: 'People Viewed Ad', value: '1,234'},
    {title: 'People Clicked Ad', value: '567'},
    {title: 'Total Store Visits via GeoFence', value: '789'},
    {title: 'Other', value: '123'},
  ];
  const data = stats[selectedPeriod.toLowerCase()];

  const renderStats = () => {
    const data = stats[selectedPeriod.toLowerCase()];
    return (
      <View className="mt-4">
        <View className="flex-row justify-between mt-2 bg-primary-10 p-4 rounded-lg">
          <Text className="text-base">Total Earnings</Text>
          <Text className="text-base font-semibold">{data.totalEarnings}</Text>
        </View>
        <View className="mt-2  bg-primary-10 p-4 rounded-lg">
          <View className="flex-row justify-between mt-2 ">
            <Text className="text-base">Total Orders Completed Today:</Text>
            <Text className="text-base font-semibold">{data.totalOrders}</Text>
          </View>
          <View className="flex-row justify-between mt-2 ">
            <Text className="text-base">Average Order Value:</Text>
            <Text className="text-base font-semibold">
              {data.avgOrderValue}
            </Text>
          </View>
        </View>{' '}
        <View className="flex-col justify-between mt-2  bg-primary-10 p-4 rounded-lg">
          <Text className="text-base">Best Selling Item Today:</Text>
          <Text className="text-base font-semibold">
            {data.bestSellingItem}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4 pt-10">
        <Text className="text-2xl text-center font-bold">Analytics</Text>

        {/* Badge Buttons */}
        <View className="flex-row justify-around gap-4 mt-4">
          {['Today', 'Weekly', 'Monthly'].map(period => (
            <View className="flex-col justify-center items-center gap-2">
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                className={`px-7 py-2 rounded-lg ${
                  selectedPeriod === period ? 'bg-primary-80' : 'bg-gray-300'
                }`}>
                <Text
                  className={`text-base text-center ${
                    selectedPeriod === period ? 'text-white' : 'text-black'
                  }`}>
                  {period}
                </Text>
              </TouchableOpacity>
              <Text className={`text-base text-center`}>
                {stats[period.toLowerCase()]?.date}
              </Text>
            </View>
          ))}
        </View>

        {/* Stats */}
        {renderStats()}

        {/* Bar Chart */}
        <View className="mt-6 bg-primary-10 p-4 rounded-xl">
          <Text className="text-lg font-bold mb-2">Seles Time Frame</Text>

          <BarChart
            data={barData}
            barWidth={10}
            spacing={20}
            roundedTop
            hideRules
            xAxisThickness={2}
            yAxisThickness={0}
            yAxisTextStyle={{color: '#333'}}
            barBorderRadius={4}
            width={280}
            frontColor="#B68AD4"
            noOfSections={5}
            isAnimated
            hideYAxisText
          />
        </View>

        {/* Pie Chart */}
        <View className="mt-6">
          <Text className="text-lg font-bold mb-2">
            Total Customers Served Today
          </Text>
          <View className='flex-row items-center bg-primary-10 p-8 rounded-xl'>
            <PieChart
              data={pieData}
              showText
              textColor="#fff"
              textSize={13}
              radius={80}
              innerRadius={60}
              showValuesAsLabels
            />
            <View className="flex-col flex-wrap justify-center pl-4 mt-4">
              {pieData.map((item, index) => (
                <View key={index} className="flex-row items-center mx-2">
                  <View
                    className="w-4 h-4 rounded-full"
                    style={{backgroundColor: item.color}}
                  />
                  <Text className="ml-2 text-base">
                    {item.text}: {item.value}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Grid Boxes */}
        <View className="mt-6">
          <Text className="text-lg font-bold mb-2">Additional Metrics</Text>
          <View className="flex-row flex-wrap justify-between">
            {gridData.map((item, index) => (
              <View
                key={index}
                className="w-[48%] h-24 p-4 bg-primary-10 rounded-xl mb-4">
                <Text className="text-base font-semibold text-gray-800">
                  {item.title}
                </Text>
                <Text className="text-lg font-bold text-gray-800">
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AnalyticsScreen;
