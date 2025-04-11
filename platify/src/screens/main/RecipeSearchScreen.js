import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateMetrics } from '../../services/metricsService';
import {
  Box, Text, Heading, VStack, HStack, Icon, Input, Button,
  Spinner, Select, CheckIcon, FormControl, Slider, Badge,
  Pressable, ScrollView, Divider, FlatList, useToast, IconButton
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { fetchIngredients, fetchIngredientCategories } from '../../store/slices/ingredientSlice';
import { fetchRecipes, clearRecipes } from '../../store/slices/recipeSlice';
import {
  addIngredient, removeIngredient, clearSelectedIngredients,
  setSelectedCategory, clearSelectedCategory
} from '../../store/slices/ingredientSlice';
import { initializeIngredientData, refreshIngredients } from '../../services/ingredientStorage';

// Recipe Card Component
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

  return (
    <Pressable onPress={onPress}>
      <Box 
        bg="white" 
        rounded="lg" 
        shadow={2} 
        p={4} 
        m={2}
        borderLeftWidth={4}
        borderLeftColor={getSkillColor(recipe.skill_level)}
      >
        <VStack space={2}>
          <Heading size="md">
            {recipe.title || recipe.name}
          </Heading>
          
          <Text color="gray.600" numberOfLines={2}>
            {recipe.description}
          </Text>
          
          <HStack space={3} mt={1} justifyContent="flex-start" alignItems="center">
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
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );
};

