import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  Dimensions,
  Switch,
} from 'react-native';
import {ImagePath} from '../../constants/ImagePath';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import Modal from 'react-native-modal';
import {TextInput} from 'react-native-gesture-handler';

// Assuming Dimensions is used for full-width modal
const {width} = Dimensions.get('window');

const BookATableScreen = () => {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pickupReminderEnabled, setPickupReminderEnabled] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isModalTableReserveVisible, setIsModalTableReserveVisible] =
    useState<boolean>(false);
  const [isPaymentModal, setIsPaymentModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [selectedFloor, setSelectedFloor] = useState<string>('Ground Floor');
  const [selectedOption, setSelectedOption] = useState('half'); // 'half' or 'full'
  // Sample table data for different floors
  const tableData: any = {
    'Ground Floor': [
      {id: '1', tableNumber: 'T1', seats: 2, isPremium: true, isBooked: false},
      {id: '2', tableNumber: 'T2', seats: 4, isPremium: false, isBooked: true},
      {id: '3', tableNumber: 'T3', seats: 2, isPremium: false, isBooked: false},
      {id: '4', tableNumber: 'T4', seats: 4, isPremium: true, isBooked: false},
    ],
    '1st Floor': [
      {id: '5', tableNumber: 'T5', seats: 2, isPremium: false, isBooked: false},
      {id: '5', tableNumber: 'T5', seats: 3, isPremium: false, isBooked: false},
      {id: '6', tableNumber: 'T6', seats: 6, isPremium: true, isBooked: true},
      {id: '7', tableNumber: 'T7', seats: 4, isPremium: false, isBooked: false},
    ],
    '2nd Floor': [
      {id: '8', tableNumber: 'T8', seats: 6, isPremium: true, isBooked: false},
      {id: '9', tableNumber: 'T9', seats: 2, isPremium: false, isBooked: false},
    ],
    '3nd Floor': [
      {id: '8', tableNumber: 'T8', seats: 6, isPremium: true, isBooked: false},
      {id: '9', tableNumber: 'T9', seats: 2, isPremium: false, isBooked: false},
    ],
    '4nd Floor': [
      {id: '8', tableNumber: 'T8', seats: 8, isPremium: true, isBooked: false},
      {id: '9', tableNumber: 'T9', seats: 2, isPremium: false, isBooked: false},
    ],
  };

  const floors = Object.keys(tableData);

  const dummyData = [
    {
      image: ImagePath.restaurant1,
      name: 'Salted Fries',
      category: 'Chinese Food',
      distance: '1.2 Miles Away',
      table: '20 Table Available',
      resturentName: 'Coffee House Restaurant',
      rating: '4.5',
      fav: false,
    },
    {
      image: ImagePath.restaurant2 ?? ImagePath.restaurant1,
      name: 'Veg Noodles',
      category: 'Chinese Food',
      distance: '2.0 Miles Away',
      table: '20 Table Available',
      resturentName: 'Spicy Bowl',
      rating: '4.2',
      fav: true,
    },
  ];

  const fetchData = async () => {
    try {
      const response = await fetch(
        'https://jsonplaceholder.typicode.com/posts',
      );
      if (!response.ok) throw new Error('Failed to fetch data');
      const json = await response.json();
      const transformed = dummyData;
      setData(transformed);
    } catch (err: any) {
      console.error('Error fetching data:', err.message);
      setError('Could not load high demand items. Showing local data.');
      setData(dummyData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderTableItem = ({item}: {item: any}) => {
    const seats = item.seats;

    // Dimensions and styling
    let tableWidth = 100;
    let tableHeight = 100;
    let borderRadius = 12;

    if (seats === 2) {
      tableWidth = 80;
      tableHeight = 60;
      borderRadius = 8;
    } else if (seats === 3) {
      tableWidth = 80;
      tableHeight = 60;
      borderRadius = 40;
    } else if (seats === 4) {
      tableWidth = 90;
      tableHeight = 60;
      borderRadius = 12;
    } else if (seats === 6) {
      tableWidth = 140;
      tableHeight = 60;
      borderRadius = 12;
    } else {
      tableWidth = Math.max(80, seats * 15);
      tableHeight = 60;
      borderRadius = 12;
    }

    const getSeatDistribution = (count: number) => {
      switch (count) {
        case 2:
          return [
            {side: 'left', count: 1},
            {side: 'right', count: 1},
          ];
        case 3:
          return [
            {side: 'top', count: 1},
            {side: 'right', count: 1},
            {side: 'bottom', count: 1},
          ];
        case 4:
          return [
            {side: 'top', count: 1},
            {side: 'right', count: 1},
            {side: 'bottom', count: 1},
            {side: 'left', count: 1},
          ];
        case 6:
          return [
            {side: 'top', count: 3},
            {side: 'bottom', count: 3},
          ];
        default:
          const base = Math.floor(count / 4);
          const remainder = count % 4;
          return [
            {side: 'top', count: base + (remainder > 0 ? 1 : 0)},
            {side: 'right', count: base + (remainder > 1 ? 1 : 0)},
            {side: 'bottom', count: base + (remainder > 2 ? 1 : 0)},
            {side: 'left', count: base},
          ];
      }
    };

    const seatDistribution = getSeatDistribution(seats);
    const seatSize = 25;
    const seatThickness = 6;
    const chairOffset = 0; // distance from table

    const getLineColor = () => {
      if (item.isBooked) return '#00C01A80';
      if (item.isPremium) return '#B68AD480'; // primary-40 equivalent
      return 'gray';
    };

    const renderChairLines = (side: string, count: number) => {
      if (count === 0) return null;

      const lines = [];
      const color = getLineColor();
      const isHorizontal = side === 'top' || side === 'bottom';
      const offset = 5; // 🔧 adjusted for better visual spacing
      const spacing = isHorizontal ? tableWidth : tableHeight;

      for (let i = 0; i < count; i++) {
        const gap = spacing / (count + 1);
        const center = gap * (i + 1);

        let style: any = {
          position: 'absolute',
          backgroundColor: color,
          borderRadius: 6,
        };

        if (isHorizontal) {
          style.width = seatSize;
          style.height = seatThickness;
          style.left = center - seatSize / 2;
          style[side] = -5;
        } else {
          style.width = seatThickness;
          style.height = seatSize;
          style.top = center - seatSize / 2;
          style[side] = -2;
        }

        lines.push(<View key={`${side}-seat-${i}`} style={style} />);
      }

      return lines;
    };

    return (
      <TouchableOpacity
        className="flex-1 m-2 items-center justify-center"
        onPress={() => {
          if (!item.isBooked) {
            Alert.alert(
              'Book Table',
              `Book ${item.tableNumber} with ${item.seats} seats?`,
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Confirm',
                  onPress: () => {
                    const updatedTables = {...tableData};
                    updatedTables[selectedFloor] = updatedTables[
                      selectedFloor
                    ].map((t: any) =>
                      t.id === item.id ? {...t, isBooked: true} : t,
                    );
                    setIsModalVisible(false);
                    Alert.alert(
                      'Success',
                      `${item.tableNumber} booked successfully!`,
                    );
                  },
                },
              ],
            );
          }
        }}>
        <View
          style={{
            width: tableWidth,
            height: tableHeight,
            borderRadius,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <View
            className={`w-10/12 h-14 rounded-xl flex-row justify-center items-center ${
              item.isBooked
                ? 'bg-green-500'
                : item.isPremium
                ? 'bg-primary-40'
                : 'bg-gray-200'
            }`}>
            <Text className="text-black text-sm font-semibold">
              {item.tableNumber} ({item.seats})
            </Text>
          </View>

          {/* Render chairs */}
          {seatDistribution.map(({side, count}) =>
            renderChairLines(side, count),
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFloorTab = (floor: string) => (
    <TouchableOpacity
      key={floor}
      className={`py-2 px-4 mr-2 h-10 rounded-lg ${
        selectedFloor === floor ? 'bg-primary-80' : 'bg-gray-200'
      }`}
      onPress={() => setSelectedFloor(floor)}>
      <Text
        className={`font-poppins-regular ${
          selectedFloor === floor ? 'text-white' : 'text-black'
        }`}>
        {floor}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        className="absolute top-5 left-5 z-10">
        <Ionicons name="arrow-back" color="#fff" size={24} />
      </TouchableOpacity>

      {/* Header Background */}
      <Image
        source={ImagePath?.bell}
        className="w-44 h-44 absolute top-[-9%] left-[-7%] z-1 rounded-xl"
        resizeMode="contain"
        tintColor="#FFFFFF33"
      />

      {/* Header */}
      <View className="bg-primary-80 px-4 py-14 justify-end h-56 rounded-b-[40px]">
        <Text className="text-white mb-1 font-poppins-bold text-2xl">
          Book a Table
        </Text>
        <Text className="text-white font-poppins-regular">
          Lorem ipsum dolor sit amet, consectetur
        </Text>
        <Image
          source={ImagePath.bell}
          className="w-24 h-24 absolute right-5 bottom-5 rounded-xl"
          resizeMode="contain"
          tintColor="white"
        />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{padding: 16}}
        showsVerticalScrollIndicator={false}>
        {loading && <ActivityIndicator size="large" color="#0000ff" />}
        {error && (
          <Text className="text-red-600 mb-4 text-center">{error}</Text>
        )}

        {data.map((d, i) => (
          <View
            key={i}
            className="flex-row gap-4 bg-primary-10 rounded-xl p-6 mb-4">
            <Text className="absolute top-2 right-12 font-poppins-bold">
              <AntDesign name="star" size={19} color="#FFC727" /> {d?.rating}
            </Text>
            <TouchableOpacity className="absolute top-2 right-5">
              <MaterialIcons
                name={d.fav ? 'favorite' : 'favorite-outline'}
                size={19}
                color={d.fav ? 'red' : 'black'}
              />
            </TouchableOpacity>
            <Image
              source={d?.image}
              className="w-24 h-32 rounded-xl"
              resizeMode="stretch"
            />
            <View className="flex-1">
              <Text className="text-xl font-poppins-bold">{d?.name}</Text>
              <View className="flex-row items-center gap-4 mb-2">
                <Text className="font-poppins-regular text-gray-500">
                  {d?.category}
                </Text>
                <Text className="font-poppins-regular text-gray-500">
                  {d?.distance}
                </Text>
              </View>
              <View className="flex-row items-center gap-1 mb-2">
                <Image
                  source={ImagePath.bell}
                  className="w-4 h-4"
                  tintColor="#B68AD4"
                  resizeMode="contain"
                />
                <Text className="mb-1 font-poppins-regular">{d?.table}</Text>
              </View>
              <TouchableOpacity
                className="p-2 bg-white w-2/3 rounded-md"
                onPress={() => {
                  setSelectedRestaurant(d);
                  setIsModalVisible(true);
                }}>
                <Text className="font-poppins-bold text-center">Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Modal for Table Layout */}
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <View
          className="bg-white rounded-t-3xl pt-6 pb-4"
          style={{
            width: width,
            height: '75%',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
          }}>
          {/* Notch Design */}
          <View className="absolute top-2 self-center w-12 h-1 bg-gray-400 rounded-full" />
          {/* Title */}
          <Text className="text-lg font-bold mb-3 px-4">Select a Table</Text>
          {/* Floor Tabs */}
          <View>
            <FlatList
              data={floors}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => renderFloorTab(item)}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{paddingHorizontal: 16}}
              style={{marginBottom: 16}}
            />
          </View>

          {/* Table Layout */}
          <FlatList
            data={tableData[selectedFloor]}
            renderItem={renderTableItem}
            keyExtractor={item => item.id}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 16}}
          />

          <TouchableOpacity
            onPress={() => setIsModalTableReserveVisible(true)}
            className="bg-primary-80 rounded-xl p-4 w-11/12 mx-auto">
            <Text className="text-center text-white font-poppins font-semibold">
              Reserve a Table
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal For View reservation info */}
      <Modal
        isVisible={isModalTableReserveVisible}
        onBackdropPress={() => setIsModalTableReserveVisible(false)}
        style={{justifyContent: 'center'}}>
        <View
          className="bg-white rounded-t-3xl pt-6 pb-4"
          style={{
            height: '95%',
            borderRadius: 20,
            overflow: 'hidden',
          }}>
          {/* Restaurant Image */}
          <Image
            source={ImagePath.restaurant1}
            className="w-11/12 h-56 rounded-xl mb-2 mx-auto"
            resizeMode="stretch"
          />

          {/* Title and Subtitle */}
          <Text className="text-lg text-center font-bold mb-1 px-4">
            Olive Garden Bistro (Restaurant)
          </Text>
          <Text className="text-center mb-4">Restaurant & Café</Text>

          {/* Price Breakdown Header */}
          <Text className="py-2 mx-4 border-b border-gray-400 border-dashed">
            Price Breakdown
          </Text>

          {/* Price Info */}
          <View className="flex-row justify-between mx-4 my-2">
            {/* Column 1 */}
            <View className="flex-1 mr-2">
              <Text className="text-base mb-1">Original Price:</Text>
              <Text className="text-base mb-1">Advance (Pay Now):</Text>
              <Text className="text-base mb-4">Pay at Pickup:</Text>
            </View>

            {/* Column 2 */}
            <View className="flex-1 ml-2 items-end">
              <Text className="text-base mb-1">₹200.00/-</Text>
              <Text className="text-base mb-1">₹150.00/-</Text>
              <Text className="text-base mb-4">₹50.00/-</Text>
            </View>
          </View>

          {/* Dashed Divider */}
          <View className="border-b border-dashed border-gray-400 mx-4 my-2" />

          {/* Key Points with Icons */}
          <View className="mx-4 mt-2 space-y-3">
            <View className="flex-row items-center mb-2">
              <AntDesign name="checkcircle" size={16} color={'#B68AD4'} />
              <Text className="ml-2">No waiting in line</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="time" size={18} color={'#B68AD4'} />
              <Text className="ml-2">Ready in 15 mins</Text>
            </View>
            <View className="flex-row items-center mb-2">
              <Ionicons name="lock-closed" size={18} color={'#B68AD4'} />
              <Text className="ml-2">Your product is safe with us</Text>
            </View>
          </View>

          {/* Notification Switch */}
          <View className="flex-row justify-between items-center mx-4 mt-4">
            <Switch
              value={pickupReminderEnabled}
              onValueChange={setPickupReminderEnabled}
            />
            <Text className="text-base">
              Send me a pickup reminder notification
            </Text>
          </View>

          {/* Reserve Now Button */}
          <TouchableOpacity
            onPress={() => setIsPaymentModal(true)}
            className="bg-primary-80 rounded-xl p-4 w-11/12 mx-auto mt-5">
            <Text className="text-center text-white font-poppins font-semibold">
              Pay ₹150.00 & Reserve Now
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Modal for Paymnet option */}
      <Modal
        isVisible={isPaymentModal}
        onBackdropPress={() => setIsPaymentModal(false)}
        style={{justifyContent: 'flex-end', margin: 0}}>
        <View
          className="bg-white rounded-t-[2rem] pt-6 pb-4"
          style={{
            width: '100%',
            height: '30%',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}>
          {/* Notch */}
          <View className="absolute top-2 self-center w-12 h-1 bg-gray-400 rounded-full" />

          {/* Title */}
          <Text className="text-lg font-bold mb-3 px-4">Select to pay</Text>

          {/* Payment Options */}
          <View className="px-4 space-y-3">
            {/* Pay Half */}
            <TouchableOpacity
              className="flex-row justify-between items-center p-3"
              onPress={() => setSelectedOption('half')}>
              <View className="flex-row items-center justify-between gap-4">
                <Text className="text-base font-medium">Pay Half Amount</Text>
                <Text className="text-gray-600">₹100.00</Text>
              </View>
              <View
                className={`w-5 h-5 rounded-full border-2 ${
                  selectedOption === 'half'
                    ? 'border-primary-100'
                    : 'border-gray-400'
                } items-center justify-center`}>
                {selectedOption === 'half' && (
                  <View className="w-2.5 h-2.5 bg-primary-100 rounded-full" />
                )}
              </View>
            </TouchableOpacity>

            {/* Pay Full */}
            <TouchableOpacity
              className="flex-row justify-between items-center p-3"
              onPress={() => setSelectedOption('full')}>
              <View className="flex-row items-center justify-between gap-4">
                <Text className="text-base font-medium">Pay Full Amount</Text>
                <Text className="text-gray-600">₹200.00</Text>
              </View>
              <View
                className={`w-5 h-5 rounded-full border-2 ${
                  selectedOption === 'full'
                    ? 'border-blue-500'
                    : 'border-gray-400'
                } items-center justify-center`}>
                {selectedOption === 'full' && (
                  <View className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Pay Now Button */}
          <TouchableOpacity
            onPress={() => setIsPaymentModal(false)}
            className="bg-primary-80 rounded-xl p-4 w-11/12 mx-auto mt-4">
            <Text className="text-center text-white font-semibold">
              Pay Now
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default BookATableScreen;
