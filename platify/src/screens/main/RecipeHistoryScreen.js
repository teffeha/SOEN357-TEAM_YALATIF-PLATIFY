import React, { useEffect, useState, useMemo } from 'react';
import { RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Box, Text, Heading, VStack, HStack, Icon, Button, IconButton,
  FlatList, Badge, Pressable, ScrollView, Spinner, useToast,
  Divider
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getCurrentWeekId } from '../../services/metricsService';

const RecipeHistoryScreen = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentWeekId, setCurrentWeekId] = useState('');
  const navigation = useNavigation();
  const toast = useToast();

  // Get the current week identifier
  const getWeekId = () => {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = now.getDay();
    // Adjust to make Monday day 0
    const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    // Calculate the current date adjusted to the start of the week (Monday)
    const adjustedDate = new Date(now);
    adjustedDate.setDate(now.getDate() - adjustedDayOfWeek);
    // Calculate the week number
    const weekNum = Math.ceil((((adjustedDate - onejan) / 86400000) + onejan.getDay() + 1) / 7);
    // Return in YYYY-WW format
    return `${now.getFullYear()}-${weekNum.toString().padStart(2, '0')}`;
  };

  // Format week identifier for display
  const formatWeekDisplay = (weekId) => {
    if (!weekId) return 'Unknown Week';
    
    const [year, week] = weekId.split('-');
    return `Week ${week}, ${year}`;
  };

  // Group recipes by week
  const groupRecipesByWeek = (recipeList) => {
    // Initialize with current week
    const weekId = getWeekId();
    
    const grouped = {};
    
    recipeList.forEach(recipe => {
      // Extract or assign week ID
      const recipeWeekId = recipe.weekId || weekId;
      
      if (!grouped[recipeWeekId]) {
        grouped[recipeWeekId] = [];
      }
      
      grouped[recipeWeekId].push(recipe);
    });
    
    return grouped;
  };

  const loadRecipeHistory = async () => {
    try {
      setLoading(true);
      const historyJson = await AsyncStorage.getItem('recipeHistory');
      if (historyJson) {
        const historyData = JSON.parse(historyJson);
        
        // Ensure all recipes have a weekId
        const weekId = getWeekId();
        setCurrentWeekId(weekId);
        
        const updatedHistory = historyData.map(recipe => {
          if (!recipe.weekId) {
            // If no weekId, assign based on generatedAt date if available
            if (recipe.generatedAt) {
              const recipeDate = new Date(recipe.generatedAt);
              const recipeDayOfWeek = recipeDate.getDay();
              const recipeAdjustedDayOfWeek = recipeDayOfWeek === 0 ? 6 : recipeDayOfWeek - 1;
              const recipeAdjustedDate = new Date(recipeDate);
              recipeAdjustedDate.setDate(recipeDate.getDate() - recipeAdjustedDayOfWeek);
              const recipeOnejan = new Date(recipeDate.getFullYear(), 0, 1);
              const recipeWeekNum = Math.ceil((((recipeAdjustedDate - recipeOnejan) / 86400000) + recipeOnejan.getDay() + 1) / 7);
              return {
                ...recipe,
                weekId: `${recipeDate.getFullYear()}-${recipeWeekNum.toString().padStart(2, '0')}`
              };
            }
            // Default to current week if no date available
            return {
              ...recipe,
              weekId
            };
          }
          return recipe;
        });
        
        // Save the updated history with weekIds
        await AsyncStorage.setItem('recipeHistory', JSON.stringify(updatedHistory));
        setRecipes(updatedHistory);
      }
    } catch (error) {
      console.error('Error loading recipe history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRecipeHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRecipeHistory();
  };

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  const deleteRecipe = async (indexToDelete) => {
    try {
      const updatedRecipes = recipes.filter((_, index) => index !== indexToDelete);
      setRecipes(updatedRecipes);
      await AsyncStorage.setItem('recipeHistory', JSON.stringify(updatedRecipes));
      
      // Show success message
      toast.show({
        description: "Recipe removed from history",
        placement: "top",
        status: "success",
        duration: 2000
      });
    } catch (error) {
      console.error('Error deleting recipe from history:', error);
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.setItem('recipeHistory', JSON.stringify([]));
      setRecipes([]);
    } catch (error) {
      console.error('Error clearing recipe history:', error);
    }
  };

  const RecipeCard = ({ recipe, index }) => {
    // Prevent event bubbling
    const handleDelete = (e) => {
      e.stopPropagation();
      deleteRecipe(index);
    };
    
    return (
      <Box mb={4} position="relative">
        <Pressable onPress={() => handleRecipePress(recipe)}>
          <Box bg="white" rounded="xl" shadow={2} overflow="hidden">
            <Box p={4}>
              <VStack space={2}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Heading size="md" flex={1} pr={2}>
                    {recipe.title || recipe.name}
                  </Heading>
                  <IconButton
                    icon={<Icon as={Ionicons} name="trash-outline" />}
                    size="sm"
                    colorScheme="red"
                    variant="ghost"
                    onPress={handleDelete}
                    _pressed={{ bg: "red.100" }}
                  />
                </HStack>
                <Text color="gray.600" numberOfLines={2}>
                  {recipe.description}
                </Text>
              </VStack>
              
              <HStack mt={3} space={3} flexWrap="wrap" alignItems="center">
                <HStack space={1} alignItems="center" minWidth="80px">
                  <Icon as={Ionicons} name="time-outline" size="xs" color="gray.500" />
                  <Text fontSize="xs" color="gray.500">
                    {recipe.cooking_time || recipe.time_estimate || '30 min'}
                  </Text>
                </HStack>
                
                <HStack space={1} alignItems="center" minWidth="80px">
                  <Icon as={Ionicons} name="people-outline" size="xs" color="gray.500" />
                  <Text fontSize="xs" color="gray.500">
                    {recipe.portions || recipe.servings || '2'} {(recipe.portions || recipe.servings || 2) === 1 ? 'portion' : 'portions'}
                  </Text>
                </HStack>
                
                <Badge 
                  colorScheme={recipe.skill_level === 'beginner' ? 'green' : recipe.skill_level === 'intermediate' ? 'orange' : 'red'} 
                  variant="solid" 
                  rounded="full"
                  px={2}
                  py={0}
                  _text={{ fontSize: "2xs", fontWeight: "medium" }}
                >
                  {recipe.skill_level}
                </Badge>
                
                {recipe.completed && (
                  <Badge 
                    colorScheme="emerald" 
                    variant="solid" 
                    rounded="full"
                    px={2}
                    py={0}
                    _text={{ fontSize: "2xs", fontWeight: "medium" }}
                  >
                    <HStack space={1} alignItems="center">
                      <Icon as={Ionicons} name="checkmark-circle" size="2xs" color="white" />
                      <Text fontSize="2xs" color="white" fontWeight="medium">Completed</Text>
                    </HStack>
                  </Badge>
                )}
              </HStack>
              
              {recipe.generatedAt && (
                <Text fontSize="xs" color="gray.400" mt={2}>
                  Generated: {new Date(recipe.generatedAt).toLocaleString()}
                </Text>
              )}
            </Box>
          </Box>
        </Pressable>
      </Box>
    );
  };

  const groupedRecipes = useMemo(() => {
    return groupRecipesByWeek(recipes);
  }, [recipes]);

  return (
    <Box flex={1} bg="#F5F5F5" safeArea>
      <Box px={4} py={4} bg="white">
        <HStack justifyContent="space-between" alignItems="center">
          <Heading size="lg">Recipe History</Heading>
          <Button 
            leftIcon={<Icon as={Ionicons} name="trash-outline" />}
            colorScheme="red" 
            variant="ghost" 
            onPress={clearHistory}
          >
            Clear
          </Button>
        </HStack>
      </Box>

      {loading && !refreshing ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner size="lg" color="green.500" />
          <Text mt={2} color="gray.500">Loading recipe history...</Text>
        </Box>
      ) : (
        <ScrollView 
          flex={1} 
          px={4} 
          pt={4}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {Object.keys(groupedRecipes).length > 0 ? (
            Object.keys(groupedRecipes).map((weekId, index) => (
              <Box key={index}>
                <Heading size="md" mb={2}>{formatWeekDisplay(weekId)}</Heading>
                <Divider mb={4} />
                {groupedRecipes[weekId].map((recipe, recipeIndex) => (
                  <RecipeCard key={recipeIndex} recipe={recipe} index={recipeIndex} />
                ))}
              </Box>
            ))
          ) : (
            <Box flex={1} justifyContent="center" alignItems="center" mt={10}>
              <Icon as={Ionicons} name="book-outline" size="5xl" color="gray.300" />
              <Text mt={4} fontSize="lg" color="gray.500">No recipe history found</Text>
              <Text mt={1} color="gray.400" textAlign="center">
                Generate recipes in the search tab to see them here
              </Text>
            </Box>
          )}
        </ScrollView>
      )}
    </Box>
  );
};

export default RecipeHistoryScreen;
