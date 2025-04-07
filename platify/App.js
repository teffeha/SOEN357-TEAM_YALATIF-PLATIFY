import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, LogBox, Text, View, ActivityIndicator, SafeAreaView } from 'react-native';
import { Provider } from 'react-redux';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { store } from './src/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebase';
import { setUser } from './src/store/slices/authSlice';
import AppNavigator from './src/navigation/AppNavigator';

// Ignore specific LogBox warnings
LogBox.ignoreLogs([
  'NativeBase: The contrast ratio of',
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components",
  "AsyncStorage has been extracted from react-native",
  "Warning: ...",  // Add any other warnings you want to ignore
]);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        store.dispatch(setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0]
        }));
      } else {
        // User is signed out
        store.dispatch(setUser(null));
      }
      
      // Simulate a slight delay for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    });
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  // Loading screen with animation
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>P</Text>
        </View>
        <Text style={styles.loadingTitle}>Platify</Text>
        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        <Text style={styles.loadingSubtitle}>Preparing your culinary experience...</Text>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  // Define theme for NativeBase with comprehensive dark mode
  const theme = extendTheme({
    config: {
      initialColorMode: 'dark',
      useSystemColorMode: false,
    },
    colors: {
      // Primary brand colors
      primary: {
        50: '#e6f2e6',
        100: '#c6e0c6',
        200: '#a3cda3',
        300: '#7fb97f',
        400: '#5ca65c',
        500: '#4CAF50', // Primary green color
        600: '#3d8c3d',
        700: '#2e692e',
        800: '#1f461f',
        900: '#0f230f',
      },
      // Custom dark mode colors
      darkBg: '#121212',           // Main background
      darkCard: '#1E1E1E',         // Card/container background
      darkCardAlt: '#252525',      // Alternative card background
      darkInput: '#2A2A2A',        // Input background
      darkBorder: '#333333',       // Border color
      darkBorderAlt: '#444444',    // Alternative border color
      darkText: '#E1E1E1',         // Primary text
      darkTextAlt: '#CCCCCC',      // Secondary text
      darkSubtext: '#AAAAAA',      // Tertiary text
      darkIcon: '#BBBBBB',         // Icon color
      darkSuccess: '#43A047',      // Success color
      darkError: '#E53935',        // Error color
      darkWarning: '#FFB300',      // Warning color
      darkInfo: '#039BE5',         // Info color
      darkDisabled: '#666666',     // Disabled state
      darkDivider: '#333333',      // Divider color
      darkOverlay: 'rgba(0,0,0,0.7)', // Overlay color
      darkHighlight: 'rgba(76,175,80,0.2)', // Highlight color
    },
    // Global style overrides for dark mode
    components: {
      Button: {
        defaultProps: {
          colorScheme: 'primary',
        },
        baseStyle: (props) => ({
          _text: {
            color: props.colorMode === 'dark' ? 'white' : undefined,
          },
          _icon: {
            color: props.colorMode === 'dark' ? 'white' : undefined,
          },
        }),
        variants: {
          solid: (props) => ({
            bg: props.colorMode === 'dark' ? 'primary.500' : undefined,
            _pressed: {
              bg: props.colorMode === 'dark' ? 'primary.600' : undefined,
            },
          }),
          outline: (props) => ({
            borderColor: props.colorMode === 'dark' ? 'primary.500' : undefined,
            _text: {
              color: props.colorMode === 'dark' ? 'primary.400' : undefined,
            },
            _pressed: {
              bg: props.colorMode === 'dark' ? 'rgba(76,175,80,0.2)' : undefined,
            },
          }),
          ghost: (props) => ({
            _text: {
              color: props.colorMode === 'dark' ? 'primary.400' : undefined,
            },
            _pressed: {
              bg: props.colorMode === 'dark' ? 'rgba(76,175,80,0.2)' : undefined,
            },
          }),
          subtle: (props) => ({
            bg: props.colorMode === 'dark' ? 'rgba(76,175,80,0.2)' : undefined,
            _text: {
              color: props.colorMode === 'dark' ? 'primary.400' : undefined,
            },
            _pressed: {
              bg: props.colorMode === 'dark' ? 'rgba(76,175,80,0.3)' : undefined,
            },
          }),
        },
      },
      Box: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'darkBg' : 'white',
        }),
      },
      Text: {
        baseStyle: (props) => ({
          color: props.colorMode === 'dark' ? 'darkText' : 'gray.800',
        }),
        variants: {
          subtitle: (props) => ({
            color: props.colorMode === 'dark' ? 'darkSubtext' : 'gray.600',
          }),
        },
      },
      Heading: {
        baseStyle: (props) => ({
          color: props.colorMode === 'dark' ? 'darkText' : 'gray.800',
        }),
      },
      Input: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'darkInput' : 'white',
          borderColor: props.colorMode === 'dark' ? 'darkBorder' : 'gray.200',
          color: props.colorMode === 'dark' ? 'darkText' : 'gray.800',
          placeholderTextColor: props.colorMode === 'dark' ? 'darkSubtext' : 'gray.400',
          _focus: {
            borderColor: props.colorMode === 'dark' ? 'primary.500' : undefined,
            bg: props.colorMode === 'dark' ? 'darkInput' : undefined,
          },
        }),
      },
      Select: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'darkInput' : 'white',
          borderColor: props.colorMode === 'dark' ? 'darkBorder' : 'gray.200',
          color: props.colorMode === 'dark' ? 'darkText' : 'gray.800',
          placeholderTextColor: props.colorMode === 'dark' ? 'darkSubtext' : 'gray.400',
          _actionSheetContent: {
            bg: props.colorMode === 'dark' ? 'darkCard' : undefined,
          },
        }),
      },
      Pressable: {
        baseStyle: (props) => ({
          _pressed: {
            bg: props.colorMode === 'dark' ? 'darkCardAlt' : 'gray.200',
          },
        }),
      },
      Divider: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'darkDivider' : 'gray.200',
        }),
      },
      Spinner: {
        baseStyle: (props) => ({
          color: props.colorMode === 'dark' ? 'primary.400' : 'primary.500',
        }),
      },
      Badge: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'darkCardAlt' : undefined,
          _text: {
            color: props.colorMode === 'dark' ? 'darkText' : undefined,
          },
        }),
      },
      Chip: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'darkCardAlt' : undefined,
          _text: {
            color: props.colorMode === 'dark' ? 'darkText' : undefined,
          },
        }),
      },
      FormControl: {
        baseStyle: (props) => ({
          _text: {
            color: props.colorMode === 'dark' ? 'darkText' : undefined,
          },
          _errorText: {
            color: props.colorMode === 'dark' ? 'darkError' : undefined,
          },
        }),
      },
      Icon: {
        baseStyle: (props) => ({
          color: props.colorMode === 'dark' ? 'darkIcon' : undefined,
        }),
      },
      ScrollView: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'darkBg' : undefined,
        }),
      },
      VStack: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'transparent' : undefined,
        }),
      },
      HStack: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'transparent' : undefined,
        }),
      },
      Center: {
        baseStyle: (props) => ({
          bg: props.colorMode === 'dark' ? 'transparent' : undefined,
        }),
      },
      Slider: {
        baseStyle: (props) => ({
          _filledTrack: {
            bg: props.colorMode === 'dark' ? 'primary.500' : undefined,
          },
        }),
      },
    },
  });

  // Main app with navigation
  return (
    <Provider store={store}>
      <NativeBaseProvider theme={theme}>
        <StatusBar style="light" />
        <AppNavigator />
      </NativeBaseProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  // Loading Screen
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212', // Darker background for loading screen
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 20,
  },
  loader: {
    marginVertical: 10,
  },
  
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Login Screen
  backgroundImage: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#CCCCCC',
    marginBottom: 30,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: '80%',
  },
  signInButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  signUpButtonText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Logged In Screen
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666666',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  featureCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666666',
  },
  recentContainer: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
