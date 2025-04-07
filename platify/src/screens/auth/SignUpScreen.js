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
import { registerUser, clearError } from '../../store/slices/authSlice';

const SignUpScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    
    if (!firstName) {
      errors.firstName = 'First name is required';
    }
    
    if (!lastName) {
      errors.lastName = 'Last name is required';
    }
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.password = 'Password must contain at least 1 special character';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle sign up
  const handleSignUp = async () => {
    if (validateForm()) {
      try {
        await dispatch(registerUser({ 
          firstName, 
          lastName, 
          email, 
          password 
        })).unwrap();
      } catch (err) {
        Alert.alert('Sign Up Failed', err);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Center w="100%">
          <Box safeArea p="2" w="90%" maxW="290" py="8">
              <Heading
                size="xl"
                color="coolGray.800"
                _dark={{ color: "warmGray.50" }}
                fontWeight="semibold"
              >
                Create Account
              </Heading>
              <Heading
                mt="1"
                color="coolGray.600"
                _dark={{ color: "warmGray.200" }}
                fontWeight="medium"
                size="xs"
              >
                Join Platify to discover amazing recipes!
              </Heading>

              <VStack space={3} mt="5">
                <FormControl isInvalid={!!formErrors.firstName}>
                  <FormControl.Label>First Name</FormControl.Label>
                  <Input
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                  <FormControl.ErrorMessage>
                    {formErrors.firstName}
                  </FormControl.ErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!formErrors.lastName}>
                  <FormControl.Label>Last Name</FormControl.Label>
                  <Input
                    value={lastName}
                    onChangeText={setLastName}
                  />
                  <FormControl.ErrorMessage>
                    {formErrors.lastName}
                  </FormControl.ErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!formErrors.email}>
                  <FormControl.Label>Email</FormControl.Label>
                  <Input
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <FormControl.ErrorMessage>
                    {formErrors.email}
                  </FormControl.ErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!formErrors.password}>
                  <FormControl.Label>Password</FormControl.Label>
                  <Input
                    type="password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                  <FormControl.ErrorMessage>
                    {formErrors.password}
                  </FormControl.ErrorMessage>
                  <FormControl.HelperText>
                    Must be at least 8 characters with 1 special character
                  </FormControl.HelperText>
                </FormControl>
                
                <FormControl isInvalid={!!formErrors.confirmPassword}>
                  <FormControl.Label>Confirm Password</FormControl.Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                  <FormControl.ErrorMessage>
                    {formErrors.confirmPassword}
                  </FormControl.ErrorMessage>
                </FormControl>
                
                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
                
                <Button
                  mt="2"
                  colorScheme="green"
                  onPress={handleSignUp}
                  isLoading={isLoading}
                  isLoadingText="Creating account"
                >
                  Sign up
                </Button>
                
                <HStack mt="6" justifyContent="center">
                  <Text fontSize="sm" color="coolGray.600">
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                    <Text color="green.500" fontWeight="medium" fontSize="sm">
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </HStack>
              </VStack>
            </Box>
          </Center>
        </ScrollView>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff'
  }
});

export default SignUpScreen;
