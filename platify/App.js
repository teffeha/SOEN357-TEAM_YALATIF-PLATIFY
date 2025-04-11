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
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Ignore specific LogBox warnings
LogBox.ignoreLogs([
  'NativeBase: The contrast ratio of',
  "[react-native-gesture-handler] Seems like you're using an old API with gesture components",
  "AsyncStorage has been extracted from react-native",
  "Warning: ...",  // Add any other warnings you want to ignore
]);

// Create custom theme with responsive values
const theme = extendTheme({
  colors: {
    primary: {
      50: '#e6f7ed',
      100: '#c3ebd3',
      200: '#9fdeb8',
      300: '#7bd19c',
      400: '#57c481',
      500: '#34b765', // Primary color
      600: '#2a9251',
      700: '#1f6e3d',
      800: '#154928',
      900: '#0a2514',
    },
  },
  components: {
    Button: {
      baseStyle: {
        rounded: 'full',
      },
    },
    Input: {
      baseStyle: {
        borderRadius: 'md',
      },
    },
  },
  config: {
    initialColorMode: 'light',
  },
});

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
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={styles.loadingTitle}>Platify</Text>
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
          <Text style={styles.loadingSubtitle}>Preparing your culinary experience...</Text>
          <StatusBar style="light" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }
  
  // Main app with navigation
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NativeBaseProvider theme={theme}>
          <StatusBar style="dark" />
          <AppNavigator />
        </NativeBaseProvider>
      </Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Loading Screen
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1E1E1E',
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
