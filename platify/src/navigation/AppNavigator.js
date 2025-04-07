import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorMode } from 'native-base';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// Import screens directly
const SignInScreen = require('../screens/auth/SignInScreen').default;
const SignUpScreen = require('../screens/auth/SignUpScreen').default;
const DashboardScreen = require('../screens/main/DashboardScreen').default;
const RecipeSearchScreen = require('../screens/main/RecipeSearchScreen').default;
const RecipeDetailScreen = require('../screens/main/RecipeDetailScreen').default;
const FavoritesScreen = require('../screens/main/FavoritesScreen').default;
const ProfileScreen = require('../screens/main/ProfileScreen').default;

// Create navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tabs
const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: ({ colors }) => ({
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        }),
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Search" component={RecipeSearchScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Auth navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

// Main app navigator
const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={BottomTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RecipeDetail" 
        component={RecipeDetailScreen} 
        options={({ route, navigation }) => ({
          title: 'Recipe Details',
          headerTintColor: '#4CAF50',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerStyle: ({ colors }) => ({
            backgroundColor: colors.card,
            shadowColor: colors.border,
            elevation: 0,
          }),
        })}
      />
    </Stack.Navigator>
  );
};

// Custom themes for navigation
const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#4CAF50',
    background: '#121212',
    card: '#1E1E1E',
    text: '#E1E1E1',
    border: '#333333',
    notification: '#4CAF50',
  },
};

const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4CAF50',
  },
};

// Root navigator
const AppNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  const { colorMode } = useColorMode();
  
  return (
    <NavigationContainer theme={colorMode === 'dark' ? customDarkTheme : customLightTheme}>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
