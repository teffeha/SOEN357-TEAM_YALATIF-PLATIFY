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
    // Normalize recipe properties with fallbacks
    const title = item.title || item.name || "Untitled Recipe";
    const cookingTime = item.cooking_time || (item.time_estimate ? parseInt(item.time_estimate) : 0);
    const portions = item.portions || item.servings || 0;
    const skillLevel = item.skill_level || item.skillLevel || "beginner";
    
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
                {title}
              </Text>
              <HStack space={4} alignItems="center">
                <HStack space={1} alignItems="center">
                  <Icon as={Ionicons} name="time-outline" size="xs" color="gray.600" />
                  <Text fontSize="xs" color="gray.600">
                    {cookingTime} mins
                  </Text>
                </HStack>
                
                <HStack space={1} alignItems="center">
                  <Icon as={Ionicons} name="people-outline" size="xs" color="gray.600" />
                  <Text fontSize="xs" color="gray.600">
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
        rounded="lg"
        onPress={() => handleDeleteRecipe(item.id)}
      >
        <Icon as={Ionicons} name="trash" size="sm" color="white" />
      </Pressable>
    </HStack>
  );

  const emptyList = () => (
    <Center flex={1} p={5}>
      <Icon as={Ionicons} name="heart" size="4xl" color="gray.300" mb={4} />
      <Heading size="md" color="gray.500" mb={2}>No Favorite Recipes</Heading>
      <Text textAlign="center" color="gray.400">
        Your saved recipes will appear here. Swipe left to remove a recipe from favorites.
      </Text>
    </Center>
  );

  return (
    <Box flex={1} bg="#F5F5F5" safeArea>
      <VStack space={4} flex={1} p={4}>
        <Heading size="lg" color="coolGray.800">
          Favorite Recipes
        </Heading>
        
        {isLoading ? (
          <Center flex={1}>
            <Spinner size="lg" color="green.500" />
          </Center>
        ) : (
          <Box flex={1}>
            {favoriteRecipes && favoriteRecipes.length > 0 ? (
              <SwipeListView
                data={favoriteRecipes}
                renderItem={renderItem}
                renderHiddenItem={renderHiddenItem}
                rightOpenValue={-70}
                keyExtractor={(item) => item.id || item.recipe_id || String(Math.random())}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              emptyList()
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default FavoritesScreen;
