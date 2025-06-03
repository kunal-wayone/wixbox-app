import React, {useState} from 'react';
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
import {Picker} from '@react-native-picker/picker';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {ImagePath} from '../../constants/ImagePath';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Added for check icon

const {width, height} = Dimensions.get('screen');

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  tableNumber: Yup.string().required('Table number is required'),
  tablePrice: Yup.number()
    .typeError('Price must be a number')
    .required('Table price is required')
    .positive('Price must be positive'),
});

const AddDineInServiceScreen = () => {
  const navigation = useNavigation<any>();
  const [floor, setFloor] = useState('Ground');
  const [tableType, setTableType] = useState('Standard');
  const [isPremium, setIsPremium] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState({
    cash: false,
    card: false,
    upi: false,
  });
  const [tables, setTables] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(true); // State to toggle form visibility

  const handleAddTable = (values: any, {resetForm}: any) => {
    const newTable = {
      floor,
      tableNumber: values.tableNumber,
      tableType,
      tablePrice: values.tablePrice,
      isPremium,
    };
    setTables([...tables, newTable]);
    resetForm();
    ToastAndroid.show('Table added successfully!', ToastAndroid.SHORT);
  };

  const handleCreateShop = async () => {
    if (tables.length === 0) {
      ToastAndroid.show('Please add at least one table', ToastAndroid.SHORT);
      return;
    }
    if (!paymentMethods.cash && !paymentMethods.card && !paymentMethods.upi) {
      ToastAndroid.show(
        'Please select at least one payment method',
        ToastAndroid.SHORT,
      );
      return;
    }
    try {
      // Replace with your actual API endpoint
      const response = await fetch('https://api.example.com/create-shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tables,
          paymentMethods,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create shop');
      }

      ToastAndroid.show('Shop created successfully!', ToastAndroid.SHORT);
      navigation.navigate('HomeScreen'); // Adjust navigation as needed
    } catch (error: any) {
      ToastAndroid.show(
        error.message || 'Something went wrong. Please try again.',
        ToastAndroid.SHORT,
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
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
        <View style={{marginTop: 80}}>
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
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
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
            style={{textAlign: 'center', marginVertical: 8, color: '#4B5563'}}>
            Add your table details below
          </Text>

          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={styles.addTableButton}>
            <Text style={styles.addButtonText}>+ Add your table details</Text>
          </TouchableOpacity>

          {showForm && (
            <View style={styles.card} className="bg-gray-50">
              <Formik
                initialValues={{
                  floor: '',
                  tableNumber: '',
                  tablePrice: '',
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
                }: any) => (
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
                        onValueChange={itemValue => setTableType(itemValue)}
                        style={{height: 50, width: '100%'}}>
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
                        selectedValue={tableType}
                        onValueChange={itemValue => setTableType(itemValue)}
                        style={{height: 50, width: '100%'}}>
                        <Picker.Item label="Standard" value="Standard" />
                        <Picker.Item label="Booth" value="Booth" />
                        <Picker.Item label="Outdoor" value="Outdoor" />
                      </Picker>
                    </View>

                    <View className="bg-gray-100" style={{marginBottom: 12}}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter table number"
                        onChangeText={handleChange('tableNumber')}
                        onBlur={handleBlur('tableNumber')}
                        value={values.tableNumber}
                        keyboardType="number-pad"
                      />
                      {touched.tableNumber && errors.tableNumber && (
                        <Text style={styles.errorText}>
                          {errors.tableNumber}
                        </Text>
                      )}
                    </View>

                    <View className="bg-gray-100" style={{marginBottom: 12}}>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter table price"
                        onChangeText={handleChange('tablePrice')}
                        onBlur={handleBlur('tablePrice')}
                        value={values.tablePrice}
                        keyboardType="numeric"
                      />
                      {touched.tablePrice && errors.tablePrice && (
                        <Text style={styles.errorText}>
                          {errors.tablePrice}
                        </Text>
                      )}
                    </View>

                    <View className="bg-gray-100" style={{marginBottom: 12}}>
                      <View style={{flexDirection: 'row', gap: 16}}>
                        <TouchableOpacity
                          onPress={() => setIsPremium(false)}
                          style={styles.radioContainer}>
                          <View
                            style={[
                              styles.radio,
                              !isPremium && styles.radioSelected,
                            ]}
                          />
                          <Text style={styles.radioText}>Non-Premium</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setIsPremium(true)}
                          style={styles.radioContainer}>
                          <View
                            style={[
                              styles.radio,
                              isPremium && styles.radioSelected,
                            ]}
                          />
                          <Text style={styles.radioText}>Premium</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={handleSubmit}
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

          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: '#374151',
              marginTop: 16,
              marginBottom: 8,
            }}>
            Payment Acceptance By
          </Text>
          <View style={{flexDirection: 'row', gap: 16, marginBottom: 16}}>
            <TouchableOpacity
              onPress={() =>
                setPaymentMethods({
                  ...paymentMethods,
                  cash: !paymentMethods.cash,
                })
              }
              style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  paymentMethods.cash && styles.checkboxSelected,
                ]}>
                {paymentMethods.cash && (
                  <Icon name="check" size={13} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxText}>Cash</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setPaymentMethods({
                  ...paymentMethods,
                  card: !paymentMethods.card,
                })
              }
              style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  paymentMethods.card && styles.checkboxSelected,
                ]}>
                {paymentMethods.card && (
                  <Icon name="check" size={13} color="#fff" />
                )}
              </View>
              <Text style={styles.checkboxText}>Card</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                setPaymentMethods({...paymentMethods, upi: !paymentMethods.upi})
              }
              style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  paymentMethods.upi && styles.checkboxSelected,
                ]}>
                {paymentMethods.upi && (
                  <Icon name="check" size={13} color="#fff"  />
                )}
              </View>
              <Text style={styles.checkboxText}>UPI</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleCreateShop} style={{marginTop: 16}}>
            <LinearGradient
              colors={['#EE6447', '#7248B3']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={{
                padding: 16,
                borderRadius: 10,
                alignItems: 'center',
              }}>
              <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
                Create Shop
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
    shadowOffset: {width: 0, height: 2},
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
});

export default AddDineInServiceScreen;
