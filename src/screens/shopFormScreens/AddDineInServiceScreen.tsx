import React, { useState } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { Picker } from '@react-native-picker/picker';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ImagePath } from '../../constants/ImagePath';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';

import { Post, TokenStorage } from '../../utils/apiUtils';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('screen');

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  table_number: Yup.string().required('Table number is required'),
  price: Yup.number()
    .typeError('Price must be a number')
    .required('Table price is required')
    .positive('Price must be positive'),
});

const AddDineInServiceScreen = ({ route }: any) => {
  const navigation = useNavigation<any>();
  const [shopId, setShopId] = useState<any>(route?.params?.shopId || null); // For edit mode
  const { status: userStatus, data: user }: any = useSelector((state: any) => state.user);
  const [floor, setFloor] = useState('Ground');
  const [type, setType] = useState('Standard');
  const [premium, setPremium] = useState(false);
  const [tables, setTables] = useState<any>(shopId ? (user?.shop?.tables || []) : []);
  const [showForm, setShowForm] = useState(true);
  console.log(user?.shop?.tables, tables, shopId)
  const handleAddTable = (values: any, { resetForm }: any) => {
    const newTable = {
      floor,
      table_number: values.table_number,
      type: type,
      price: values.price,
      premium: premium ? 1 : 0,
    };
    setTables([...tables, newTable]);
    resetForm();
    ToastAndroid.show('Table added successfully!', ToastAndroid.SHORT);
  };

  const handleRemoveTable = (index: any) => {
    const updatedTables = tables.filter((_: any, i: any) => i !== index);
    setTables(updatedTables);
    ToastAndroid.show('Table removed successfully!', ToastAndroid.SHORT);
  };

  const handleCreateTables = async ({ setErrors }: any) => {
    if (tables?.length === 0) {
      ToastAndroid.show('Please add at least one table', ToastAndroid.SHORT);
      return;
    }

    try {
      const formData = new FormData();
      tables.forEach((table: any, index: any) => {
        formData.append(`table[${index}]`, JSON.stringify(table));
      });


      const token = await TokenStorage.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const url = '/user/vendor/dining-table';
      const response: any = await Post(url, { table: tables }, 5000);
      console.log(url, response)
      if (!response.success) {
        throw new Error(response?.message || 'Failed to create tables');
      }

      ToastAndroid.show(
        response?.data?.message || 'Tables created successfully!',
        ToastAndroid.SHORT,
      );

      navigation.navigate('HomeScreen');
    } catch (error: any) {
      console.log(error)
      if (error.errors) {
        const formattedErrors: any = {};
        for (const key in error.errors) {
          formattedErrors[key] = error.errors[key][0];
        }
        setErrors(formattedErrors);
      }
      const errorMessage =
        error?.message || 'Something went wrong. Please try again.';
      ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 16,
          backgroundColor: '#fff',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Image
          source={ImagePath.signBg}
          style={{
            position: 'absolute',
            top: '-2%',
            left: '-2%',
            width: 208,
            height: 176,
          }}
          resizeMode="contain"
        />
        <View style={{ marginTop: 80 }}>
          <MaskedView
            maskElement={
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 30,
                  fontWeight: 'bold',
                  fontFamily: 'Poppins',
                }}>
                Add Dine-in Service
              </Text>
            }>
            <LinearGradient
              colors={['#EE6447', '#7248B3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 30,
                  fontWeight: 'bold',
                  fontFamily: 'Poppins',
                  opacity: 0,
                }}>
                Add Dine-in Service
              </Text>
            </LinearGradient>
          </MaskedView>
          <Text
            style={{ textAlign: 'center', marginTop: 8, color: '#4B5563' }}>
            Add your table details below
          </Text>


          {showForm && (
            <View style={styles.card} className="bg-gray-50">
              <Formik
                initialValues={{
                  floor: '',
                  table_number: '',
                  price: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleAddTable}>
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
                    <View
                      className="bg-gray-100"
                      style={{
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        borderRadius: 8,
                        marginBottom: 12,
                      }}>
                      <Picker
                        selectedValue={floor}
                        onValueChange={itemValue => setFloor(itemValue)}
                        style={{ height: 50, width: '100%' }}>
                        <Picker.Item label="Ground" value="Ground" />
                        <Picker.Item label="1st" value="1st" />
                        <Picker.Item label="2nd" value="2nd" />
                        <Picker.Item label="3rd" value="3rd" />
                        <Picker.Item label="4th" value="4th" />
                        <Picker.Item label="5th" value="5th" />
                        <Picker.Item label="6th" value="6th" />
                        <Picker.Item label="7th" value="7th" />
                        <Picker.Item label="8th" value="8th" />
                        <Picker.Item label="9th" value="9th" />
                        <Picker.Item label="10th" value="10th" />
                        <Picker.Item label="11th" value="11th" />
                      </Picker>
                    </View>
                    <View
                      className="bg-gray-100"
                      style={{
                        borderWidth: 1,
                        borderColor: '#D1D5DB',
                        backgroundColor: '#F3F4F6',
                        borderRadius: 8,
                        marginBottom: 12,
                      }}>
                      <Picker
                        selectedValue={type}
                        onValueChange={itemValue => setType(itemValue)}
                        style={{ height: 50, width: '100%' }}>
                        <Picker.Item label="Standard" value="Standard" />
                        <Picker.Item label="Booth" value="Booth" />
                        <Picker.Item label="Outdoor" value="Outdoor" />
                      </Picker>
                    </View>

                    <View className="bg-gray-100" style={{ marginBottom: 12 }}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter table number"
                        onChangeText={handleChange('table_number')}
                        onBlur={handleBlur('table_number')}
                        value={values.table_number}
                        keyboardType="number-pad"
                      />
                      {touched.table_number && errors.table_number && (
                        <Text style={styles.errorText}>
                          {errors.table_number}
                        </Text>
                      )}
                    </View>

                    <View className="bg-gray-100" style={{ marginBottom: 12 }}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter table price"
                        onChangeText={handleChange('price')}
                        onBlur={handleBlur('price')}
                        value={values.price}
                        keyboardType="numeric"
                      />
                      {touched.price && errors.price && (
                        <Text style={styles.errorText}>
                          {errors.price}
                        </Text>
                      )}
                    </View>

                    <View className="bg-gray-100" style={{ marginBottom: 12 }}>
                      <View style={{ flexDirection: 'row', gap: 16 }}>
                        <TouchableOpacity
                          onPress={() => setPremium(false)}
                          style={styles.radioContainer}>
                          <View
                            style={[
                              styles.radio,
                              !premium && styles.radioSelected,
                            ]}
                          />
                          <Text style={styles.radioText}>Non-Premium</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setPremium(true)}
                          style={styles.radioContainer}>
                          <View
                            style={[
                              styles.radio,
                              premium && styles.radioSelected,
                            ]}
                          />
                          <Text style={styles.radioText}>Premium</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      disabled={isSubmitting}
                      style={styles.addButton}>
                      <Text style={styles.addButtonText}>
                        + Add more Tables
                      </Text>
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
                <View
                  key={index}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 12,
                    borderColor: "lightgray",
                    borderWidth: 1,
                    elevation: 2
                  }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937' }}>
                      Table {table.table_number} • Floor {table.floor}
                    </Text>
                    <Text style={{ fontSize: 14, color: '#4B5563', marginTop: 4 }}>
                      Type: <Text style={{ fontWeight: '600' }}>{table.type}</Text>
                    </Text>
                    <Text style={{ fontSize: 14, color: '#4B5563', marginTop: 2 }}>
                      Price: <Text style={{ fontWeight: '600' }}>₹ {table.price}/-</Text>
                    </Text>
                    <View
                      style={{
                        marginTop: 6,
                        alignSelf: 'flex-start',
                        backgroundColor: table.premium === 1 ? '#F59E0B' : '#9CA3AF',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 20,
                      }}>
                      <Text style={{ fontSize: 12, color: '#fff', fontWeight: 'bold' }}>
                        {table.premium === 1 ? 'Premium Table' : 'Standard Table'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveTable(index)}
                    style={{
                      marginLeft: 12,
                      backgroundColor: '#FEE2E2',
                      padding: 8,
                      borderRadius: 999,
                    }}>
                    <Octicons name="trash" size={20} color="#DC2626" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}


          <TouchableOpacity onPress={handleCreateTables} style={{ marginTop: 16 }}>
            <LinearGradient
              colors={['#EE6447', '#7248B3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                padding: 16,
                borderRadius: 10,
                alignItems: 'center',
              }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                Save Tables
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
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
    backgroundColor: '#EE6447',
    borderColor: '#EE6447',
  },
  radioText: {
    fontSize: 14,
    color: '#374151',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 15,
    height: 15,
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#EE6447',
    borderColor: '#EE6447',
  },
  checkboxText: {
    fontSize: 14,
    color: '#374151',
  },
  addButton: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  addTableButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  tableListContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  tableListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  tableItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  tableItemText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  removeButton: {
    padding: 8,
  },
});

export default AddDineInServiceScreen;