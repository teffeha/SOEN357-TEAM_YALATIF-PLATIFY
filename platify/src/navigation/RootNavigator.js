import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

// Import screens
import RecipeDetailScreen from '../screens/main/RecipeDetailScreen';

const Stack = createStackNavigator();

const RootNavigator = () => {
  // Get auth state from Redux store
  const user = useSelector(state => state.auth.user);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // User is signed in
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen 
            name="RecipeDetail" 
            component={RecipeDetailScreen} 
            options={{
              headerShown: true,
              title: 'Recipe Details',
              headerTintColor: '#4CAF50',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          />
        </>
      ) : (
        // User is not signed in
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
