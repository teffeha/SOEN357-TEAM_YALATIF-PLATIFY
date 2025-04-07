import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Text, 
  Heading, 
  VStack, 
  FormControl, 
  Input, 
  Button, 
  HStack, 
  Center
} from 'native-base';
import { loginUser, clearError } from '../../store/slices/authSlice';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle sign in
  const handleSignIn = async () => {
    if (validateForm()) {
      try {
        await dispatch(loginUser({ email, password })).unwrap();
      } catch (err) {
        Alert.alert('Sign In Failed', err);
      }
    }
  };

  // Clear any auth errors when navigating away
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  return (
    <Box flex={1} bg="darkBg" _light={{ bg: "white" }} safeArea>
      <Center flex={1} px={4}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          w="100%"
        >
          <ScrollView contentContainerStyle={styles.container}>
            <Box w="100%" maxW="350" alignItems="center">
              <Heading
                size="xl"
                fontWeight="600"
                color="darkText"
                _light={{ color: "coolGray.800" }}
              >
                Welcome to Platify
              </Heading>
              <Heading
                mt="1"
                color="darkSubtext"
                _light={{ color: "coolGray.600" }}
                fontWeight="medium"
                size="xs"
              >
                Sign in to continue!
              </Heading>

              <VStack space={3} mt="5">
                <FormControl isInvalid={!!formErrors.email}>
                  <FormControl.Label _text={{ color: "darkText", _light: { color: "coolGray.800" } }}>Email</FormControl.Label>
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    bg="darkInput"
                    color="darkText"
                    borderColor="darkBorder"
                    size="lg"
                    height="12"
                    width="250"
                    fontSize="md"
                    _light={{ 
                      bg: "white",
                      color: "coolGray.800",
                      borderColor: "coolGray.300" 
                    }}
                  />
                  <FormControl.ErrorMessage>
                    {formErrors.email}
                  </FormControl.ErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!formErrors.password}>
                  <FormControl.Label _text={{ color: "darkText", _light: { color: "coolGray.800" } }}>Password</FormControl.Label>
                  <Input
                    type="password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    bg="darkInput"
                    color="darkText"
                    borderColor="darkBorder"
                    size="lg"
                    height="12"
                    width="250"
                    fontSize="md"
                    _light={{ 
                      bg: "white",
                      color: "coolGray.800",
                      borderColor: "coolGray.300" 
                    }}
                  />
                  <FormControl.ErrorMessage>
                    {formErrors.password}
                  </FormControl.ErrorMessage>
                </FormControl>
                
                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
                
                <Button
                  mt="4"
                  colorScheme="green"
                  onPress={handleSignIn}
                  isLoading={isLoading}
                  isLoadingText="Signing in"
                  _text={{ color: "white", fontSize: "md", outlineColor: 'none', outlineWidth: 0, outlineStyle: 'none' }}
                  height="12"
                  width="250"
                  borderRadius="md"
                >
                  Sign in
                </Button>
                
                <HStack mt="6" justifyContent="center">
                  <Text fontSize="sm" color="darkSubtext" _light={{ color: "coolGray.600" }}>
                    I'm a new user.{" "}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text color="green.500" fontWeight="medium" fontSize="sm">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </HStack>
              </VStack>
            </Box>
          </ScrollView>
        </KeyboardAvoidingView>
      </Center>
    </Box>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    width: '100%',
    flex: 1
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100%'
  }
});

export default SignInScreen;
