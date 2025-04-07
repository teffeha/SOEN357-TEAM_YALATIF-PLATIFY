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
    <Box flex={1} bg="darkBg" _light={{ bg: "white" }} safeArea>
      <VStack space={4} p={4}>
          <Heading size="lg" color="darkText" _light={{ color: "coolGray.800" }}>
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
            <Text fontSize="xl" fontWeight="bold" mt={4} color="darkText" _light={{ color: "coolGray.800" }}>
              {user?.displayName}
            </Text>
            <Text color="darkSubtext" _light={{ color: "coolGray.600" }}>
              {user?.email}
            </Text>
          </Center>
          
          <Divider bg="darkBorder" _light={{ bg: "gray.200" }} />
          
          <Box bg="darkCard" _light={{ bg: "white" }} rounded="lg" shadow={2} p={4}>
            <Heading size="sm" mb={4} color="darkText" _light={{ color: "coolGray.800" }}>
              My Stats
            </Heading>
            
            <HStack justifyContent="space-between" mb={2}>
              <Text color="darkSubtext" _light={{ color: "coolGray.600" }}>Time Saved</Text>
              <Text fontWeight="bold" color="darkText" _light={{ color: "coolGray.800" }}>{metrics.timeSaved || 0} minutes</Text>
            </HStack>
            
            <HStack justifyContent="space-between">
              <Text color="darkSubtext" _light={{ color: "coolGray.600" }}>Food Waste Avoided</Text>
              <Text fontWeight="bold" color="darkText" _light={{ color: "coolGray.800" }}>{metrics.foodWasteAvoided || 0} grams</Text>
            </HStack>
          </Box>
          
          <Box bg="darkCard" _light={{ bg: "white" }} rounded="lg" shadow={2} p={4}>
            <Heading size="sm" mb={4} color="darkText" _light={{ color: "coolGray.800" }}>
              Settings
            </Heading>
            
            <Pressable 
              py={2} 
              flexDirection="row" 
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Icon as={Ionicons} name="notifications-outline" size="sm" color="darkSubtext" _light={{ color: "coolGray.600" }} />
              <Text ml={2} color="darkText" _light={{ color: "coolGray.800" }}>Notifications</Text>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="darkBorder" _light={{ color: "coolGray.400" }} ml="auto" />
            </Pressable>
            
            <Pressable 
              py={2} 
              flexDirection="row" 
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Icon as={Ionicons} name="lock-closed-outline" size="sm" color="darkSubtext" _light={{ color: "coolGray.600" }} />
              <Text ml={2} color="darkText" _light={{ color: "coolGray.800" }}>Privacy</Text>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="darkBorder" _light={{ color: "coolGray.400" }} ml="auto" />
            </Pressable>
            
            <Pressable 
              py={2} 
              flexDirection="row" 
              alignItems="center"
              _pressed={{ opacity: 0.5 }}
            >
              <Icon as={Ionicons} name="help-circle-outline" size="sm" color="darkSubtext" _light={{ color: "coolGray.600" }} />
              <Text ml={2} color="darkText" _light={{ color: "coolGray.800" }}>Help & Support</Text>
              <Icon as={Ionicons} name="chevron-forward" size="sm" color="darkBorder" _light={{ color: "coolGray.400" }} ml="auto" />
            </Pressable>
          </Box>
          
          <Button
            colorScheme="red"
            variant="outline"
            leftIcon={<Icon as={Ionicons} name="log-out-outline" size="sm" />}
            onPress={handleLogout}
            mt={4}
            borderColor="red.500"
            _text={{ color: "red.500" }}
            _dark={{ 
              borderColor: "red.400", 
              _text: { color: "red.400" }
            }}
          >
            Log Out
          </Button>
      </VStack>
    </Box>
  );
};

export default ProfileScreen;
