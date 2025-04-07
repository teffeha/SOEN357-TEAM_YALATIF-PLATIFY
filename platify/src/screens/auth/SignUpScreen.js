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
                color="darkText"
                _light={{ color: "coolGray.800" }}
                fontWeight="semibold"
              >
                Create Account
              </Heading>
              <Heading
                mt="1"
                color="darkSubtext"
                _light={{ color: "coolGray.600" }}
                fontWeight="medium"
                size="xs"
              >
                Join Platify to discover amazing recipes!
              </Heading>

              <VStack space={3} mt="5">
                <FormControl isInvalid={!!formErrors.firstName}>
                  <FormControl.Label _text={{ color: "darkText", _light: { color: "coolGray.800" } }}>First Name</FormControl.Label>
                  <Input
                    value={firstName}
                    onChangeText={setFirstName}
                    bg="darkInput"
                    color="darkText"
                    borderColor="darkBorder"
                    size="lg"
                    height="12"
                    width="280"
                    fontSize="md"
                    _light={{ 
                      bg: "white",
                      color: "coolGray.800",
                      borderColor: "coolGray.300" 
                    }}
                  />
                  <FormControl.ErrorMessage>
                    {formErrors.firstName}
                  </FormControl.ErrorMessage>
                </FormControl>
                
                <FormControl isInvalid={!!formErrors.lastName}>
                  <FormControl.Label _text={{ color: "darkText", _light: { color: "coolGray.800" } }}>Last Name</FormControl.Label>
                  <Input
                    value={lastName}
                    onChangeText={setLastName}
                    bg="darkInput"
                    color="darkText"
                    borderColor="darkBorder"
                    size="lg"
                    height="12"
                    width="280"
                    fontSize="md"
                    _light={{ 
                      bg: "white",
                      color: "coolGray.800",
                      borderColor: "coolGray.300" 
                    }}
                  />
                  <FormControl.ErrorMessage>
                    {formErrors.lastName}
                  </FormControl.ErrorMessage>
                </FormControl>
                
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
                    width="280"
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
                    width="280"
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
                  <FormControl.HelperText _text={{ color: "darkSubtext", _light: { color: "coolGray.600" } }}>
                    Must be at least 8 characters with 1 special character
                  </FormControl.HelperText>
                </FormControl>
                
                <FormControl isInvalid={!!formErrors.confirmPassword}>
                  <FormControl.Label _text={{ color: "darkText", _light: { color: "coolGray.800" } }}>Confirm Password</FormControl.Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    bg="darkInput"
                    color="darkText"
                    borderColor="darkBorder"
                    size="lg"
                    height="12"
                    width="280"
                    fontSize="md"
                    _light={{ 
                      bg: "white",
                      color: "coolGray.800",
                      borderColor: "coolGray.300" 
                    }}
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
                  mt="4"
                  colorScheme="green"
                  onPress={handleSignUp}
                  isLoading={isLoading}
                  isLoadingText="Creating account"
                  _text={{ color: "white", fontSize: "md", outlineColor: 'none', outlineWidth: 0, outlineStyle: 'none' }}
                  height="12"
                  width="280"
                  borderRadius="md"
                >
                  Sign up
                </Button>
                
                <HStack mt="6" justifyContent="center">
                  <Text fontSize="sm" color="darkSubtext" _light={{ color: "coolGray.600" }}>
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
    paddingVertical: 50
  }
});

export default SignUpScreen;
