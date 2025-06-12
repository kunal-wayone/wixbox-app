import React, {JSX, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';

const ProtectedRoute = ({children}: {children: JSX.Element}) => {
  const isAuthenticated = useSelector(
    (state: any) => state.user.isAuthenticated,
  );
  const data = useSelector((state: any) => state.user);
  const navigation = useNavigation<any>();

  useEffect(() => {
    console.log(isAuthenticated, data, 'sdfghjkl;');
    if (!isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{name: 'LoginScreen'}],
      });
    }
  }, [isAuthenticated]);

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;
