import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker, { Event } from '@react-native-community/datetimepicker';
import { Formik, useFormikContext } from 'formik';
import * as Yup from 'yup';
import { ImagePath } from '../../constants/ImagePath';
import { useNavigation } from '@react-navigation/native';
import Octicons from 'react-native-vector-icons/Octicons';

import { Post, TokenStorage } from '../../utils/apiUtils';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('screen');

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  table_number: Yup.string().required('Table number is required'),
  seats: Yup.string().required('Seats is required'),
  price: Yup.number()
    .typeError('Price must be a number')
    .required('Table price is required')
    .positive('Price must be positive'),
});

// Slot type with date
type SlotType = {
  date: string; // e.g. "Sat Jul 26 2025"
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
  price: string;
};

const AddDineInServiceScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const [shopId, setShopId] = useState<any>(route?.params?.shopId || null); // For edit mode
  const { status: userStatus, data: user }: any = useSelector((state: any) => state.user);
  // const { values, handleChange, handleBlur, touched, errors, setFieldValue }: any = useFormikContext();
  const [floor, setFloor] = useState('Ground');
  const [type, setType] = useState('Standard');
  const [premium, setPremium] = useState(false);
  const [tables, setTables] = useState<any>(shopId ? (user?.shop?.tables || []) : []);
  const [showForm, setShowForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Slot states
  const [timeSlots, setTimeSlots] = useState<SlotType[]>([]);
  const [slotDate, setSlotDate] = useState<Date | null>(null);
  const [slotStartTime, setSlotStartTime] = useState<Date | null>(null);
  const [slotEndTime, setSlotEndTime] = useState<Date | null>(null);
  const [slotPrice, setSlotPrice] = useState('');

  // Date/time picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [tableOptions, setTableOptions] = useState([]);

  // Generate options dynamically when table_type changes

  const tabelNo = async () => {
    const options = [
      // Regular Tables
      ...Array.from({ length: 25 }, (_, i) => ({
        label: `T${i + 1}`,
        value: `T${i + 1}`,
        type: 'Regular Seating',
      })),

      // Cabin Tables
      ...Array.from({ length: 15 }, (_, i) => ({
        label: `CABIN-${i + 1}`,
        value: `CABIN-${i + 1}`,
        type: 'Cabin',
      })),

      // Open Air Tables
      ...Array.from({ length: 20 }, (_, i) => ({
        label: `OPEN-${i + 1}`,
        value: `OPEN-${i + 1}`,
        type: 'Open Air',
      })),
    ];

    setTableOptions(options);
  };

  useEffect(() => {
    tabelNo()
  }, [])


  // Handlers for date/time pickers
  const onChangeDate = (_event: Event, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSlotDate(selectedDate);
      // Reset start/end times when date changes
      setSlotStartTime(null);
      setSlotEndTime(null);
    }
  };

  const onChangeStartTime = (_event: Event, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setSlotStartTime(selectedTime);
      // If end time is before or equal to start, clear end time
      if (slotEndTime && selectedTime >= slotEndTime) {
        setSlotEndTime(null);
      }
    }
  };

  const onChangeEndTime = (_event: Event, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      if (slotStartTime && selectedTime <= slotStartTime) {
        Alert.alert('Invalid Time', 'End time must be after start time.');
        return;
      }
      setSlotEndTime(selectedTime);
    }
  };

  // Add slot with validation against overlapping slots on same date
  const addSlot = () => {
    if (!slotDate || !slotStartTime || !slotEndTime || !slotPrice.trim()) {
      ToastAndroid.show('Please fill all slot details', ToastAndroid.SHORT);
      return;
    }

    const newStart = slotStartTime.getHours() * 60 + slotStartTime.getMinutes();
    const newEnd = slotEndTime.getHours() * 60 + slotEndTime.getMinutes();
    const slotDateString = slotDate.toDateString();

    // Check overlap with existing slots of same date
    const hasOverlap = timeSlots.some(slot => {
      if (slot.date !== slotDateString) return false;
      const [sH, sM] = slot.start_time.split(':').map(Number);
      const [eH, eM] = slot.end_time.split(':').map(Number);
      const existingStart = sH * 60 + sM;
      const existingEnd = eH * 60 + eM;
      // Overlap if start < existingEnd and end > existingStart
      return !(newEnd <= existingStart || newStart >= existingEnd);
    });

    if (hasOverlap) {
      Alert.alert('Overlap Detected', 'This time slot overlaps with an existing slot on the same day.');
      return;
    }

    setTimeSlots([
      ...timeSlots,
      {
        date: slotDateString,
        start_time: `${slotStartTime.getHours().toString().padStart(2, '0')}:${slotStartTime.getMinutes().toString().padStart(2, '0')}`,
        end_time: `${slotEndTime.getHours().toString().padStart(2, '0')}:${slotEndTime.getMinutes().toString().padStart(2, '0')}`,
        price: slotPrice.trim(),
      },
    ]);

    // Reset slot inputs
    setSlotDate(null);
    setSlotStartTime(null);
    setSlotEndTime(null);
    setSlotPrice('');
    ToastAndroid.show('Slot added!', ToastAndroid.SHORT);
  };

  // Remove a slot from current new table form slots
  const handleRemoveSlot = (index: number) => {
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);
  };

  // Add Table with slots
  const handleAddTable = (values: any, { resetForm }: any) => {
    if (timeSlots.length === 0) {
      ToastAndroid.show('Please add at least one time slot', ToastAndroid.SHORT);
      return;
    }

    const newTable = {
      floor,
      table_number: values.table_number,
      type: type,
      price: values.price,
      premium: premium ? 1 : 0,
      seats: values?.seats || 0,
      time_slot: timeSlots.map(slot => ({
        start_time: slot.start_time,
        end_time: slot.end_time,
        price: Number(slot.price),
        date: slot.date,
      })),
    };

    setTables([...tables, newTable]);
    resetForm();
    setTimeSlots([]); // clear slots for next table
    setPremium(false);
    setType('Standard');
    setFloor('Ground');

    ToastAndroid.show('Table added successfully!', ToastAndroid.SHORT);
  };

  // Remove a table
  const handleRemoveTable = (index: any) => {
    const updatedTables = tables.filter((_: any, i: any) => i !== index);
    setTables(updatedTables);
    ToastAndroid.show('Table removed successfully!', ToastAndroid.SHORT);
  };

  // Save all tables to backend
  const handleCreateTables = async ({ setErrors }: any) => {
    if (tables?.length === 0) {
      ToastAndroid.show('Please add at least one table', ToastAndroid.SHORT);
      return;
    }
    setIsLoading(true);
    try {
      const token = await TokenStorage.getToken();
      if (!token) throw new Error('No authentication token found');

      const url = '/user/vendor/dining-table';
      const response: any = await Post(url, { table: tables }, 5000);

      if (!response.success) {
        throw new Error(response?.message || 'Failed to create tables');
      }

      ToastAndroid.show(response?.data?.message || 'Tables created successfully!', ToastAndroid.SHORT);

      navigation.replace('HomeScreen');
    } catch (error: any) {
      console.log(error);
      if (error.errors) {
        const formattedErrors: any = {};
        for (const key in error.errors) {
          formattedErrors[key] = error.errors[key][0];
        }
        setErrors(formattedErrors);
      }
      const errorMessage = error?.message || 'Something went wrong. Please try again.';
      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
    } finally {
      setIsLoading(false);
    }
  };

  // Format time and date helpers
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size={"large"} color={'#B68AD4'} />
          </View>
        )}

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 16, backgroundColor: '#fff' }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={ImagePath.signBg} style={styles.backgroundImage} resizeMode="contain" />
          <View style={{ marginTop: 80 }}>
            <MaskedView maskElement={<Text style={styles.headerText}>Add Dine-in Service</Text>}>
              <LinearGradient colors={['#ac94f4', '#7248B3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={[styles.headerText, { opacity: 0 }]}>Add Dine-in Service</Text>
              </LinearGradient>
            </MaskedView>

            <Text style={styles.subHeaderText}>Add your table details below</Text>

            {showForm && (
              <View style={styles.card}>
                <Formik
                  initialValues={{
                    floor: '',
                    table_number: '',
                    price: '',
                    seats: '',
                  }}
                  validationSchema={validationSchema}
                  onSubmit={handleAddTable}
                >
                  {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                    isSubmitting,
                  }) => (
                    <View>
                      {/* Floor Picker */}
                      <View style={styles.pickerContainer}>
                        <Picker selectedValue={floor} onValueChange={setFloor} style={styles.pickerStyle}>
                          {['Select Floor or Area', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', '6th Floor', '7th Floor', '8th Floor', '9th Floor', '10th Floor', '11th Floor', 'Rooftop', 'Backyard', 'Garden Area'].map(f => (
                            <Picker.Item key={f} label={f} value={f} />
                          ))}
                        </Picker>
                      </View>

                      {/* Type Picker */}
                      <View style={styles.pickerContainerSecondary}>
                        <Picker selectedValue={type} onValueChange={setType} style={styles.pickerStyle}>
                          <Picker.Item label="Choose Table Type" value="" />
                          <Picker.Item label="Choose Table Type" value="" />
                          <Picker.Item label="Regular Seating" value="Regular Seating" />
                          <Picker.Item label="Cabin / Private Table" value="Cabin" />
                          <Picker.Item label="Open Air / Outside" value="Open Air" />
                        </Picker>
                      </View>

                      {/* Table Number Input */}
                      <View style={styles.inputContainer}>
                        <Picker
                          selectedValue={values.table_number}
                          onValueChange={handleChange('table_number')}
                          onBlur={handleBlur('table_number')}
                          style={styles.pickerStyle}
                          enabled={tableOptions.length > 0}
                        >
                          <Picker.Item label="Choose Table Number" value="" />
                          {tableOptions?.map((table: any, index: any) => (
                            <Picker.Item key={index} label={table?.label} value={table?.value} />
                          ))}
                        </Picker>
                        {touched.table_number && errors.table_number && (
                          <Text style={styles.errorText}>{errors.table_number}</Text>
                        )}
                      </View>

                      {/* Seats Input */}
                      <View style={styles.inputContainer}>
                        <Picker
                          selectedValue={values.seats}
                          onValueChange={handleChange('seats')}
                          onBlur={handleBlur('seats')}
                          style={styles.pickerStyle}
                        >
                          <Picker.Item label="Select Number of Seats" value="" />
                          <Picker.Item label="🪑 2 Seater" value="2" />
                          <Picker.Item label="🪑 4 Seater" value="4" />
                          <Picker.Item label="🪑 6 Seater" value="6" />
                          <Picker.Item label="🪑 8 Seater" value="8" />
                          <Picker.Item label="🪑 10 Seater" value="10" />
                          <Picker.Item label="🪑 12 Seater" value="12" />
                          <Picker.Item label="🪑 14 Seater" value="14" />
                          <Picker.Item label="🪑 16 Seater" value="16" />
                          <Picker.Item label="🪑 18 Seater" value="18" />
                          <Picker.Item label="🪑 20 Seater" value="20" />
                          <Picker.Item label="🪑 22 Seater" value="22" />
                          <Picker.Item label="🪑 24 Seater" value="24" />
                          <Picker.Item label="🪑 26 Seater" value="26" />
                          <Picker.Item label="🪑 28 Seater" value="28" />
                          <Picker.Item label="🪑 30 Seater" value="30" />

                        </Picker>
                        {touched.seats && errors.seats && (
                          <Text style={styles.errorText}>{errors.seats}</Text>
                        )}
                      </View>


                      {/* Price Input */}
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="e.g. ₹100 for rooftop or premium cabin"
                          placeholderTextColor={"#000"}
                          onChangeText={handleChange('price')}
                          onBlur={handleBlur('price')}
                          value={values.price}
                          keyboardType="numeric"
                        />
                        {touched.price && errors.price && (
                          <Text style={styles.errorText}>{errors.price}</Text>
                        )}
                      </View>

                      {/* Premium Radio Buttons */}
                      <View style={styles.radioGroup}>
                        <TouchableOpacity onPress={() => setPremium(false)} style={styles.radioContainer}>
                          <View style={[styles.radio, !premium && styles.radioSelected]} />
                          <Text style={styles.radioText}>Regular (Normal seating)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setPremium(true)} style={styles.radioContainer}>
                          <View style={[styles.radio, premium && styles.radioSelected]} />
                          <Text style={styles.radioText}>Premium (AC, privacy, priority)</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Time Slots */}
                      <View style={{ marginBottom: 12 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>Add Time Slots</Text>

                        <View className='flex-row items-center justify-between'>
                          {/* Date Picker */}
                          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.input1, { justifyContent: 'center' }]}>
                            <Text style={{ color: slotDate ? '#000' : '#999' }}>
                              {slotDate ? slotDate.toDateString() : 'Select Date'}
                            </Text>
                          </TouchableOpacity>
                          {showDatePicker && (
                            <DateTimePicker
                              value={slotDate || new Date()}
                              mode="date"
                              display="default"
                              onChange={onChangeDate}
                              minimumDate={new Date()}
                            />
                          )}
                          {/* Price Input */}
                          <TextInput
                            style={[styles.input1]}
                            placeholder="Price"
                            placeholderTextColor={"gray"}
                            className='w-[48%] text-sm'
                            keyboardType="numeric"
                            value={slotPrice}
                            onChangeText={setSlotPrice}
                          />
                        </View>
                        <View className='flex-row items-center justify-between'>

                          {/* Start Time Picker */}
                          <TouchableOpacity
                            onPress={() => {
                              if (!slotDate) {
                                Alert.alert('Select Date first', 'Please select the date before start time.');
                                return;
                              }
                              setShowStartTimePicker(true);
                            }}
                            style={[styles.input1, { justifyContent: 'center', }]}
                          >
                            <Text style={{ color: slotStartTime ? '#000' : '#999' }}>
                              {slotStartTime ? formatTime(slotStartTime) : 'Select Start Time'}
                            </Text>
                          </TouchableOpacity>
                          {showStartTimePicker && slotDate && (
                            <DateTimePicker
                              value={slotStartTime || new Date(slotDate.setHours(9, 0, 0))}
                              mode="time"
                              is24Hour={true}
                              display="default"
                              onChange={onChangeStartTime}
                            />
                          )}

                          {/* End Time Picker */}
                          <TouchableOpacity
                            onPress={() => {
                              if (!slotStartTime) {
                                Alert.alert('Select Start Time first', 'Please select the start time before end time.');
                                return;
                              }
                              setShowEndTimePicker(true);
                            }}
                            style={[styles.input1, { justifyContent: 'center', }]}
                          >
                            <Text style={{ color: slotEndTime ? '#000' : '#999' }}>
                              {slotEndTime ? formatTime(slotEndTime) : 'Select End Time'}
                            </Text>
                          </TouchableOpacity>
                          {showEndTimePicker && slotDate && (
                            <DateTimePicker
                              value={slotEndTime || new Date(slotDate.setHours(10, 0, 0))}
                              mode="time"
                              is24Hour={true}
                              display="default"
                              onChange={onChangeEndTime}
                            />
                          )}
                        </View>



                        {/* Add Slot Button */}
                        <TouchableOpacity onPress={addSlot} style={styles.addSlotButton}>
                          <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ Add Slot</Text>
                        </TouchableOpacity>

                        {/* List of current slots */}
                        {timeSlots.length > 0 && (
                          <View style={{ marginTop: 16 }}>
                            {timeSlots.map((slot, idx) => (
                              <View key={idx} style={styles.slotItem}>
                                <Text style={{ fontSize: 12 }}>
                                  {slot.date} | {slot.start_time} - {slot.end_time} • ₹{slot.price}
                                </Text>
                                <TouchableOpacity onPress={() => handleRemoveSlot(idx)}>
                                  <Octicons name="trash" size={20} color="#DC2626" />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>

                      {/* Add Table Button */}
                      <TouchableOpacity onPress={() => handleSubmit()} disabled={isSubmitting} style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Add more Tables</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Formik>
              </View>
            )}

            {/* Added Tables List */}
            {tables?.length > 0 && (
              <View style={styles.tableListContainer}>
                <Text style={styles.tableListTitle}>Added Tables</Text>
                {tables.map((table: any, index: number) => (
                  <View key={index} style={styles.tableItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tableTitle}>
                        Table {table.table_number} • Floor {table.floor}
                      </Text>
                      <Text style={styles.tableDesc}>
                        Type: <Text style={{ fontWeight: '600' }}>{table.type}</Text>
                      </Text>
                      <Text style={styles.tableDesc}>
                        Price: <Text style={{ fontWeight: '600' }}>₹ {table.price}/-</Text>
                      </Text>
                      <View
                        style={[
                          styles.premiumBadge,
                          { backgroundColor: table.premium === 1 ? '#F59E0B' : '#9CA3AF' },
                        ]}
                      >
                        <Text style={styles.premiumText}>
                          {table.premium === 1 ? 'Premium Table' : 'Standard Table'}
                        </Text>
                      </View>

                      {/* Display Time Slots */}
                      <View style={{ marginTop: 8 }}>
                        {Array.isArray(table.time_slot) && table.time_slot.length > 0 ? (
                          table.time_slot.map((slot: any, idx: number) => (
                            <Text key={idx} style={{ color: '#444', fontSize: 13 }}>
                              {slot.date} | {slot.start_time} - {slot.end_time} • ₹{slot.price}
                            </Text>
                          ))
                        ) : (
                          <Text style={{ color: '#888', fontSize: 12 }}>No time slots</Text>
                        )}
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveTable(index)} style={styles.removeButton}>
                      <Octicons name="trash" size={20} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Save All Tables Button */}
            <TouchableOpacity onPress={handleCreateTables} style={{ marginTop: 16 }}>
              <LinearGradient
                colors={['#ac94f4', '#7248B3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                  Save Tables
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.8)',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  backgroundImage: {
    position: 'absolute',
    top: '-2%',
    left: '-2%',
    width: 208,
    height: 176,
    tintColor: "#ac94f4",
  },
  headerText: {
    textAlign: 'center',
    fontSize: 30,
    fontFamily: 'Raleway-Bold',
  },
  subHeaderText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#4B5563',
    fontFamily: 'Raleway-Regular',
  },
  card: {
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#F9FAFB',
  },
  pickerContainer: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  pickerContainerSecondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
  },
  pickerStyle: {
    width: '100%',
    color: '#000',
  },
  inputContainer: {
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  input: {
    padding: 12,
    fontSize: 14,
    color: '#000',
    fontFamily: 'Raleway-Regular',
  },
  input1: {
    padding: 12,
    fontSize: 16,
    color: '#000',
    borderBottomWidth: 1,
    borderColor: 'lightgray',
    fontFamily: 'Raleway-Regular',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: 'Raleway-Regular',
  },
  radioGroup: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: 12,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 15,
    height: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#374151',
  },
  radioSelected: {
    backgroundColor: '#ac94f4',
    borderColor: '#ac94f4',
  },
  radioText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'Raleway-Regular',
  },
  addButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    fontFamily: 'Raleway-Regular',
  },

  tableListContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  tableListTitle: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    color: '#374151',
    marginBottom: 8,
  },
  tableItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: "lightgray",
    borderWidth: 1,
    elevation: 2,
  },
  tableTitle: {
    fontSize: 16,
    fontFamily: 'Raleway-Bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  tableDesc: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
    fontFamily: 'Raleway-Regular',
  },
  premiumBadge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  premiumText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Raleway-Bold',
  },
  removeButton: {
    marginLeft: 12,
    backgroundColor: '#FEE2E2',
    padding: 8,
    borderRadius: 999,
  },

  slotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 6,
  },

  addSlotButton: {
    backgroundColor: '#7248B3',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default AddDineInServiceScreen;
