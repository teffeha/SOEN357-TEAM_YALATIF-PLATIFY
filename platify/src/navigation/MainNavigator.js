import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import main screens
import DashboardScreen from '../screens/main/DashboardScreen';
import RecipeSearchScreen from '../screens/main/RecipeSearchScreen';
import FavoritesScreen from '../screens/main/FavoritesScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainNavigator = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const isIphoneX = () => {
    const { height, width } = Dimensions.get('window');
    return (
      Platform.OS === 'ios' && 
      !Platform.isPad && 
      !Platform.isTVOS && 
      ((height === 780 || width === 780)
        || (height === 812 || width === 812)
        || (height === 844 || width === 844)
        || (height === 896 || width === 896)
        || (height === 926 || width === 926)
        || (height >= 932))
    );
  };
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          height: isIphoneX() ? 90 : Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: isIphoneX() ? 30 : Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          paddingBottom: isIphoneX() ? 10 : Platform.OS === 'ios' ? 4 : 0,
        },
        tabBarItemStyle: {
          paddingTop: 5,
        },
      })}
      safeAreaInsets={{ bottom: 0 }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Search" component={RecipeSearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
