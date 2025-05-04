import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import BookListScreen from './src/screens/BookListScreen';
import SwipeListScreen from './src/screens/SwipeListScreen';
import ProfileScreen from './src/screens/ProfileScreen'; 
import VestiaireScreen from './src/screens/VestiaireScreen';
import { RootStackParamList } from './src/types'; // 🛑 important !!

const Stack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="BookList" component={BookListScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="SwipeList" component={SwipeListScreen} />
        <Stack.Screen name="Vestiaire" component={VestiaireScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
