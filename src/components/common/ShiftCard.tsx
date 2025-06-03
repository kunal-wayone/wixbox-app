import React from 'react';
import {View, Text, Switch, StyleSheet} from 'react-native';
import {Formik} from 'formik';
import {Picker} from '@react-native-picker/picker';

export interface ShiftData {
  day: string;
  isEnabled: boolean;
  shift1: {from: string; to: string};
  shift2?: {from: string; to: string};
  state: string;
}

interface ShiftCardProps {
  shift: 1 | 2;
  data: ShiftData;
  onChange: (updatedData: ShiftData) => void;
}

const timeOptions = Array.from({length: 24}, (_, i) => {
  const hour = i % 12 === 0 ? 12 : i % 12;
  const suffix = i < 12 ? 'AM' : 'PM';
  const time = `${hour}:00 ${suffix}`;
  return {label: time, value: time};
});

const ShiftCard: React.FC<ShiftCardProps> = ({shift = 1, data, onChange}) => {
  return (
    <Formik initialValues={data} enableReinitialize onSubmit={() => {}}>
      {({values, setFieldValue}) => (
        <View
          style={styles.container}
          className="flex-row items-center bg-gray-100">
          {/* Day */}
          <View style={styles.dayContainer}>
            <Text style={styles.dayText}>{values.day}</Text>
          </View>

          {/* Enable Switch */}
          <View style={styles.switchContainer}>
            <Switch
              value={values.isEnabled}
              onValueChange={val => {
                setFieldValue('isEnabled', val);
                onChange({...values, isEnabled: val});
              }}
            />
          </View>
          <View className="w-auto">
            {/* Shift 1 */}
            <View style={[styles.pickerRow, {marginBottom: 5}]}>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={values.shift1.from}
                  style={styles.picker}
                  onValueChange={val => {
                    const updated = {...values.shift1, from: val};
                    setFieldValue('shift1.from', val);
                    onChange({...values, shift1: updated});
                  }}>
                  <Picker.Item label="From" value="" />
                  {timeOptions.map(opt => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </Picker>
              </View>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={values.shift1.to}
                  style={styles.picker}
                  onValueChange={val => {
                    const updated = {...values.shift1, to: val};
                    setFieldValue('shift1.to', val);
                    onChange({...values, shift1: updated});
                  }}>
                  <Picker.Item label="To" value="" />
                  {timeOptions.map(opt => (
                    <Picker.Item
                      key={opt.value}
                      label={opt.label}
                      value={opt.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Shift 2 (if applicable) */}
            {shift === 2 && (
              <View style={styles.pickerRow}>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={values.shift2?.from || ''}
                    style={styles.picker}
                    onValueChange={val => {
                      const updated = {
                        ...(values.shift2 || {from: '', to: ''}),
                        from: val,
                      };
                      setFieldValue('shift2', updated);
                      onChange({...values, shift2: updated});
                    }}>
                    <Picker.Item label="From" value="" />
                    {timeOptions.map(opt => (
                      <Picker.Item
                        key={opt.value}
                        label={opt.label}
                        value={opt.value}
                      />
                    ))}
                  </Picker>
                </View>

                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={values.shift2?.to || ''}
                    style={styles.picker}
                    onValueChange={val => {
                      const updated = {
                        ...(values.shift2 || {from: '', to: ''}),
                        to: val,
                      };
                      setFieldValue('shift2', updated);
                      onChange({...values, shift2: updated});
                    }}>
                    <Picker.Item label="To" value="" />
                    {timeOptions.map(opt => (
                      <Picker.Item
                        key={opt.value}
                        label={opt.label}
                        value={opt.value}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            )}
          </View>
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
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  switchContainer: {
    marginBottom: 8,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 5,
  },
  pickerContainer: {
    width: 110,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden', // Ensures rounded corners are respected
  },
  picker: {
    width: '100%',
  },
});

export default ShiftCard;
