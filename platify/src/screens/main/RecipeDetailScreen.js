import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
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
import { Platform } from 'react-native';

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipe } = route.params;
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { favoriteRecipes, isLoading } = useSelector((state) => state.recipes);
  
  // State to track which accordion item is open
  const [openIndex, setOpenIndex] = useState(0);
  
  // Normalize recipe properties with fallbacks
  const title = recipe.title || recipe.name || "Untitled Recipe";
  const cookingTime = recipe.cooking_time || (recipe.time_estimate ? parseInt(recipe.time_estimate) : 0);
  const portions = recipe.portions || recipe.servings || 0;
  const skillLevel = recipe.skill_level || recipe.skillLevel || "beginner";
  
  // Check if recipe is already in favorites
  const isFavorite = favoriteRecipes.some(fav => 
    (fav.title === title || fav.name === title) && 
    JSON.stringify(fav.steps) === JSON.stringify(recipe.steps)
  );
  
  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (isFavorite) {
      // Find the recipe ID in favorites
      const favoriteRecipe = favoriteRecipes.find(fav => 
        (fav.title === title || fav.name === title) && 
        JSON.stringify(fav.steps) === JSON.stringify(recipe.steps)
      );
      
      if (favoriteRecipe) {
        await dispatch(removeRecipe({ 
          recipeId: favoriteRecipe.id, 
          userId: user.uid 
        }));
        
        toast.show({
          description: "Recipe removed from favorites",
          placement: "bottom",
          duration: 2000,
          backgroundColor: "coolGray.700",
          _text: { color: "white" },
          borderRadius: "md",
          marginBottom: 4
        });
      }
    } else {
      await dispatch(saveRecipe({ 
        recipe, 
        userId: user.uid 
      }));
      
      toast.show({
        description: "Recipe added to favorites",
        placement: "bottom",
        duration: 2000,
        backgroundColor: "coolGray.700",
        _text: { color: "white" },
        borderRadius: "md",
        marginBottom: 4
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
      <Box flex={1} bg="white" safeAreaTop>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <VStack space={4} p={4} pb={Platform.OS === 'ios' ? 90 : 70}>
            {/* Recipe title and info */}
            <VStack space={2}>
              <Heading size="xl" color="coolGray.800">
                {title}
              </Heading>
              
              <HStack space={4} alignItems="center" justifyContent="space-between">
                <HStack space={4} alignItems="center" flexWrap="wrap">
                  <HStack space={1} alignItems="center">
                    <Icon as={Ionicons} name="time-outline" size="sm" color="coolGray.500" />
                    <Text color="coolGray.500">{cookingTime} mins</Text>
                  </HStack>
                  
                  <HStack space={1} alignItems="center">
                    <Icon as={Ionicons} name="people-outline" size="sm" color="coolGray.500" />
                    <Text color="coolGray.500">{portions} portions</Text>
                  </HStack>
                  
                  <Badge 
                    colorScheme={
                      skillLevel === 'beginner' ? 'green' : 
                      skillLevel === 'intermediate' ? 'orange' : 'red'
                    }
                    variant="solid"
                    rounded="full"
                  >
                    {skillLevel}
                  </Badge>
                </HStack>
                
                <Pressable 
                  onPress={handleFavoriteToggle}
                  disabled={isLoading}
                  hitSlop={8}
                >
                  <Icon 
                    as={Ionicons} 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    color={isFavorite ? "red.500" : "coolGray.400"}
                    size="md"
                  />
                </Pressable>
              </HStack>
            </VStack>
            
            <Divider />
            
            {/* Recipe ingredients */}
            <VStack space={2}>
              <Heading size="md" color="coolGray.700">
                Ingredients
              </Heading>
              
              <Box bg="coolGray.50" p={4} rounded="md">
                <VStack space={2}>
                  {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                    <HStack key={index} space={2} alignItems="center">
                      <Icon 
                        as={Ionicons} 
                        name="checkmark-circle" 
                        size="xs" 
                        color="green.500" 
                      />
                      <Text color="coolGray.600">{ingredient}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
            
            {/* Recipe steps */}
            <VStack space={2}>
              <Heading size="md" color="coolGray.700">
                Instructions
              </Heading>
              
              <Accordion 
                allowToggle 
                index={openIndex} 
                onChange={(index) => setOpenIndex(index)}
              >
                {recipe.steps.map((step, index) => (
                  <Accordion.Item key={index}>
                    <Accordion.Summary>
                      <HStack space={2} alignItems="center" justifyContent="space-between" width="100%">
                        <HStack space={2} alignItems="center" flex={1}>
                          <Box 
                            bg={getSkillColor(skillLevel)} 
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
          </VStack>
        </ScrollView>
      </Box>
    </NativeBaseProvider>
  );
};

export default RecipeDetailScreen;