// Main Screen Component
const RecipeSearchScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { ingredients, categories, selectedIngredients, selectedCategory } = useSelector((state) => state.ingredients);
  const { recipes, isLoading } = useSelector((state) => state.recipes);
  
  // Save recipes to history and update metrics when recipes are loaded
  useEffect(() => {
    const saveRecipesToHistoryAndUpdateMetrics = async () => {
      if (recipes && recipes.length > 0) {
        try {
          // Get existing history
          const historyJson = await AsyncStorage.getItem('recipeHistory');
          let historyData = [];
          
          if (historyJson) {
            historyData = JSON.parse(historyJson);
          }
          
          // Add all new recipes to history (without duplicate checking)
          // Create a timestamp for this batch of recipes
          const timestamp = new Date().toISOString();
          
          // Add all recipes from this search with the timestamp
          const recipesWithTimestamp = recipes.map(recipe => ({
            ...recipe,
            generatedAt: timestamp
          }));
          
          // Add new recipes to the beginning of history
          const updatedHistory = [...recipesWithTimestamp, ...historyData];
          
          // Keep only the most recent 100 recipes (increased from 50)
          const trimmedHistory = updatedHistory.slice(0, 100);
          
          // Save updated history
          await AsyncStorage.setItem('recipeHistory', JSON.stringify(trimmedHistory));
          
          // Update metrics
          await updateMetrics({
            selectedIngredients,
            recipes
          });
        } catch (error) {
          console.error('Error saving recipes to history or updating metrics:', error);
        }
      }
    };
    
    saveRecipesToHistoryAndUpdateMetrics();
  }, [recipes, selectedIngredients]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [portions, setPortions] = useState(1);
  const [days, setDays] = useState(1);
  const [diet, setDiet] = useState('');
  const [skill, setSkill] = useState('beginner');
  const [allergies, setAllergies] = useState([]);
  const [cookingTime, setCookingTime] = useState(60);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [showCategoryView, setShowCategoryView] = useState(true);
  
  // Initialize and fetch ingredients and categories
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      try {
        // Initialize ingredient data in AsyncStorage
        await initializeIngredientData();
        
        // Fetch categories and ingredients from AsyncStorage only if component is still mounted
        if (isMounted) {
          await dispatch(fetchIngredientCategories()).unwrap();
          await dispatch(fetchIngredients()).unwrap();
        }
      } catch (error) {
        console.error('Error initializing ingredient data:', error);
        if (isMounted) {
          toast.show({
            description: "Error loading ingredients",
            status: "error",
            duration: 3000
          });
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
      dispatch(clearRecipes());
    };
  }, [dispatch, toast]);
  
  // Filter ingredients based on search or category
  useEffect(() => {
    let isMounted = true;
    
    if (searchQuery.trim() !== '') {
      const filtered = uniqueIngredients.filter(
        ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (isMounted) {
        setFilteredIngredients(filtered);
        setShowCategoryView(false);
      }
    } else if (selectedCategory) {
      const filtered = uniqueIngredients.filter(
        ing => ing.category === selectedCategory.id
      );
      if (isMounted) {
        setFilteredIngredients(filtered);
        setShowCategoryView(false);
      }
    } else if (isMounted) {
      setFilteredIngredients([]);
      setShowCategoryView(true);
    }
    
    return () => {
      isMounted = false;
    };
  }, [searchQuery, uniqueIngredients, selectedCategory]);
  
  // Ensure categories have unique IDs
  const uniqueCategories = categories.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  
  // Ensure ingredients have unique IDs
  const uniqueIngredients = ingredients.reduce((acc, current) => {
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
  
  // Handler functions
  const handleCategorySelect = (category) => {
    dispatch(setSelectedCategory(category));
  };
  
  const handleBackToCategories = () => {
    setSearchQuery('');
    dispatch(clearSelectedCategory());
    setShowCategoryView(true);
  };
  
  const handleAddIngredient = (ingredient) => {
    dispatch(addIngredient(ingredient));
    toast.show({
      description: `${ingredient.name} added`,
      placement: "top",
      duration: 1500
    });
  };
  
  const handleRemoveIngredient = (id) => {
    dispatch(removeIngredient(id));
  };
  
  const handleClearIngredients = () => {
    dispatch(clearSelectedIngredients());
  };
  
  const handleSearch = () => {
    if (selectedIngredients.length === 0) {
      toast.show({
        description: "Please select at least one ingredient",
        placement: "top",
        status: "warning",
        duration: 2000
      });
      return;
    }
    
    const recipeParams = {
      ingredients: selectedIngredients.map(ing => ing.name),
      portions,
      days,
      diet: diet || undefined,
      skill,
      allergies,
      maxCookingTime: cookingTime
    };
    
    dispatch(fetchRecipes(recipeParams));
  };
  
  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  // Helper function to get icon for category
  const getCategoryIcon = (categoryId) => {
    switch(categoryId) {
      case 'vegetables': return 'leaf';
      case 'fruits': return 'nutrition';
      case 'proteins': return 'fitness';
      case 'dairy': return 'water';
      case 'grains': return 'grid';
      case 'legumes': return 'apps';
      case 'herbs_spices': return 'flower';
      case 'sauces_condiments': return 'flask';
      default: return 'restaurant';
    }
  };

  return (
    <Box 
      flex={1} 
      bg="#F5F5F5" 
      _ios={{ safeAreaTop: true }}
      _android={{ safeAreaTop: true }}
    >
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <VStack space={4} p={4} pb={0}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center" mb={2}>
            <Heading size="lg">Find Recipes</Heading>
            <Button
              size="sm"
              variant="ghost"
              colorScheme="green"
              leftIcon={<Icon as={Ionicons} name="refresh-outline" size="sm" />}
              onPress={async () => {
                try {
                  toast.show({
                    description: "Refreshing ingredients...",
                    status: "info",
                    duration: 2000
                  });
                  await refreshIngredients();
                  await dispatch(fetchIngredientCategories()).unwrap();
                  await dispatch(fetchIngredients()).unwrap();
                  toast.show({
                    description: "Ingredients refreshed",
                    status: "success",
                    duration: 2000
                  });
                } catch (error) {
                  console.error('Error refreshing ingredients:', error);
                  toast.show({
                    description: "Failed to refresh ingredients",
                    status: "error",
                    duration: 3000
                  });
                }
              }}
            >
              Refresh
            </Button>
          </HStack>
          
          {/* Ingredient Selection */}
          <Box bg="white" p={4} rounded="xl" shadow={1}>
            {/* Search Bar */}
            <Input
              placeholder="Search ingredients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              mb={4}
              size="lg"
              borderRadius="full"
              color="gray.800"
              borderColor="gray.300"
              placeholderTextColor="gray.500"
              InputLeftElement={
                <Icon as={Ionicons} name="search" size="sm" color="gray.500" ml={3} />
              }
              InputRightElement={
                (searchQuery || selectedCategory) ? (
                  <Pressable onPress={handleBackToCategories} mr={3}>
                    <Icon as={Ionicons} name="close-circle" size="sm" color="gray.500" />
                  </Pressable>
                ) : null
              }
            />
            
            {/* Category or Ingredient View */}
            {showCategoryView ? (
              <Box>
                <Heading size="sm" mb={3}>Categories</Heading>
                <Box flexDirection="row" flexWrap="wrap">
                  {uniqueCategories.map(item => (
                    <Box key={item.id} width="50%" p={1}>
                    <Pressable 
                      onPress={() => handleCategorySelect(item)}
                      bg="white"
                      p={3}
                      m={1}
                      flex={1}
                      rounded="lg"
                      alignItems="center"
                      justifyContent="center"
                      height={24}
                      shadow={1}
                    >
                      <Icon
                        as={Ionicons}
                        name={getCategoryIcon(item.id)}
                        size={6}
                        color="green.600"
                        mb={2}
                      />
                      <Text textAlign="center" fontWeight="medium">{item.name}</Text>
                    </Pressable>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box>
                {/* Ingredient List Header */}
                <HStack justifyContent="space-between" alignItems="center" mb={3}>
                  <Heading size="sm">
                    {selectedCategory ? selectedCategory.name : 'Search Results'}
                  </Heading>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    leftIcon={<Icon as={Ionicons} name="arrow-back" />} 
                    onPress={handleBackToCategories}
                  >
                    Back
                  </Button>
                </HStack>
                
                {/* Ingredient List */}
                {filteredIngredients.length > 0 ? (
                  <Box flexDirection="row" flexWrap="wrap">
                    {filteredIngredients.map(item => (
                      <Box key={item.id} width="50%" p={1}>
                      <Pressable 
                        onPress={() => handleAddIngredient(item)}
                        bg="white"
                        p={3}
                        m={1}
                        flex={1}
                        rounded="lg"
                        alignItems="center"
                        shadow={1}
                      >
                        <Text fontWeight="medium" mb={2}>{item.name}</Text>
                        <Button 
                          size="sm" 
                          colorScheme="green"
                          rounded="full"
                          leftIcon={<Icon as={Ionicons} name="add" size="xs" />}
                          onPress={() => handleAddIngredient(item)}
                        >
                          Add
                        </Button>
                      </Pressable>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Text color="gray.500" textAlign="center" py={4}>No ingredients found</Text>
                )}
              </Box>
            )}
            
            {/* Selected Ingredients */}
            <Box mt={6}>
              <HStack justifyContent="space-between" alignItems="center" mb={2}>
                <Heading size="sm">Selected Ingredients</Heading>
                {selectedIngredients.length > 0 && (
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onPress={handleClearIngredients}
                  >
                    Clear All
                  </Button>
                )}
              </HStack>
              
              <HStack flexWrap="wrap">
                {selectedIngredients.length > 0 ? (
                  selectedIngredients.map((item) => (
                    <Badge
                      key={item.id}
                      colorScheme="green"
                      variant="solid"
                      m={1}
                      p={1}
                      px={2}
                      borderRadius="full"
                      _text={{ fontSize: 'xs' }}
                      endIcon={
                        <Icon
                          as={Ionicons}
                          name="close-circle"
                          size="xs"
                          color="white"
                          ml={1}
                          onPress={() => handleRemoveIngredient(item.id)}
                        />
                      }
                    >
                      {item.name}
                    </Badge>
                  ))
                ) : (
                  <Text color="gray.500" py={2}>No ingredients selected</Text>
                )}
              </HStack>
            </Box>
          </Box>
          
          {/* Recipe Options */}
          <Box bg="white" p={5} rounded="xl" shadow={2} mb={4}>
            <HStack justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="sm">Recipe Options</Heading>
              <Icon as={Ionicons} name="options-outline" size="sm" color="green.500" />
            </HStack>
            
            {/* Portions and Days */}
            <Box bg="#F5F5F5" p={4} rounded="lg" mb={4}>
              <FormControl mb={5}>
                <HStack justifyContent="space-between" alignItems="center" mb={1}>
                  <FormControl.Label _text={{ fontWeight: "medium" }}>Portions</FormControl.Label>
                </HStack>
                <HStack space={4} alignItems="center" justifyContent="center">
                  <IconButton
                    icon={<Icon as={Ionicons} name="remove" />}
                    borderRadius="full"
                    bg="green.500"
                    _pressed={{ bg: "green.600" }}
                    size="md"
                    isDisabled={portions <= 1}
                    onPress={() => setPortions(prev => Math.max(1, prev - 1))}
                  />
                  <Badge 
                    colorScheme="green" 
                    rounded="full" 
                    variant="solid"
                    minWidth="40px"
                    py={1}
                  >
                    <Text color="white" fontWeight="bold" fontSize="md" textAlign="center">
                      {portions}
                    </Text>
                  </Badge>
                  <IconButton
                    icon={<Icon as={Ionicons} name="add" />}
                    borderRadius="full"
                    bg="green.500"
                    _pressed={{ bg: "green.600" }}
                    size="md"
                    isDisabled={portions >= 10}
                    onPress={() => setPortions(prev => Math.min(10, prev + 1))}
                  />
                </HStack>
              </FormControl>
              
              <FormControl>
                <HStack justifyContent="space-between" alignItems="center" mb={1}>
                  <FormControl.Label _text={{ fontWeight: "medium" }}>Days for Meal Plan</FormControl.Label>
                </HStack>
                <HStack space={4} alignItems="center" justifyContent="center">
                  <IconButton
                    icon={<Icon as={Ionicons} name="remove" />}
                    borderRadius="full"
                    bg="green.500"
                    _pressed={{ bg: "green.600" }}
                    size="md"
                    isDisabled={days <= 1}
                    onPress={() => setDays(prev => Math.max(1, prev - 1))}
                  />
                  <Badge 
                    colorScheme="green" 
                    rounded="full" 
                    variant="solid"
                    minWidth="40px"
                    py={1}
                  >
                    <Text color="white" fontWeight="bold" fontSize="md" textAlign="center">
                      {days}
                    </Text>
                  </Badge>
                  <IconButton
                    icon={<Icon as={Ionicons} name="add" />}
                    borderRadius="full"
                    bg="green.500"
                    _pressed={{ bg: "green.600" }}
                    size="md"
                    isDisabled={days >= 7}
                    onPress={() => setDays(prev => Math.min(7, prev + 1))}
                  />
                </HStack>
              </FormControl>
            </Box>
            
            {/* Max Cooking Time */}
            <Box bg="#F5F5F5" p={4} rounded="lg" mb={4}>
              <FormControl>
                <HStack justifyContent="space-between" alignItems="center" mb={1}>
                  <FormControl.Label _text={{ fontWeight: "medium" }}>Max Cooking Time</FormControl.Label>
                </HStack>
                <HStack space={4} alignItems="center" justifyContent="center">
                  <IconButton
                    icon={<Icon as={Ionicons} name="remove" />}
                    borderRadius="full"
                    bg="green.500"
                    _pressed={{ bg: "green.600" }}
                    size="md"
                    isDisabled={cookingTime <= 15}
                    onPress={() => setCookingTime(prev => Math.max(15, prev - 15))}
                  />
                  <Badge 
                    colorScheme="green" 
                    rounded="full" 
                    variant="solid"
                    minWidth="60px"
                    py={1}
                  >
                    <Text color="white" fontWeight="bold" fontSize="md" textAlign="center">
                      {cookingTime} min
                    </Text>
                  </Badge>
                  <IconButton
                    icon={<Icon as={Ionicons} name="add" />}
                    borderRadius="full"
                    bg="green.500"
                    _pressed={{ bg: "green.600" }}
                    size="md"
                    isDisabled={cookingTime >= 180}
                    onPress={() => setCookingTime(prev => Math.min(180, prev + 15))}
                  />
                </HStack>
              </FormControl>
            </Box>
            
            {/* Diet and Skill Level */}
            <Box bg="#F5F5F5" p={4} rounded="lg" mb={4}>
              <HStack space={4}>
                <FormControl flex={1}>
                  <FormControl.Label _text={{ fontWeight: "medium" }}>Diet</FormControl.Label>
                  <Select
                    selectedValue={diet}
                    accessibilityLabel="Diet"
                    placeholder="Select diet"
                    rounded="lg"
                    color="gray.800"
                    bg="white"
                    borderColor="gray.300"
                    placeholderTextColor="gray.500"
                    _selectedItem={{
                      bg: "green.100",
                      endIcon: <CheckIcon size="5" />
                    }}
                    onValueChange={itemValue => setDiet(itemValue)}
                    dropdownIcon={<Icon as={Ionicons} name="chevron-down" size="sm" mr={2} color="gray.800" />}
                  >
                    <Select.Item label="None" value="" />
                    <Select.Item label="Vegan" value="vegan" />
                    <Select.Item label="Vegetarian" value="vegetarian" />
                    <Select.Item label="Pescatarian" value="pescatarian" />
                    <Select.Item label="Gluten-Free" value="gluten-free" />
                    <Select.Item label="Dairy-Free" value="dairy-free" />
                    <Select.Item label="Keto" value="keto" />
                    <Select.Item label="Paleo" value="paleo" />
                    <Select.Item label="Low-Carb" value="low-carb" />
                    <Select.Item label="Low-Fat" value="low-fat" />
                    <Select.Item label="Mediterranean" value="mediterranean" />
                  </Select>
                </FormControl>
                
                <FormControl flex={1}>
                  <FormControl.Label _text={{ fontWeight: "medium" }}>Skill Level</FormControl.Label>
                  <Select
                    selectedValue={skill}
                    accessibilityLabel="Skill"
                    placeholder="Select skill"
                    rounded="lg"
                    color="gray.800"
                    bg="white"
                    borderColor="gray.300"
                    placeholderTextColor="gray.500"
                    _selectedItem={{
                      bg: "green.100",
                      endIcon: <CheckIcon size="5" />
                    }}
                    onValueChange={itemValue => setSkill(itemValue)}
                    dropdownIcon={<Icon as={Ionicons} name="chevron-down" size="sm" mr={2} color="gray.800" />}
                  >
                    <Select.Item label="Beginner" value="beginner" />
                    <Select.Item label="Intermediate" value="intermediate" />
                    <Select.Item label="Advanced" value="advanced" />
                  </Select>
                </FormControl>
              </HStack>
            </Box>
            
            {/* Allergies and Restrictions */}
            <Box bg="#F5F5F5" p={4} rounded="lg">
              <FormControl>
                <FormControl.Label _text={{ fontWeight: "medium" }}>Allergies & Restrictions</FormControl.Label>
                <Box flexDirection="row" flexWrap="wrap" mt={2}>
                  {[
                    { id: 'nuts', label: 'Nuts' },
                    { id: 'shellfish', label: 'Shellfish' },
                    { id: 'eggs', label: 'Eggs' },
                    { id: 'soy', label: 'Soy' },
                    { id: 'wheat', label: 'Wheat' },
                    { id: 'fish', label: 'Fish' },
                    { id: 'peanuts', label: 'Peanuts' },
                    { id: 'sesame', label: 'Sesame' }
                  ].map(item => (
                    <Pressable 
                      key={item.id}
                      onPress={() => {
                        if (allergies.includes(item.id)) {
                          setAllergies(allergies.filter(a => a !== item.id));
                        } else {
                          setAllergies([...allergies, item.id]);
                        }
                      }}
                      mb={2}
                      mr={2}
                    >
                      <Badge 
                        colorScheme={allergies.includes(item.id) ? "red" : "gray"}
                        variant={allergies.includes(item.id) ? "solid" : "outline"}
                        rounded="full"
                        px={3}
                        py={1}
                        _text={{ fontSize: 'xs' }}
                        startIcon={
                          allergies.includes(item.id) ? 
                          <Icon as={Ionicons} name="close-circle" size="xs" mr={1} /> : 
                          undefined
                        }
                      >
                        {item.label}
                      </Badge>
                    </Pressable>
                  ))}
                </Box>
              </FormControl>
            </Box>
          </Box>
          
          {/* Search Button */}
          <Button
            size="lg"
            colorScheme="green"
            isLoading={isLoading}
            isLoadingText="Searching"
            leftIcon={<Icon as={Ionicons} name="search" />}
            mb={0}
            onPress={handleSearch}
            isDisabled={selectedIngredients.length === 0}
          >
            Find Recipes
          </Button>
          
          {/* Recipe Results */}
          {recipes.length > 0 && (
            <Box>
              <Heading size="md" mb={2}>
                Generated Recipes
              </Heading>
              
              <FlatList
                data={recipes}
                keyExtractor={(item, index) => `recipe-${index}-${item.name || ''}`}
                renderItem={({ item }) => (
                  <RecipeCard 
                    recipe={item} 
                    onPress={() => handleRecipePress(item)} 
                  />
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 0 }}
                style={{ marginBottom: 0 }}
                scrollEnabled={false}
                nestedScrollEnabled={false}
              />
            </Box>
          )}
        </VStack>
        )}
        keyExtractor={item => item.key}
        showsVerticalScrollIndicator={false}
      />
    </Box>
  );
};

export default RecipeSearchScreen;
