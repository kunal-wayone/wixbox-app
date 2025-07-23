import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import DateTimePicker from '@react-native-community/datetimepicker';
import Switch from './Switch';

export interface ShiftData {
  day: string;
  status: boolean;
  shift1: { from: string; to: string };
  shift2?: { from: string; to: string };
  state: string;
}

interface ShiftCardProps {
  shift: 1 | 2;
  data: ShiftData;
  onChange: (updatedData: ShiftData) => void;
  isSingleShiftMode?: boolean;
}

// Format Date object to time string like "3:00 PM"
const formatTime = (date: Date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
};

const ShiftCard: React.FC<ShiftCardProps> = ({
  shift = 1,
  data,
  onChange,
  isSingleShiftMode = false,
}) => {
  const [showPicker, setShowPicker] = useState<{
    type: 'shift1-from' | 'shift1-to' | 'shift2-from' | 'shift2-to' | null;
  }>({ type: null });
  const [tempDate, setTempDate] = useState(new Date());
  console.log(data)
  // const handleTimeSelect = (
  //   event: any,
  //   selectedDate: Date | undefined,
  //   type: string,
  //   values: ShiftData,
  //   setFieldValue: (field: string, value: any) => void
  // ) => {
  //   setShowPicker({ type: null });
  //   if (!selectedDate) return;
  //   const formatted = formatTime(selectedDate);

  //   if (type === 'shift1-from') {
  //     const updated = { ...values.shift1, from: formatted, to: '' };
  //     setFieldValue('shift1', updated);
  //     onChange({ ...values, shift1: updated });
  //   } else if (type === 'shift1-to') {
  //     const updated = { ...values.shift1, to: formatted };
  //     setFieldValue('shift1.to', formatted);
  //     onChange({ ...values, shift1: updated });
  //   } else if (type === 'shift2-from') {
  //     const updated = {
  //       ...(values.shift2 || { from: '', to: '' }),
  //       from: formatted,
  //       to: '',
  //     };
  //     setFieldValue('shift2', updated);
  //     onChange({ ...values, shift2: updated });
  //   } else if (type === 'shift2-to') {
  //     const updated = {
  //       ...(values.shift2 || { from: '', to: '' }),
  //       to: formatted,
  //     };
  //     setFieldValue('shift2', updated);
  //     onChange({ ...values, shift2: updated });
  //   }
  // };


  const handleTimeSelect = (
    event: any,
    selectedDate: Date | undefined,
    type: string,
    values: ShiftData,
    setFieldValue: (field: string, value: any) => void
  ) => {
    setShowPicker({ type: null });
    if (!selectedDate) return;

    const formatted = formatTime(selectedDate);

    if (type === 'shift1-from') {
      const updated = { from: formatted, to: '', rawFrom: selectedDate, rawTo: undefined };
      setFieldValue('shift1', updated);
      onChange({ ...values, shift1: updated });
    } else if (type === 'shift1-to') {
      if (values.shift1.rawFrom && selectedDate <= values.shift1.rawFrom) {
        Alert.alert('End time must be after start time.');
        return;
      }
      const updated = { ...values.shift1, to: formatted, rawTo: selectedDate };
      setFieldValue('shift1', updated);
      onChange({ ...values, shift1: updated });
    } else if (type === 'shift2-from') {
      const updated = { from: formatted, to: '', rawFrom: selectedDate, rawTo: undefined };
      setFieldValue('shift2', updated);
      onChange({ ...values, shift2: updated });
    } else if (type === 'shift2-to') {
      if (values.shift2?.rawFrom && selectedDate <= values.shift2.rawFrom) {
        Alert.alert('End time must be after start time.');
        return;
      }
      const updated = { ...values.shift2, to: formatted, rawTo: selectedDate };
      setFieldValue('shift2', updated);
      onChange({ ...values, shift2: updated });
    }
  };

  return (
    <Formik initialValues={data} enableReinitialize onSubmit={() => { }}>
      {({ values, setFieldValue }) => (
        <View style={styles.container} className="flex-row items-center justify-between  bg-gray-100">
          <View className='flex-col items-center w-1/4'>

            {!isSingleShiftMode && (
              <View style={styles.dayContainer}>
                <Text style={styles.dayText}>{values.day}</Text>
              </View>
            )}

            <View style={styles.switchContainer}>
              <Switch
                value={values.status}
                onValueChange={(val: any) => {
                  setFieldValue('status', val);
                  onChange({ ...values, status: val });
                }}
                size="small"
              />
            </View>
          </View>

          <View>
            {/* Shift 1 Time Pickers */}
            <View style={styles.timeRow}>
              <TouchableOpacity
                className='w-2/5'
                style={styles.timeButton}
                onPress={() => setShowPicker({ type: 'shift1-from' })}
              >
                <Text>{values.shift1.from || 'From'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className='w-2/5'
                style={styles.timeButton}
                onPress={() => setShowPicker({ type: 'shift1-to' })}
                disabled={!values.shift1.from}
              >
                <Text>{values.shift1.to || 'To'}</Text>
              </TouchableOpacity>
            </View>

            {/* Shift 2 Time Pickers */}
            {shift === 2 && (
              <View style={styles.timeRow}>
                <TouchableOpacity
                  className='w-2/5'
                  style={styles.timeButton}
                  onPress={() => setShowPicker({ type: 'shift2-from' })}
                >
                  <Text>{values.shift2?.from || 'From'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className='w-2/5'
                  style={styles.timeButton}
                  onPress={() => setShowPicker({ type: 'shift2-to' })}
                  disabled={!values.shift2?.from}
                >
                  <Text>{values.shift2?.to || 'To'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Modal Picker */}
          {showPicker.type && (
            <DateTimePicker
              mode="time"
              value={tempDate}
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) =>
                handleTimeSelect(event, selectedDate, showPicker.type!, values, setFieldValue)
              }
            />
          )}
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  dayContainer: {
    marginBottom: 8,
    marginRight: 12,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  switchContainer: {
    marginBottom: 8,
    marginRight: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  timeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',

  },
});

export default ShiftCard;
