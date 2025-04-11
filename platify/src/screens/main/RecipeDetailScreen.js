import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { markRecipeCompleted } from '../../services/metricsService';
import { 
  Box, 
  Text, 
  Heading, 
  VStack, 
  HStack, 
  ScrollView, 
  NativeBaseProvider,
  Icon,
  Pressable,
  Badge,
  Divider,
  IconButton,
  Accordion,
  useToast
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { saveRecipe, removeRecipe } from '../../store/slices/recipeSlice';

const RecipeDetailScreen = ({ route, navigation }) => {
  // Ensure recipe has a unique ID
  const { recipe: originalRecipe } = route.params;
  const recipe = React.useMemo(() => {
    // If recipe doesn't have an ID, create one using name/title and steps hash for consistency
    if (!originalRecipe.id) {
      // Create a consistent hash based on recipe content to ensure the same recipe gets the same ID
      const nameStr = originalRecipe.name || originalRecipe.title || '';
      const stepsStr = originalRecipe.steps ? JSON.stringify(originalRecipe.steps) : '';
      const instructionsStr = originalRecipe.instructions ? JSON.stringify(originalRecipe.instructions) : '';
      const contentHash = `${nameStr}-${stepsStr || instructionsStr}`.split('').reduce(
        (hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0
      ).toString(36);
      
      return {
        ...originalRecipe,
        id: `recipe-${nameStr.toLowerCase().replace(/\s+/g, '-')}-${contentHash}`
      };
    }
    return originalRecipe;
  }, [originalRecipe]);
  
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { favoriteRecipes, isLoading } = useSelector((state) => state.recipes);
  const [completed, setCompleted] = useState(false);
  const [completedAt, setCompletedAt] = useState(null);
  
  // Check if recipe is already in favorites
  const isFavorite = favoriteRecipes.some(fav => 
    fav.name === recipe.name && 
    JSON.stringify(fav.steps) === JSON.stringify(recipe.steps)
  );
  
  // Check if recipe is already marked as completed
  useEffect(() => {
    const checkCompletionStatus = async () => {
      try {
        // First check completedRecipes list (more reliable)
        const completedRecipesJson = await AsyncStorage.getItem('completedRecipes');
        if (completedRecipesJson) {
          const completedRecipes = JSON.parse(completedRecipesJson);
          
          // Check if this recipe's ID is in the completed list
          if (recipe.id && completedRecipes.includes(recipe.id)) {
            setCompleted(true);
            
            // Get completion date from history if available
            const historyJson = await AsyncStorage.getItem('recipeHistory');
            if (historyJson) {
              const history = JSON.parse(historyJson);
              const historyRecipe = history.find(item => item.id === recipe.id);
              if (historyRecipe && historyRecipe.completedAt) {
                setCompletedAt(historyRecipe.completedAt);
              } else {
                setCompletedAt(new Date().toISOString());
              }
            }
            return; // Exit early if found in completed list
          }
          
          // If not found by ID, check using content matching
          // Create a consistent hash for this recipe
          const nameStr = recipe.name || recipe.title || '';
          const stepsStr = recipe.steps ? JSON.stringify(recipe.steps) : '';
          const instructionsStr = recipe.instructions ? JSON.stringify(recipe.instructions) : '';
          const contentHash = `${nameStr}-${stepsStr || instructionsStr}`.split('').reduce(
            (hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0
          ).toString(36);
          const generatedId = `recipe-${nameStr.toLowerCase().replace(/\s+/g, '-')}-${contentHash}`;
          
          if (completedRecipes.includes(generatedId)) {
            setCompleted(true);
            // Get completion date from history if available
            const historyJson = await AsyncStorage.getItem('recipeHistory');
            if (historyJson) {
              const history = JSON.parse(historyJson);
              const historyRecipe = history.find(item => item.id === generatedId);
              if (historyRecipe && historyRecipe.completedAt) {
                setCompletedAt(historyRecipe.completedAt);
              } else {
                setCompletedAt(new Date().toISOString());
              }
            }
            return; // Exit early if found in completed list
          }
        }
        
        // If not found in completedRecipes, check recipe history as a fallback
        const historyJson = await AsyncStorage.getItem('recipeHistory');
        if (historyJson) {
          const history = JSON.parse(historyJson);
          // Find this recipe in history using precise matching
          const historyRecipe = history.find(item => {
            // First try to match by ID (most accurate)
            if (item.id && recipe.id && item.id === recipe.id) {
              return true;
            }
            
            // If no ID match, try to match by name/title AND steps/instructions (more precise)
            if ((item.name === recipe.name || item.title === recipe.title) && 
                ((item.steps && recipe.steps && 
                  JSON.stringify(item.steps) === JSON.stringify(recipe.steps)) ||
                 (item.instructions && recipe.instructions && 
                  JSON.stringify(item.instructions) === JSON.stringify(recipe.instructions)))) {
              return true;
            }
            
            return false;
          });
          
          if (historyRecipe && historyRecipe.completed) {
            setCompleted(true);
            setCompletedAt(historyRecipe.completedAt);
          }
        }
      } catch (error) {
        console.error('Error checking recipe completion status:', error);
      }
    };
    
    checkCompletionStatus();
  }, [recipe]);
  
  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (isFavorite) {
      // Find the recipe ID in favorites
      const favoriteRecipe = favoriteRecipes.find(fav => 
        fav.name === recipe.name && 
        JSON.stringify(fav.steps) === JSON.stringify(recipe.steps)
      );
      
      if (favoriteRecipe) {
        await dispatch(removeRecipe({ 
          recipeId: favoriteRecipe.id, 
          userId: user.uid 
        }));
        
        toast.show({
          description: "Recipe removed from favorites",
          placement: "top"
        });
      }
    } else {
      await dispatch(saveRecipe({ 
        recipe, 
        userId: user.uid 
      }));
      
      toast.show({
        description: "Recipe added to favorites",
        placement: "top"
      });
    }
  };
  
  // Handle marking recipe as completed
  const handleRecipeCompletion = async () => {
    try {
      if (!completed) {
        // Ensure we're using the recipe with the proper ID
        const recipeWithId = recipe;
        
        // Mark recipe as completed
        await markRecipeCompleted(recipeWithId);
        setCompleted(true);
        setCompletedAt(new Date().toISOString());
        
        // Also update the completedRecipes list directly for redundancy
        try {
          const completedRecipesJson = await AsyncStorage.getItem('completedRecipes');
          let completedRecipes = [];
          if (completedRecipesJson) {
            completedRecipes = JSON.parse(completedRecipesJson);
          }
          
          if (!completedRecipes.includes(recipeWithId.id)) {
            completedRecipes.push(recipeWithId.id);
            await AsyncStorage.setItem('completedRecipes', JSON.stringify(completedRecipes));
          }
        } catch (storageError) {
          console.error('Error updating completedRecipes:', storageError);
        }
        
        toast.show({
          description: "Recipe marked as completed!",
          placement: "top",
          status: "success",
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error marking recipe as completed:', error);
      toast.show({
        description: "Error marking recipe as completed",
        placement: "top",
        status: "error",
        duration: 2000
      });
    }
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

  return (
    <NativeBaseProvider>
      <Box flex={1} bg="white" safeArea>
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack space={4} p={4}>
            {/* Header with back button and favorite icon */}
            <HStack justifyContent="space-between" alignItems="center">
              <IconButton
                icon={<Icon as={Ionicons} name="arrow-back" />}
                onPress={() => navigation.goBack()}
                borderRadius="full"
                _icon={{ color: "coolGray.700" }}
                _pressed={{ bg: "coolGray.100" }}
              />
              <IconButton
                icon={
                  <Icon 
                    as={Ionicons} 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    color={isFavorite ? "red.500" : "coolGray.400"}
                  />
                }
                onPress={handleFavoriteToggle}
                isLoading={isLoading}
                borderRadius="full"
                _pressed={{ bg: "coolGray.100" }}
              />
            </HStack>
            
            {/* Recipe title and info */}
            <VStack space={2}>
              <Heading size="xl" color="coolGray.800">
                {recipe.name}
              </Heading>
              
              <HStack space={4} alignItems="center">
                <HStack space={1} alignItems="center">
                  <Icon as={Ionicons} name="time-outline" size="sm" color="coolGray.500" />
                  <Text color="coolGray.500">{recipe.time_estimate}</Text>
                </HStack>
                
                <Badge 
                  colorScheme={
                    recipe.skill_level === 'beginner' ? 'green' : 
                    recipe.skill_level === 'intermediate' ? 'orange' : 'red'
                  }
                  variant="solid"
                  rounded="full"
                >
                  {recipe.skill_level}
                </Badge>
              </HStack>
            </VStack>
            
            <Divider />
            
            {/* Recipe steps */}
            <VStack space={2}>
              <Heading size="md" color="coolGray.700">
                Instructions
              </Heading>
              
              <Accordion allowMultiple defaultIndex={[0]}>
                {recipe.steps.map((step, index) => (
                  <Accordion.Item key={index}>
                    <Accordion.Summary>
                      <HStack space={2} alignItems="center" justifyContent="space-between" width="100%">
                        <HStack space={2} alignItems="center" flex={1}>
                          <Box 
                            bg={getSkillColor(recipe.skill_level)} 
                            rounded="full" 
                            w={6} 
                            h={6} 
                            justifyContent="center" 
                            alignItems="center"
                          >
                            <Text color="white" fontWeight="bold">
                              {index + 1}
                            </Text>
                          </Box>
                          <Text fontWeight="medium">
                            Step {index + 1}
                          </Text>
                        </HStack>
                        <Box mr={2}>
                          <Accordion.Icon />
                        </Box>
                      </HStack>
                    </Accordion.Summary>
                    <Accordion.Details>
                      <Text ml={8} color="coolGray.600">
                        {step}
                      </Text>
                    </Accordion.Details>
                  </Accordion.Item>
                ))}
              </Accordion>
            </VStack>
            
            {/* Tips section */}
            <VStack space={2} bg="coolGray.50" p={4} rounded="md">
              <HStack space={2} alignItems="center">
                <Icon as={Ionicons} name="bulb-outline" color="amber.500" />
                <Text fontWeight="bold" color="coolGray.700">
                  Tips
                </Text>
              </HStack>
              <Text color="coolGray.600">
                • Prep all ingredients before starting to cook for a smoother experience.
                {'\n'}• Adjust seasoning to taste as you go.
                {'\n'}• Let the dish rest for a few minutes before serving for better flavor.
              </Text>
            </VStack>
            
            {/* Mark as Completed Button */}
            <Box p={4} mt={2}>
              <Pressable
                disabled={completed}
                onPress={handleRecipeCompletion}
                bg={completed ? "green.100" : "green.500"}
                _pressed={{ bg: completed ? "green.100" : "green.600" }}
                py={3}
                rounded="md"
              >
                <HStack space={2} justifyContent="center" alignItems="center">
                  <Icon 
                    as={Ionicons} 
                    name={completed ? "checkmark-circle" : "checkmark-circle-outline"} 
                    color={completed ? "green.500" : "white"} 
                    size="sm" 
                  />
                  <Text color={completed ? "green.500" : "white"} fontWeight="medium">
                    {completed ? "Completed" : "Mark as Completed"}
                  </Text>
                </HStack>
              </Pressable>
              {completed && completedAt && (
                <Text fontSize="xs" color="coolGray.500" textAlign="center" mt={1}>
                  Completed on {new Date(completedAt).toLocaleDateString()}
                </Text>
              )}
            </Box>
          </VStack>
        </ScrollView>
      </Box>
    </NativeBaseProvider>
  );
};

export default RecipeDetailScreen;
