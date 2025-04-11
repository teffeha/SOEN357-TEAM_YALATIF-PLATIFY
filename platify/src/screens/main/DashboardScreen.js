import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
      minH="100px"
      justifyContent="space-between"
    >
      <VStack space={1}>
        <HStack space={2} alignItems="center">
          <Icon as={Ionicons} name={icon} size="sm" color={color} />
          <Text 
            fontSize="sm" 
            fontWeight="medium" 
            numberOfLines={2} 
            flexShrink={1}
          >
            {title}
          </Text>
        </HStack>
        <Text 
          fontSize="xl" 
          fontWeight="bold" 
          color={color} 
          adjustsFontSizeToFit 
          numberOfLines={1}
          mt={1}
        >
          {value}
        </Text>
      </VStack>
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

  // Debug logging to see what's in the recipe object
  console.log('Recipe in card:', JSON.stringify(recipe, null, 2));

  // Ensure recipe has all required properties with fallbacks
  const recipeName = recipe?.name || recipe?.title || "Recipe";
  const skillLevel = recipe?.skill_level || 'beginner';
  
  // Improved time estimate handling with multiple fallbacks and formatting
  let timeEstimate = '';
  if (recipe?.time_estimate) {
    timeEstimate = recipe.time_estimate;
  } else if (recipe?.cooking_time) {
    timeEstimate = recipe.cooking_time;
  } else if (recipe?.recipe?.time_estimate) {
    timeEstimate = recipe.recipe.time_estimate;
  } else if (recipe?.recipe?.cooking_time) {
    timeEstimate = recipe.recipe.cooking_time;
  } else {
    timeEstimate = '30 min';
  }
  
  // Ensure time format is consistent (e.g., "30 min" instead of "30 minutes")
  if (timeEstimate.includes('minute')) {
    timeEstimate = timeEstimate.replace('minutes', 'min').replace('minute', 'min');
  }
  
  const portions = recipe?.portions || recipe?.servings || 2;

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
              {recipeName}
            </Text>
            <HStack space={3} alignItems="center">
              <HStack space={1} alignItems="center">
                <Icon as={Ionicons} name="time-outline" size="xs" color="gray.500" />
                <Text fontSize="xs" color="gray.500">
                  {timeEstimate}
                </Text>
              </HStack>
              <HStack space={1} alignItems="center">
                <Icon as={Ionicons} name="people-outline" size="xs" color="gray.500" />
                <Text fontSize="xs" color="gray.500">
                  {portions} {portions === 1 ? 'portion' : 'portions'}
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
    <Box 
      flex={1} 
      bg="#F5F5F5" 
      _ios={{ safeAreaTop: true }}
      _android={{ safeAreaTop: true }}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 0
        }}
      >
        <VStack space={4}>
          <Heading size="lg">
            Dashboard
          </Heading>
          <Heading size="sm" mb={2}>
            Weekly Metrics
          </Heading>
          <VStack space={3}>
            <HStack space={3} justifyContent="space-between">
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
            <HStack space={3} justifyContent="space-between">
              <MetricCard 
                title="Recipes Generated" 
                value={userMetrics.recipesGenerated || 0} 
                icon="restaurant-outline" 
                color="blue.500" 
              />
              <MetricCard 
                title="Ingredients Used" 
                value={userMetrics.ingredientsUsed || 0} 
                icon="nutrition-outline" 
                color="blue.500" 
              />
            </HStack>
          </VStack>
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
            mb={2}
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
            <Center h="200px">
              <Spinner size="lg" color="green.500" />
            </Center>
          ) : favoriteRecipes.length > 0 ? (
            <VStack space={0} mb={0}>
              {favoriteRecipes.slice(0, 5).map((item, index) => (
                <RecipeCard 
                  key={`recipe-${item.id || ''}-${index}`}
                  recipe={item} 
                  onPress={() => handleRecipePress(item)} 
                />
              ))}
            </VStack>
          ) : (
            <Center h="200px">
              <Icon 
                as={Ionicons} 
                name="heart-outline" 
                size="4xl" 
                color="gray.300" 
              />
              <Text color="gray.500" mt={2}>
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
      </ScrollView>
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
