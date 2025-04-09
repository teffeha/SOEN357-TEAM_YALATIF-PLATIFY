import React from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
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
  useToast
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { logoutUser } from '../../store/slices/authSlice';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { metrics } = useSelector((state) => state.recipes);


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
    <Box flex={1} bg="#F5F5F5" safeArea>
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
            <Heading size="sm" mb={4}>
              My Stats
            </Heading>
            
            <HStack justifyContent="space-between" mb={2}>
              <Text color="coolGray.600">Time Saved</Text>
              <Text fontWeight="bold">{metrics.timeSaved || 0} minutes</Text>
            </HStack>
            
            <HStack justifyContent="space-between">
              <Text color="coolGray.600">Food Waste Avoided</Text>
              <Text fontWeight="bold">{metrics.foodWasteAvoided || 0} grams</Text>
            </HStack>
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
      </Box>
    
  );
};

export default ProfileScreen;
