import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToastAndroid } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { Fetch, Post, Delete, IMAGE_URL } from '../../utils/apiUtils';
import { loadingSpinner } from '../otherScreen/LoadingComponent';
import Switch from '../../components/common/Switch';

// Define types
interface Category {
  id: string;
  name: string;
  image: string;
  status: number;
}

interface Product {
  id: string;
  item_name: string;
  images: { url: string }[];
  category: { name: string };
  price: number;
  stock_quantity: number;
  unit: string;
  status: number;
}

interface ConfirmAction {
  type: 'category' | 'product';
  id: string;
  name: string;
}

// Validation schema
const CategorySchema = Yup.object().shape({
  categoryName: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Category name is required'),
});

// API functions
const fetchCategories = async (setLoading: (loading: boolean) => void): Promise<Category[]> => {
  try {
    setLoading(true);
    const response: any = await Fetch('/user/categories', {}, 5000);
    if (!response.success) throw new Error('Failed to fetch categories');
    return response.data;
  } catch (error: any) {
    ToastAndroid.show(error?.message || 'Failed to load categories.', ToastAndroid.SHORT);
    return [];
  } finally {
    setLoading(false);
  }
};

const fetchProductsByCategory = async (
  categoryId: string,
  setLoading: (loading: boolean) => void,
): Promise<Product[]> => {
  try {
    setLoading(true);
    const response: any = await Fetch(`/user/menu-items`, { category_id: categoryId }, 5000);
    if (!response.success) throw new Error('Failed to fetch products');
    return response.data.menu_items;
  } catch (error: any) {
    ToastAndroid.show(error?.message || 'Failed to load products.', ToastAndroid.SHORT);
    return [];
  } finally {
    setLoading(false);
  }
};

const toggleProductStatus = async (
  id: string,
  currentStatus: boolean,
  setLoading: (loading: boolean) => void,
): Promise<any> => {
  try {
    setLoading(true);
    const response: any = await Fetch(
      `/user/menu-items/${id}/active-inactive`,
      { status: currentStatus ? 0 : 1 },
      5000,
    );
    if (!response.success) throw new Error('Failed to toggle status');
    return response.data;
  } catch (error: any) {
    ToastAndroid.show(error?.message || 'Failed to toggle status.', ToastAndroid.SHORT);
    throw error;
  } finally {
    setLoading(false);
  }
};

const deleteProduct = async (
  id: string,
  setLoading: (loading: boolean) => void,
): Promise<any> => {
  try {
    setLoading(true);
    const response: any = await Delete(`/user/menu-items/${id}`, {});
    if (!response.success) throw new Error('Failed to delete product');
    return response.data;
  } catch (error: any) {
    ToastAndroid.show(error?.message || 'Failed to delete product.', ToastAndroid.SHORT);
    throw error;
  } finally {
    setLoading(false);
  }
};

const ManageStockScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [productLoading, setProductLoading] = useState<{ [key: string]: boolean }>({});
  const [confirmModalVisible, setConfirmModalVisible] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);


  // Load categories
  const loadCategories = useCallback(async () => {
    const categoryData = await fetchCategories(setIsLoading);
    setCategories(categoryData);
    if (categoryData.length > 0 && !selectedCategory) {
      setSelectedCategory(categoryData[0]);
    }
  }, [selectedCategory]);

  // Load products
  const loadProducts = useCallback(async () => {
    if (selectedCategory?.id) {
      const productData = await fetchProductsByCategory(selectedCategory.id, setIsLoading);
      setProducts(productData);
    }
  }, [selectedCategory]);

  // Handle data fetching
  useEffect(() => {
    if (isFocused) {
      loadCategories();
    }
  }, [isFocused, loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, loadProducts]);


  const handleToggleStatus = useCallback(
    async (productId: string, currentStatus: boolean) => {
      const originalProducts = [...products];
      setProducts(products.map(item =>
        item.id === productId ? { ...item, status: currentStatus ? 0 : 1 } : item
      ));
      setProductLoading(prev => ({ ...prev, [productId]: true }));

      try {
        await toggleProductStatus(productId, currentStatus, (loading: boolean) =>
          setProductLoading(prev => ({ ...prev, [productId]: loading }))
        );
        ToastAndroid.show('Status updated successfully', ToastAndroid.SHORT);
      } catch {
        setProducts(originalProducts);
      }
    },
    [products]
  );

  const handleDeleteProduct = useCallback((productId: string, productName: string) => {
    setConfirmAction({ type: 'product', id: productId, name: productName });
    setConfirmModalVisible(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'category') {
      try {
        setIsLoading(true);
        const response: any = await Delete(`/user/categories/${confirmAction.id}`, {});
        if (!response.success) throw new Error('Failed to delete category');
        setCategories(prev => prev.filter(cat => cat.id !== confirmAction.id));
        if (selectedCategory?.id === confirmAction.id) setSelectedCategory(null);
        ToastAndroid.show('Category deleted successfully', ToastAndroid.SHORT);
      } catch (error: any) {
        ToastAndroid.show(error?.message || 'Failed to delete category.', ToastAndroid.SHORT);
      } finally {
        setIsLoading(false);
      }
    } else if (confirmAction.type === 'product') {
      const originalProducts = [...products];
      setProductLoading(prev => ({ ...prev, [confirmAction.id]: true }));
      try {
        setProducts(prev => prev.filter(item => item.id !== confirmAction.id));
        await deleteProduct(confirmAction.id, (loading: boolean) =>
          setProductLoading(prev => ({ ...prev, [confirmAction.id]: loading }))
        );
        ToastAndroid.show('Product deleted successfully', ToastAndroid.SHORT);
      } catch {
        setProducts(originalProducts);
      }
    }

    setConfirmModalVisible(false);
    setConfirmAction(null);
  }, [confirmAction, products, selectedCategory]);

  const handleCancelDelete = useCallback(() => {
    setConfirmModalVisible(false);
    setConfirmAction(null);
  }, []);

  // Render functions
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View className="items-center p-2 bg-gray-100 m-2 rounded-xl shadow-md">
      <TouchableOpacity
        onPress={() => setSelectedCategory(item)}
        disabled={isLoading}
        className="relative"
      >
        <Image
          source={{ uri: `${IMAGE_URL}${item.image}` }}
          resizeMode="cover"
          className="h-20 w-20 rounded-xl"
        />
        <View className="absolute inset-0 bg-black/50 rounded-xl" />
        <Text numberOfLines={1} ellipsizeMode='tail' className="absolute bottom-2 left-2 right-2 text-white text-sm font-semibold text-center">
          {item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const stockQty = item.stock_quantity;
    const isOutOfStock = stockQty === 0;
    const isLowStock = stockQty > 60 && stockQty < 10;

    // Icon color and background based on stock
    let stockColor = "#10b981"; // green
    let cardBgClass = "bg-white";

    if (isOutOfStock) {
      stockColor = "#ef4444"; // red
      cardBgClass = "bg-red-50";
    } else if (isLowStock) {
      stockColor = "#f97316"; // orange
      cardBgClass = "bg-orange-50";
    }

    return (
      <View
        className={`${cardBgClass} rounded-2xl mb-4 mx-4 border border-gray-200 shadow-md`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        {/* 🔼 TOP SECTION */}
        <View className="flex-row p-4 pb-2">
          {/* Left: Image */}
          <TouchableOpacity
            className="w-16 h-16 rounded-xl overflow-hidden mr-4"
            onPress={() => navigation.navigate('ProductDetailsScreen', { productId: item.id })}
          >
            <Image
              source={{ uri: `${IMAGE_URL}${item.images[0]}` }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Right: Info */}
          <View className="flex-1">
            <View className="flex-row justify-between">
              <View>
                <Text numberOfLines={1} ellipsizeMode='tail' className="text-base font-semibold text-gray-800 flex-1 pr-2">
                  {item.item_name}
                </Text>
                <Text numberOfLines={1} ellipsizeMode='tail' className="text-sm ">{item.category.name}</Text>
              </View>
              <View>
                <Text className="text-sm font-bold text-green-600">${item.price}</Text>

              </View>
            </View>



            <View className='flex-row items-center justify-between'>

              {/* ⭐ Rating */}
              <View className="flex-row mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Icon
                    key={i}
                    name={i < Math.floor(item.average_rating || 0) ? 'star' : 'star-outline'}
                    size={14}
                    color="#facc15"
                  />
                ))}
              </View>
              <View className="flex-row items-center mt-1">
                <Icon name="production-quantity-limits" size={16} color={stockColor} />
                <Text className="text-sm text-gray-600 ml-1">
                  {stockQty} {item.unit}{' '}
                  {isOutOfStock ? '(Out of stock)' : isLowStock ? '(Low)' : ''}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 🔽 BOTTOM SECTION */}
        <View className="flex-row justify-between items-center px-4 pt-2 pb-2 border-t border-gray-200">

          {/* 🔁 Status */}
          <View className="items-center flex-row gap-2">
            <Switch
              value={item.status === 1}
              onValueChange={() => handleToggleStatus(item.id, item.status === 1)}
              disabled={productLoading[item.id]}
              trackColor={{ false: "#ccc", true: "#22c55e" }}
              thumbColor={item.status === 1 ? "#10b981" : "#f3f4f6"}
              size="small"
            />
            <Text>{item.status === 1 ? "Live" : "Offline"}</Text>

            <View className={`rounded-full w-3 h-3 ${item.status === 1 ? "bg-green-600" : "bg-red-600"}`} />
          </View>
          <View className='flex-row items-center gap-2'>

            {/* ✏️ Edit */}
            <TouchableOpacity
              onPress={() => navigation.navigate('AddProductScreen', { productId: item.id })}
              className="flex-row items-center  px-3 py-1.5"
            >
              <Icon name="edit" size={14} color="black" />
              <Text className="text-sm text-black ml-1">Edit</Text>
            </TouchableOpacity>

            {/* 🗑️ Delete */}
            <TouchableOpacity
              onPress={() => handleDeleteProduct(item.id, item.item_name)}
              className="px-3 "
              disabled={productLoading[item.id]}
            >
              <Icon name="delete" size={18} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };



  return (
    <View className="flex-1 bg-white">
      {isLoading && loadingSpinner}
      {/* Header */}
      <View className="flex-row items-center p-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 absolute left-2"
        >
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold">Your Inventory 📦</Text>
          <Text className="text-gray-500">Update in real-time, stay stocked</Text>
        </View>
      </View>


      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={handleCancelDelete}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-11/12">
            <Text className="text-xl font-bold mb-2">
              Delete {confirmAction?.type === 'category' ? 'Category' : 'Product'}
            </Text>
            <Text className="text-base mb-4">
              Are you sure you want to delete "{confirmAction?.name}"?
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                onPress={handleCancelDelete}
                className="flex-1 bg-gray-200 p-3 rounded-lg mr-2"
                disabled={isLoading}
              >
                <Text className="text-center font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelete}
                className={`flex-1 bg-red-500 p-3 rounded-lg ${isLoading ? 'opacity-50' : ''}`}
                disabled={isLoading}
              >
                <Text className="text-white text-center font-medium">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Summary Boxes */}
      <View className="flex-row justify-between px-4 py-4">
        <TouchableOpacity
          className="w-[48%] bg-yellow-100 rounded-xl p-4 items-center shadow-md"
          onPress={() => {
            const lowStockItems = products.filter(item => item.stock_quantity < 5);
            if (lowStockItems.length) {
              navigation.navigate('FilteredProductListScreen', {
                title: 'Low Stock',
                products: lowStockItems,
              });
            } else {
              ToastAndroid.show('No low stock items found.', ToastAndroid.SHORT);
            }
          }}
        >
          <Feather name="alert-triangle" size={30} color="orange" />
          <Text className="text-xl font-bold text-gray-800 mt-2">
            {products.filter(item => item.stock_quantity < 5).length}
          </Text>
          <Text className="text-sm text-gray-600">Low Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="w-[48%] bg-red-100 rounded-xl p-4 items-center shadow-md"
          onPress={() => {
            const outOfStockItems = products.filter(item => item.stock_quantity === 0);
            if (outOfStockItems.length) {
              navigation.navigate('FilteredProductListScreen', {
                title: 'Out of Stock',
                products: outOfStockItems,
              });
            } else {
              ToastAndroid.show('No out of stock items found.', ToastAndroid.SHORT);
            }
          }}
        >
          <Feather name="x-circle" size={30} color="red" />
          <Text className="text-xl font-bold text-gray-800 mt-2">
            {products.filter(item => item.stock_quantity === 0).length}
          </Text>
          <Text className="text-sm text-gray-600">Out of Stock</Text>
        </TouchableOpacity>
      </View>


      {/* Categories Section */}
      <View className="px-4">
        <View className="flex-row justify-between items-center ">
          <Text className="text-xl font-bold">Categories</Text>
        </View>
        {isLoading && !categories.length ? (
          <Text className="text-gray-500">Loading categories...</Text>
        ) : categories.length === 0 ? (
          <Text className="text-gray-500">No categories added yet</Text>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pb-2"
          />
        )}
      </View>


      {/* Product List */}
      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-3 px-4">
          <Text className="text-xl font-bold">
            Products in {selectedCategory?.name || 'Selected Category'}
          </Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('AddProductScreen', { categoryId: selectedCategory?.id })
            }
            className="bg-primary-100 p-2 rounded-lg"
          >
            <Icon name="add" size={20} color="white" />
          </TouchableOpacity>
        </View>
        {products.length > 0 ? (
          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Text className="text-gray-500">No products in this category</Text>
        )}
      </View>
    </View>
  );
};

export default ManageStockScreen;