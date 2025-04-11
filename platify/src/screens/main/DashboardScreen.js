import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
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
  Divider,
  Badge,
  Spinner
} from 'native-base';
import { getMetrics } from '../../services/metricsService';
import { Ionicons } from '@expo/vector-icons';
import { fetchFavoriteRecipes } from '../../store/slices/recipeSlice';

const MetricCard = ({ title, value, icon, color }) => {
  return (
    <Box 
      bg="white" 
      rounded="lg" 
      shadow={2} 
      p={4} 
      flex={1} 
      m={2}
    >
      <HStack space={2} alignItems="center" flexWrap="wrap">
        <Icon as={Ionicons} name={icon} size="md" color={color} />
        <Text fontSize="md" fontWeight="medium" isTruncated numberOfLines={1} flex={1}>
          {title}
        </Text>
      </HStack>
      <Text fontSize="2xl" fontWeight="bold" mt={2} color={color} adjustsFontSizeToFit numberOfLines={1}>
        {value}
      </Text>
    </Box>
  );
};

const RecipeCard = ({ recipe, onPress }) => {
  // Map skill level to color
  const getSkillColor = (level) => {
    switch(level) {
      case 'beginner': return 'green.500';
      case 'intermediate': return 'orange.500';
      case 'advanced': return 'red.500';
      default: return 'green.500';
    }
  };

  // Normalize recipe properties with fallbacks
  const title = recipe.title || recipe.name || "Untitled Recipe";
  const cookingTime = recipe.cooking_time || (recipe.time_estimate ? parseInt(recipe.time_estimate) : 0);
  const portions = recipe.portions || recipe.servings || 0;
  const skillLevel = recipe.skill_level || recipe.skillLevel || "beginner";

  return (
    <Pressable onPress={onPress}>
      <Box 
        bg="white" 
        rounded="lg" 
        shadow={2} 
        p={4} 
        m={2}
        borderLeftWidth={4}
        borderLeftColor={getSkillColor(skillLevel)}
      >
        <HStack justifyContent="space-between" alignItems="center">
          <VStack space={1} flex={1}>
            <Text fontSize="md" fontWeight="bold" numberOfLines={1}>
              {title}
            </Text>
            <HStack space={4} alignItems="center">
              <HStack space={1} alignItems="center">
                <Icon as={Ionicons} name="time-outline" size="xs" color="gray.500" />
                <Text fontSize="xs" color="gray.500">
                  {cookingTime} mins
                </Text>
              </HStack>
              
              <HStack space={1} alignItems="center">
                <Icon as={Ionicons} name="people-outline" size="xs" color="gray.500" />
                <Text fontSize="xs" color="gray.500">
                  {portions} portions
                </Text>
              </HStack>
            </HStack>
          </VStack>
          <Badge 
            colorScheme={
              skillLevel === 'beginner' ? 'green' : 
              skillLevel === 'intermediate' ? 'orange' : 'red'
            }
            variant="solid"
            rounded="full"
            _text={{ fontSize: 'xs' }}
          >
            {skillLevel}
          </Badge>
        </HStack>
      </Box>
    </Pressable>
  );
};

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { favoriteRecipes, isLoading } = useSelector((state) => state.recipes);
  const [userMetrics, setUserMetrics] = useState({
    timeSaved: 0,
    foodWasteAvoided: 0,
    recipesGenerated: 0,
    ingredientsUsed: 0
  });

  // Fetch favorite recipes
  useEffect(() => {
    let isMounted = true;
    
    if (user && isMounted) {
      dispatch(fetchFavoriteRecipes(user.uid));
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [dispatch, user]);
  
  // Fetch metrics
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const metrics = await getMetrics();
        if (metrics) {
          setUserMetrics(metrics);
        }
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    };
    
    loadMetrics();
    
    // Set up an interval to refresh metrics every 30 seconds
    const metricsInterval = setInterval(loadMetrics, 30000);
    
    // Cleanup interval on unmount
    return () => clearInterval(metricsInterval);
  }, []);

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  return (
      <Box flex={1} bg="#F5F5F5" safeArea>
        <VStack space={4} flex={1} p={4}>
          <Heading size="lg">
            Dashboard
          </Heading>
          
          <Heading size="sm">
            Weekly Metrics
          </Heading>
          
          <HStack>
            <MetricCard 
              title="Time Saved" 
              value={`${userMetrics.timeSaved || 0} min`} 
              icon="time-outline" 
              color="green.500" 
            />
            <MetricCard 
              title="Food Waste Avoided" 
              value={`${userMetrics.foodWasteAvoided || 0} g`} 
              icon="leaf-outline" 
              color="green.500" 
            />
          </HStack>
          
          <HStack>
            <MetricCard 
              title="Recipes Generated" 
              value={userMetrics.recipesGenerated || 0} 
              icon="restaurant-outline" 
              color="blue.500" 
              flexWrap="wrap"
              onPress={() => navigation.navigate('RecipeHistory')}
            />
            <MetricCard 
              title="Ingredients Used" 
              value={userMetrics.ingredientsUsed || 0} 
              icon="nutrition-outline" 
              color="blue.500" 
              onPress={() => navigation.navigate('RecipeHistory')}
            />
          </HStack>
          
          <Divider my={2} />
          
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="sm">
              Recipe History
            </Heading>
            <Pressable onPress={() => navigation.navigate('RecipeHistory')}>
              <Text color="green.500" fontWeight="medium">
                See All
              </Text>
            </Pressable>
          </HStack>
          
          <Pressable 
            onPress={() => navigation.navigate('RecipeHistory')}
            mb={4}
          >
            <Box bg="white" p={4} rounded="lg" shadow={2}>
              <HStack space={3} alignItems="center">
                <Icon as={Ionicons} name="time-outline" size="lg" color="green.500" />
                <VStack>
                  <Text fontWeight="bold" fontSize="md">Recipe History</Text>
                  <Text color="gray.500" fontSize="sm">View your previously generated recipes</Text>
                </VStack>
                <Icon as={Ionicons} name="chevron-forward" ml="auto" color="gray.400" />
              </HStack>
            </Box>
          </Pressable>
          
          <Divider my={2} />
          
          <HStack justifyContent="space-between" alignItems="center">
            <Heading size="sm">
              Favorite Recipes
            </Heading>
            <Pressable onPress={() => navigation.navigate('Favorites')}>
              <Text color="green.500" fontWeight="medium">
                See All
              </Text>
            </Pressable>
          </HStack>
          
          {isLoading ? (
            <Center flex={1}>
              <Spinner size="lg" color="green.500" />
            </Center>
          ) : favoriteRecipes && favoriteRecipes.length > 0 ? (
            <FlatList
              data={favoriteRecipes.slice(0, 5)} // Show only first 5 favorites
              keyExtractor={(item) => item.id || item.recipe_id || String(Math.random())}
              renderItem={({ item }) => (
                <RecipeCard 
                  recipe={item} 
                  onPress={() => handleRecipePress(item)} 
                />
              )}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Center py={10} bg="white" rounded="lg" shadow={1}>
              <Icon 
                as={Ionicons} 
                name="heart-outline" 
                size="4xl" 
                color="gray.300" 
              />
              <Text color="gray.500" mt={2} textAlign="center">
                No favorite recipes yet
              </Text>
              <Pressable 
                mt={4} 
                bg="green.500" 
                px={4} 
                py={2} 
                rounded="md"
                onPress={() => navigation.navigate('Search')}
              >
                <Text color="white" fontWeight="medium">
                  Find Recipes
                </Text>
              </Pressable>
            </Center>
          )}
        </VStack>
      </Box>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default DashboardScreen;
