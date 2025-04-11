import React, { useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';
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
  Spinner,
  Badge,
  Divider,
  useToast
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { fetchFavoriteRecipes, removeRecipe } from '../../store/slices/recipeSlice';
import { SwipeListView } from 'react-native-swipe-list-view';

const FavoritesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { favoriteRecipes, isLoading } = useSelector((state) => state.recipes);

  useEffect(() => {
    if (user) {
      dispatch(fetchFavoriteRecipes(user.uid));
    }
  }, [dispatch, user]);

  const handleRecipePress = (recipe) => {
    // Ensure recipe has an ID before navigating
    if (!recipe.id) {
      console.warn('Recipe missing ID in FavoritesScreen');
    }
    navigation.navigate('RecipeDetail', { recipe });
  };

  const handleDeleteRecipe = async (recipeId) => {
    await dispatch(removeRecipe({ recipeId, userId: user.uid }));
    
    toast.show({
      description: "Recipe removed from favorites",
      placement: "top"
    });
  };

  // Map skill level to color
  const getSkillColor = (level) => {
    switch(level) {
      case 'beginner': return 'green.500';
      case 'intermediate': return 'orange.500';
      case 'advanced': return 'red.500';
      default: return 'green.500';
    }
  };

  const renderItem = ({ item }) => {
    // Debug logging to see what's in the recipe object
    console.log('Recipe in favorites card:', JSON.stringify(item, null, 2));
    
    // Ensure recipe has all required properties with fallbacks
    const recipeName = item?.name || item?.title || "Recipe";
    const skillLevel = item?.skill_level || 'beginner';
    
    // Improved time estimate handling with multiple fallbacks and formatting
    let timeEstimate = '';
    if (item?.time_estimate) {
      timeEstimate = item.time_estimate;
    } else if (item?.cooking_time) {
      timeEstimate = item.cooking_time;
    } else if (item?.recipe?.time_estimate) {
      timeEstimate = item.recipe.time_estimate;
    } else if (item?.recipe?.cooking_time) {
      timeEstimate = item.recipe.cooking_time;
    } else {
      timeEstimate = '30 min';
    }
    
    // Ensure time format is consistent (e.g., "30 min" instead of "30 minutes")
    if (timeEstimate.includes('minute')) {
      timeEstimate = timeEstimate.replace('minutes', 'min').replace('minute', 'min');
    }
    
    const portions = item?.portions || item?.servings || 2;
    
    return (
      <Box 
        bg="white" 
        rounded="lg" 
        shadow={2} 
        p={4} 
        m={2}
        borderLeftWidth={4}
        borderLeftColor={getSkillColor(skillLevel)}
      >
        <Pressable onPress={() => handleRecipePress(item)}>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack space={1} flex={1}>
              <Text fontSize="md" fontWeight="bold" numberOfLines={1}>
                {recipeName}
              </Text>
              <HStack space={3} alignItems="center">
                <HStack space={1} alignItems="center">
                  <Icon as={Ionicons} name="time-outline" size="xs" color="gray.600" />
                  <Text fontSize="xs" color="gray.600">
                    {timeEstimate}
                  </Text>
                </HStack>
                <HStack space={1} alignItems="center">
                  <Icon as={Ionicons} name="people-outline" size="xs" color="gray.600" />
                  <Text fontSize="xs" color="gray.600">
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
        </Pressable>
      </Box>
    );
  };

  const renderHiddenItem = ({ item }) => (
    <HStack flex={1} pl={2} pr={2} my={2} ml={2} mr={2}>
      <Pressable
        w={70}
        ml="auto"
        bg="red.500"
        justifyContent="center"
        alignItems="center"
        onPress={() => handleDeleteRecipe(item.id)}
        _pressed={{ opacity: 0.5 }}
        rounded="lg"
      >
        <Icon as={Ionicons} name="trash" color="white" size="sm" />
      </Pressable>
    </HStack>
  );

  return (
    <Box 
      flex={1} 
      bg="#F5F5F5" 
      _ios={{ safeAreaTop: true }}
      _android={{ safeAreaTop: true }}
    >
      <VStack space={4} p={4} pb={0} flex={1}>
        <Heading size="lg">
          Favorite Recipes
        </Heading>
        
        <Divider />
        
        {isLoading ? (
          <Center flex={1} pb={0}>
            <Spinner size="lg" color="green.500" />
          </Center>
        ) : favoriteRecipes.length > 0 ? (
          <SwipeListView
            data={favoriteRecipes}
            renderItem={renderItem}
            renderHiddenItem={renderHiddenItem}
            rightOpenValue={-70}
            previewRowKey={'0'}
            previewOpenValue={-40}
            previewOpenDelay={3000}
            keyExtractor={(item) => item.id || `recipe-${Math.random()}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 0 }}
            style={{ flex: 1 }}
          />
        ) : (
          <Center flex={1} pb={0}>
            <Icon 
              as={Ionicons} 
              name="heart-outline" 
              size="4xl" 
              color="gray.300" 
            />
            <Text color="gray.600" mt={2}>
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

export default FavoritesScreen;
