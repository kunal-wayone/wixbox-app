// src/providers/AuthProvider.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from '../store/slices/userSlice';
import LoadingComponent from '../screens/otherScreen/LoadingComponent';
import MainNavigation from '../navigator/MainNavigation';
import { RootState } from '../store/store';
import { TokenStorage } from '../utils/apiUtils';
import { useNavigation } from '@react-navigation/native';
import { getCurrentLocationWithAddress } from '../utils/tools/locationServices';

const AuthProvider = () => {
  const navigation = useNavigation()
  const dispatch = useDispatch<any>();
  const [address, setaddress] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true);

  const user = useSelector((state: RootState) => state.user);
  useEffect(() => {
    const checkAuth = async () => {
      const token: any = TokenStorage.getToken();
      if (token) {
        try {
          await dispatch(fetchUser());
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
      setIsLoading(false);
    };
    console.log(navigation)
    // getCurrentLocationWithAddress(setaddress, dispatch, user)

    checkAuth();
  }, [dispatch]);

  // if (isLoading) {
  //   return <LoadingComponent />;
  // }

  return <MainNavigation />;
};

export default AuthProvider;
