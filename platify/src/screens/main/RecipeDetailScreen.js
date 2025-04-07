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

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipe } = route.params;
  const dispatch = useDispatch();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const { favoriteRecipes, isLoading } = useSelector((state) => state.recipes);
  
  // Check if recipe is already in favorites
  const isFavorite = favoriteRecipes.some(fav => 
    fav.name === recipe.name && 
    JSON.stringify(fav.steps) === JSON.stringify(recipe.steps)
  );
  
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
      <Box flex={1} bg="darkBg" _light={{ bg: "white" }} safeArea>
        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack space={4} p={4}>
            {/* Header with back button and favorite icon */}
            <HStack justifyContent="space-between" alignItems="center">
              <IconButton
                icon={<Icon as={Ionicons} name="arrow-back" />}
                onPress={() => navigation.goBack()}
                borderRadius="full"
                _icon={{ color: "darkText" }}
                _pressed={{ bg: "darkPressed" }}
                _light={{ 
                  _icon: { color: "coolGray.700" },
                  _pressed: { bg: "coolGray.100" }
                }}
              />
              <IconButton
                icon={
                  <Icon 
                    as={Ionicons} 
                    name={isFavorite ? "heart" : "heart-outline"} 
                    color={isFavorite ? "red.500" : "darkSubtext"}
                    _light={{ color: isFavorite ? "red.500" : "coolGray.400" }}
                  />
                }
                onPress={handleFavoriteToggle}
                isLoading={isLoading}
                borderRadius="full"
                _pressed={{ bg: "darkPressed" }}
                _light={{ _pressed: { bg: "coolGray.100" } }}
              />
            </HStack>
            
            {/* Recipe title and info */}
            <VStack space={2}>
              <Heading size="xl" color="darkText" _light={{ color: "coolGray.800" }}>
                {recipe.name}
              </Heading>
              
              <HStack space={4} alignItems="center">
                <HStack space={1} alignItems="center">
                  <Icon as={Ionicons} name="time-outline" size="sm" color="darkSubtext" _light={{ color: "coolGray.500" }} />
                  <Text color="darkSubtext" _light={{ color: "coolGray.500" }}>{recipe.time_estimate}</Text>
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
              <Heading size="md" color="darkText" _light={{ color: "coolGray.700" }}>
                Instructions
              </Heading>
              
              <Accordion allowMultiple defaultIndex={[0]}>
                {recipe.steps.map((step, index) => (
                  <Accordion.Item key={index}>
                    <Accordion.Summary>
                      <HStack space={2} alignItems="center">
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
                        <Text fontWeight="medium" flex={1} color="darkText" _light={{ color: "gray.800" }}>
                          Step {index + 1}
                        </Text>
                      </HStack>
                      <Accordion.Icon />
                    </Accordion.Summary>
                    <Accordion.Details>
                      <Text ml={8} color="darkSubtext" _light={{ color: "coolGray.600" }}>
                        {step}
                      </Text>
                    </Accordion.Details>
                  </Accordion.Item>
                ))}
              </Accordion>
            </VStack>
            
            {/* Tips section */}
            <VStack space={2} bg="darkCard" _light={{ bg: "coolGray.50" }} p={4} rounded="md">
              <HStack space={2} alignItems="center">
                <Icon as={Ionicons} name="bulb-outline" color="amber.400" _light={{ color: "amber.500" }} />
                <Text fontWeight="bold" color="darkText" _light={{ color: "coolGray.700" }}>
                  Tips
                </Text>
              </HStack>
              <Text color="darkSubtext" _light={{ color: "coolGray.600" }}>
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
