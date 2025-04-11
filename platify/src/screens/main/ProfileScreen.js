import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Box, 
  Text, 
  Heading, 
  VStack, 
  HStack, 
  Center, 
  NativeBaseProvider,
  Icon,
  Pressable,
  Avatar,
  Divider,
  Button,
  useToast,
  Spinner,
  ScrollView
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { logoutUser } from '../../store/slices/authSlice';
import { getMetrics } from '../../services/metricsService';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const [userMetrics, setUserMetrics] = useState({
    timeSaved: 0,
    foodWasteAvoided: 0,
    recipesGenerated: 0,
    recipesCompleted: 0,
    ingredientsUsed: 0,
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);
  
  // Fetch metrics
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const metrics = await getMetrics();
        if (metrics) {
          setUserMetrics(metrics);
        }
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMetrics();
    
    // Set up an interval to refresh metrics every minute
    const metricsInterval = setInterval(loadMetrics, 60000);
    
    // Cleanup interval on unmount
    return () => clearInterval(metricsInterval);
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.show({
        description: "Successfully logged out",
        placement: "top"
      });
    } catch (error) {
      toast.show({
        description: "Failed to log out. Please try again.",
        placement: "top",
        status: "error"
      });
    }
  };

  // Get initials from user's display name
  const getInitials = () => {
    if (!user || !user.displayName) return "?";
    
    const names = user.displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <Box 
      flex={1} 
      bg="#F5F5F5" 
      _ios={{ safeAreaTop: true }}
      _android={{ safeAreaTop: true }}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <VStack space={4} p={4}>
          <Heading size="lg">
            Profile
          </Heading>
          
          <Center py={6}>
            <Avatar 
              bg="green.500" 
              size="xl"
              _text={{ fontSize: "xl" }}
            >
              {getInitials()}
            </Avatar>
            <Text fontSize="xl" fontWeight="bold" mt={4}>
              {user?.displayName}
            </Text>
            <Text color="coolGray.600">
              {user?.email}
            </Text>
          </Center>
          
          <Divider />
          
          <Box bg="white" rounded="lg" shadow={2} p={4}>
            <HStack justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="sm">
                My Stats
              </Heading>
              {loading && <Spinner size="sm" color="green.500" />}
            </HStack>
            
            <VStack space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={2} alignItems="center">
                  <Icon as={Ionicons} name="time-outline" size="sm" color="green.500" />
                  <Text color="coolGray.600">Time Saved</Text>
                </HStack>
                <Text fontWeight="bold">{userMetrics.timeSaved || 0} minutes</Text>
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={2} alignItems="center">
                  <Icon as={Ionicons} name="leaf-outline" size="sm" color="green.500" />
                  <Text color="coolGray.600">Food Waste Avoided</Text>
                </HStack>
                <Text fontWeight="bold">{userMetrics.foodWasteAvoided || 0} grams</Text>
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={2} alignItems="center">
                  <Icon as={Ionicons} name="restaurant-outline" size="sm" color="blue.500" />
                  <Text color="coolGray.600">Recipes Generated</Text>
                </HStack>
                <Text fontWeight="bold">{userMetrics.recipesGenerated || 0}</Text>
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={2} alignItems="center">
                  <Icon as={Ionicons} name="checkmark-circle-outline" size="sm" color="emerald.500" />
                  <Text color="coolGray.600">Recipes Completed</Text>
                </HStack>
                <Text fontWeight="bold">{userMetrics.recipesCompleted || 0}</Text>
              </HStack>
              
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={2} alignItems="center">
                  <Icon as={Ionicons} name="nutrition-outline" size="sm" color="blue.500" />
                  <Text color="coolGray.600">Ingredients Used</Text>
                </HStack>
                <Text fontWeight="bold">{userMetrics.ingredientsUsed || 0}</Text>
              </HStack>
              
              {userMetrics.lastUpdated && (
                <Text fontSize="xs" color="coolGray.400" textAlign="right" mt={1}>
                  Last updated: {new Date(userMetrics.lastUpdated).toLocaleString()}
                </Text>
              )}
            </VStack>
          </Box>
          
          <Box bg="white" rounded="lg" shadow={2} p={4}>
            <Heading size="sm" mb={4}>
              Settings
            </Heading>
            
            <Pressable 
              py={2} 
              flexDirection="row" 
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Icon as={Ionicons} name="notifications-outline" size="sm" color="gray.600" />
              <Text ml={2}>Notifications</Text>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" ml="auto" />
            </Pressable>
            
            <Pressable 
              py={2} 
              flexDirection="row" 
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Icon as={Ionicons} name="lock-closed-outline" size="sm" color="gray.600" />
              <Text ml={2}>Privacy</Text>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" ml="auto" />
            </Pressable>
            
            <Pressable 
              py={2} 
              flexDirection="row" 
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Icon as={Ionicons} name="help-circle-outline" size="sm" color="gray.600" />
              <Text ml={2}>Help & Support</Text>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="gray.400" ml="auto" />
            </Pressable>
          </Box>
          
          <Button
            colorScheme="red"
            variant="outline"
            leftIcon={<Icon as={Ionicons} name="log-out-outline" size="sm" />}
            onPress={handleLogout}
            mt={4}
          >
            Log Out
          </Button>
        </VStack>
      </ScrollView>
    </Box>
  );
};

export default ProfileScreen;
