import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Text, Heading, VStack, HStack, Icon, Input, Button,
  Spinner, Select, CheckIcon, FormControl, Slider, Badge,
  Pressable, ScrollView, Divider, FlatList, useToast, Center
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { fetchIngredients } from '../../store/slices/ingredientSlice';
import { fetchRecipes, clearRecipes } from '../../store/slices/recipeSlice';
import {
  addIngredient, removeIngredient, clearSelectedIngredients
} from '../../store/slices/ingredientSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // Handle potentially undefined recipe data
  const skillLevel = recipe?.skill_level || 'beginner';
  const recipeName = recipe?.name || recipe?.title || "Delicious Recipe";
  const recipeDescription = recipe?.description || `A delicious recipe with ${recipe?.steps ? recipe?.steps.length : 0} steps`;
  const cookingTime = recipe?.cooking_time || recipe?.time_estimate || "15 mins";
  const recipePortions = recipe?.portions || "4";
  
  return (
    <Pressable onPress={onPress}>
      <Box 
        bg="darkCard" 
        _light={{ bg: "white" }}
        rounded="lg" 
        shadow={2} 
        p={4} 
        m={2}
        borderLeftWidth={4}
        borderLeftColor={getSkillColor(skillLevel)}
      >
        <VStack space={2}>
          <Heading size="md" color="darkText" _light={{ color: "coolGray.800" }}>
            {recipeName}
          </Heading>
          
          <Text color="darkSubtext" _light={{ color: "coolGray.600" }} numberOfLines={2}>
            {recipeDescription}
          </Text>
          
          <HStack space={2} mt={1}>
            <Badge colorScheme="green" variant="subtle" rounded="md">
              {cookingTime}
            </Badge>
            
            <Badge colorScheme="blue" variant="subtle" rounded="md">
              {recipePortions} portions
            </Badge>
            
            <Badge 
              colorScheme={skillLevel === 'beginner' ? 'green' : skillLevel === 'intermediate' ? 'orange' : 'red'} 
              variant="subtle" 
              rounded="md"
            >
              {skillLevel}
            </Badge>
          </HStack>
        </VStack>
      </Box>
    </Pressable>
  );
};

// Sample ingredient categories for when they're not available from the API
const SAMPLE_CATEGORIES = [
  { id: 'vegetables', name: 'Vegetables' },
  { id: 'fruits', name: 'Fruits' },
  { id: 'proteins', name: 'Proteins' },
  { id: 'dairy', name: 'Dairy' },
  { id: 'grains', name: 'Grains' },
  { id: 'legumes', name: 'Legumes' },
  { id: 'herbs_spices', name: 'Herbs & Spices' },
  { id: 'sauces_condiments', name: 'Sauces & Condiments' }
];

// Function to initialize ingredient data in AsyncStorage
const initializeIngredientData = async () => {
  try {
    // Check if we already have ingredients in AsyncStorage
    const storedIngredients = await AsyncStorage.getItem('ingredients');
    if (!storedIngredients) {
      console.log('No ingredients found in AsyncStorage, initializing with sample data');
      // Store sample categories
      await AsyncStorage.setItem('categories', JSON.stringify(SAMPLE_CATEGORIES));
    }
    return true;
  } catch (error) {
    console.error('Error initializing ingredient data:', error);
    return false;
  }
};

// Function to fetch ingredient categories
const fetchIngredientCategories = () => {
  return async (dispatch) => {
    try {
      // Try to get categories from AsyncStorage
      const storedCategories = await AsyncStorage.getItem('categories');
      const categories = storedCategories ? JSON.parse(storedCategories) : SAMPLE_CATEGORIES;
      
      return dispatch({
        type: 'ingredients/setCategories',
        payload: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      return dispatch({
        type: 'ingredients/setCategories',
        payload: SAMPLE_CATEGORIES
      });
    }
  };
};

// Action creators for category management
const setSelectedCategory = (category) => ({
  type: 'ingredients/setSelectedCategory',
  payload: category
});

const clearSelectedCategory = () => ({
  type: 'ingredients/clearSelectedCategory'
});

// Main Screen Component
const RecipeSearchScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { ingredients, selectedIngredients } = useSelector((state) => state.ingredients);
  const { recipes, isLoading } = useSelector((state) => state.recipes);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [portions, setPortions] = useState(1);
  const [days, setDays] = useState(1);
  const [diet, setDiet] = useState('');
  const [skill, setSkill] = useState('beginner');
  const [allergies, setAllergies] = useState([]);
  const [cookingTime, setCookingTime] = useState(60);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [showCategoryView, setShowCategoryView] = useState(true);
  const [categories, setCategories] = useState(SAMPLE_CATEGORIES);
  const [selectedCategory, setSelectedCategoryState] = useState(null);
  
  // Initialize and fetch ingredients
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize ingredient data in AsyncStorage
        await initializeIngredientData();
        
        // Fetch ingredients
        await dispatch(fetchIngredients());
        
        // Get categories from AsyncStorage
        const storedCategories = await AsyncStorage.getItem('categories');
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        }
        
        // Always add sample ingredients for demo purposes
        console.log('Adding sample ingredients for demo');
        const sampleIngredients = [
          { id: 'chicken', name: 'Chicken', category: 'proteins' },
          { id: 'beef', name: 'Beef', category: 'proteins' },
          { id: 'salmon', name: 'Salmon', category: 'proteins' },
          { id: 'rice', name: 'Rice', category: 'grains' },
          { id: 'pasta', name: 'Pasta', category: 'grains' },
          { id: 'potato', name: 'Potato', category: 'vegetables' },
          { id: 'carrot', name: 'Carrot', category: 'vegetables' },
          { id: 'onion', name: 'Onion', category: 'vegetables' },
          { id: 'tomato', name: 'Tomato', category: 'vegetables' },
          { id: 'apple', name: 'Apple', category: 'fruits' },
          { id: 'banana', name: 'Banana', category: 'fruits' },
          { id: 'milk', name: 'Milk', category: 'dairy' },
          { id: 'cheese', name: 'Cheese', category: 'dairy' },
          { id: 'yogurt', name: 'Yogurt', category: 'dairy' },
          { id: 'beans', name: 'Beans', category: 'legumes' },
          { id: 'lentils', name: 'Lentils', category: 'legumes' },
          { id: 'basil', name: 'Basil', category: 'herbs_spices' },
          { id: 'oregano', name: 'Oregano', category: 'herbs_spices' },
          { id: 'ketchup', name: 'Ketchup', category: 'sauces_condiments' },
          { id: 'mayonnaise', name: 'Mayonnaise', category: 'sauces_condiments' }
        ];
        
        // Store sample ingredients in AsyncStorage
        await AsyncStorage.setItem('ingredients', JSON.stringify(sampleIngredients));
        
        // Update state with sample ingredients
        dispatch({ type: 'ingredients/setIngredients', payload: sampleIngredients });
        
        // Show success toast
        toast.show({
          description: "Ingredients loaded successfully",
          status: "success",
          duration: 2000
        });
      } catch (error) {
        console.error('Error loading data:', error);
        toast.show({
          description: "Error loading ingredients",
          status: "error",
          duration: 3000
        });
      }
    };
    
    fetchData();
    
    return () => {
      dispatch(clearRecipes());
    };
  }, [dispatch, toast]);
  
  // Filter ingredients based on search or category
  useEffect(() => {
    try {
      // Log the current state for debugging
      console.log('Search query:', searchQuery);
      console.log('Selected category:', selectedCategory);
      console.log('Total ingredients available:', ingredients?.length || 0);
      
      // Always work with uniqueIngredients to avoid issues with invalid data
      if (searchQuery.trim() !== '') {
        // For search, show all ingredients that match the query regardless of category
        const filtered = uniqueIngredients.filter(
          ing => ing && ing.name && ing.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        console.log(`Found ${filtered.length} ingredients matching "${searchQuery}"`);
        
        // If no results found, show some default ingredients
        if (filtered.length === 0 && uniqueIngredients.length > 0) {
          console.log('No exact matches, showing some default ingredients');
          setFilteredIngredients(uniqueIngredients.slice(0, 6));
        } else {
          setFilteredIngredients(filtered);
        }
        
        setShowCategoryView(false);
      } else if (selectedCategory) {
        // For category selection, filter by category
        const filtered = uniqueIngredients.filter(
          ing => ing && ing.category === selectedCategory.id
        );
        console.log(`Found ${filtered.length} ingredients in category "${selectedCategory.name}"`);
        setFilteredIngredients(filtered);
        setShowCategoryView(false);
      } else {
        setFilteredIngredients([]);
        setShowCategoryView(true);
      }
    } catch (error) {
      console.error('Error filtering ingredients:', error);
      // Provide fallback behavior
      setFilteredIngredients([]);
      setShowCategoryView(true);
    }
  }, [searchQuery, uniqueIngredients, selectedCategory]);
  
  // Ensure categories have unique IDs
  const uniqueCategories = categories ? categories.reduce((acc, current) => {
    if (!current || !current.id) return acc;
    
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []) : SAMPLE_CATEGORIES;
  
  // Ensure ingredients have unique IDs and valid data
  const uniqueIngredients = ingredients ? ingredients.reduce((acc, current) => {
    // Skip invalid ingredients
    if (!current || !current.id || !current.name) return acc;
    
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      // Add category if missing
      const updatedIngredient = {...current};
      if (!updatedIngredient.category) {
        updatedIngredient.category = 'other';
      }
      return acc.concat([updatedIngredient]);
    } else {
      return acc;
    }
  }, []) : [];
  
  // Debug ingredients
  useEffect(() => {
    console.log(`Total ingredients: ${ingredients.length}, Unique ingredients: ${uniqueIngredients.length}`);
    if (ingredients.length > 0 && ingredients.length < 5) {
      console.log('Sample ingredients:', JSON.stringify(ingredients.slice(0, 3)));
    }
  }, [ingredients, uniqueIngredients]);
  
  // Handler functions
  const handleCategorySelect = (category) => {
    setSelectedCategoryState(category);
    const filtered = uniqueIngredients.filter(
      ing => ing.category === category.id
    );
    setFilteredIngredients(filtered);
    setShowCategoryView(false);
  };
  
  const handleBackToCategories = () => {
    setSearchQuery('');
    setSelectedCategoryState(null);
    setShowCategoryView(true);
    setFilteredIngredients([]);
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
    // If no ingredients are selected, use some default ingredients for demo purposes
    if (selectedIngredients.length === 0) {
      const defaultIngredients = ['chicken', 'rice', 'carrot'];
      const recipeParams = {
        ingredients: defaultIngredients,
        portions,
        days,
        diet: diet || undefined,
        skill,
        allergies,
        maxCookingTime: cookingTime
      };
      
      console.log('Using default ingredients for search:', defaultIngredients);
      toast.show({
        description: "Using default ingredients for search",
        placement: "top",
        status: "info",
        duration: 2000
      });
      
      dispatch(fetchRecipes(recipeParams));
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
    
    // Show loading toast
    toast.show({
      description: "Searching for recipes...",
      placement: "top",
      duration: 2000
    });
    
    console.log('Searching with params:', recipeParams);
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
    <Box flex={1} bg="darkBg" _light={{ bg: "gray.50" }} safeArea>
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <VStack space={4} p={4}>
          {/* Header */}
          <Heading size="lg" color="darkText" _light={{ color: "coolGray.800" }}>Find Recipes</Heading>
          
          {/* Ingredient Selection */}
          <Box bg="darkCard" _light={{ bg: "white" }} p={4} rounded="xl" shadow={1}>
            {/* Search Bar */}
            <Input
              placeholder="Search ingredients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              mb={4}
              size="lg"
              borderRadius="full"
              bg="darkBg"
              color="darkText"
              placeholderTextColor="darkSubtext"
              borderColor="transparent"
              shadow={1}
              padding={2}
              _light={{ 
                bg: "white", 
                color: "coolGray.800",
                placeholderTextColor: "coolGray.400" 
              }}
              InputLeftElement={
                <Icon 
                  as={Ionicons} 
                  name="search" 
                  size="sm" 
                  color="darkSubtext" 
                  _light={{ color: "gray.400" }} 
                  ml={3} 
                />
              }
              InputRightElement={
                <HStack space={2} mr={3}>
                  {(searchQuery || selectedCategory) ? (
                    <Pressable onPress={handleBackToCategories}>
                      <Icon 
                        as={Ionicons} 
                        name="close-circle" 
                        size="sm" 
                        color="darkSubtext" 
                        _light={{ color: "gray.400" }} 
                      />
                    </Pressable>
                  ) : null}
                  <Pressable onPress={() => dispatch(fetchIngredients())}>
                    <Icon 
                      as={Ionicons} 
                      name="refresh-outline" 
                      size="sm" 
                      color="darkSubtext" 
                      _light={{ color: "gray.400" }} 
                    />
                  </Pressable>
                </HStack>
              }
            />
            
            {/* Category or Ingredient View */}
            {showCategoryView ? (
              <Box>
                <Heading size="sm" mb={3} color="darkText" _light={{ color: "coolGray.800" }}>Categories</Heading>
                <Box flexDirection="row" flexWrap="wrap" rounded="full">
                  {uniqueCategories.map(item => (
                    <Box key={item.id} width="50%" p={1}>
                    <Pressable 
                      onPress={() => handleCategorySelect(item)}
                      bg="darkBg"
                      _light={{ bg: "coolGray.50" }}
                      p={3}
                      m={1}
                      flex={1}
                      rounded="full"
                      alignItems="center"
                      justifyContent="center"
                      height={24}
                      shadow={1}
                    >
                      <HStack space={2} alignItems="center">
                        <Icon 
                          as={Ionicons} 
                          name={getCategoryIcon(item.id)} 
                          size="sm" 
                          color="darkSubtext"
                          _light={{ color: "coolGray.600" }}
                        />
                        <Text color="darkText" _light={{ color: "coolGray.800" }} fontWeight="medium">
                          {item.name}
                        </Text>
                      </HStack>
                    </Pressable>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box>
                {/* Ingredient List Header */}
                <HStack justifyContent="space-between" alignItems="center" mb={3}>
                  <Heading size="sm" color="darkText" _light={{ color: "coolGray.800" }}>
                    {selectedCategory ? selectedCategory.name : searchQuery ? `Results for "${searchQuery}"` : 'Search Results'}
                  </Heading>
                  <Button 
                    size="xs" 
                    variant="ghost" 
                    colorScheme="blue"
                    leftIcon={<Icon as={Ionicons} name="arrow-back-outline" size="xs" />} 
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
                        bg="darkBg"
                        _light={{ bg: "coolGray.50" }}
                        p={3}
                        m={1}
                        flex={1}
                        rounded="full"
                        alignItems="center"
                        shadow={1}
                      >
                        <Text fontWeight="medium" color="darkText" _light={{ color: "coolGray.800" }}>{item.name}</Text>
                      </Pressable>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <VStack space={4} alignItems="center" py={4}>
                    <Icon as={Ionicons} name="search-outline" size="xl" color="darkSubtext" _light={{ color: "muted.500" }} />
                    <Text color="darkSubtext" _light={{ color: "muted.500" }} textAlign="center">No ingredients found</Text>
                    <Button
                      size="sm"
                      colorScheme="green"
                      rounded="full"
                      leftIcon={<Icon as={Ionicons} name="refresh-outline" size="xs" />}
                      onPress={() => dispatch(fetchIngredients())}
                    >
                      Refresh Ingredients
                    </Button>
                  </VStack>
                )}
              </Box>
            )}
            
            {/* Selected Ingredients */}
            <Box mt={6}>
              <HStack justifyContent="space-between" alignItems="center" mb={2}>
                <Heading size="sm" color="darkText" _light={{ color: "coolGray.800" }}>Selected Ingredients</Heading>
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
                  <Text color="darkSubtext" _light={{ color: "muted.500" }} py={2}>No ingredients selected</Text>
                )}
              </HStack>
            </Box>
          </Box>
          
          {/* Recipe Options */}
          <Box bg="darkCard" _light={{ bg: "white" }} p={5} rounded="xl" shadow={2} mb={4}>
            <HStack justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="sm" color="darkText" _light={{ color: "coolGray.800" }}>Recipe Options</Heading>
              <Icon as={Ionicons} name="options-outline" size="sm" color="green.500" />
            </HStack>
            
            {/* Portions and Days */}
            <Box bg="darkBg" _light={{ bg: "coolGray.50" }} p={4} rounded="lg" mb={4}>
              <FormControl mb={5}>
                <HStack justifyContent="space-between" alignItems="center" mb={1}>
                  <FormControl.Label _text={{ fontWeight: "medium", color: "darkText", _light: { color: "coolGray.800" } }}>Portions</FormControl.Label>
                  <Badge colorScheme="green" rounded="full" variant="solid">
                    {portions}
                  </Badge>
                </HStack>
                <Slider
                  defaultValue={4}
                  minValue={1}
                  maxValue={10}
                  step={1}
                  onChange={v => setPortions(v)}
                  colorScheme="green"
                >
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb shadow={2} />
                </Slider>
              </FormControl>
              
              <FormControl>
                <HStack justifyContent="space-between" alignItems="center" mb={1}>
                  <FormControl.Label _text={{ fontWeight: "medium", color: "darkText", _light: { color: "coolGray.800" } }}>Days for Meal Plan</FormControl.Label>
                  <Badge colorScheme="green" rounded="full" variant="solid">
                    {days}
                  </Badge>
                </HStack>
                <Slider
                  defaultValue={1}
                  minValue={1}
                  maxValue={7}
                  step={1}
                  onChange={v => setDays(v)}
                  colorScheme="green"
                >
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb shadow={2} />
                </Slider>
              </FormControl>
            </Box>
            
            {/* Max Cooking Time */}
            <Box bg="darkBg" _light={{ bg: "coolGray.50" }} p={4} rounded="lg" mb={4}>
              <FormControl>
                <HStack justifyContent="space-between" alignItems="center" mb={1}>
                  <FormControl.Label _text={{ fontWeight: "medium", color: "darkText", _light: { color: "coolGray.800" } }}>Max Cooking Time</FormControl.Label>
                  <Badge colorScheme="green" rounded="full" variant="solid">
                    {cookingTime} min
                  </Badge>
                </HStack>
                <Slider
                  defaultValue={60}
                  minValue={15}
                  maxValue={180}
                  step={15}
                  onChange={v => setCookingTime(v)}
                  colorScheme="green"
                >
                  <Slider.Track>
                    <Slider.FilledTrack />
                  </Slider.Track>
                  <Slider.Thumb shadow={2} />
                </Slider>
              </FormControl>
            </Box>
            
            {/* Diet and Skill Level */}
            <Box bg="darkBg" _light={{ bg: "coolGray.50" }} p={4} rounded="lg" mb={4}>
              <HStack space={4}>
                <FormControl flex={1}>
                  <FormControl.Label _text={{ fontWeight: "medium", color: "darkText", _light: { color: "coolGray.800" } }}>Diet</FormControl.Label>
                  <Select
                    selectedValue={diet}
                    accessibilityLabel="Diet"
                    placeholder="Select diet"
                    rounded="lg"
                    _selectedItem={{
                      bg: "green.100",
                      endIcon: <CheckIcon size="5" />
                    }}
                    onValueChange={itemValue => setDiet(itemValue)}
                    dropdownIcon={<Icon as={Ionicons} name="chevron-down" size="sm" mr={2} />}
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
                  <FormControl.Label _text={{ fontWeight: "medium", color: "darkText", _light: { color: "coolGray.800" } }}>Skill Level</FormControl.Label>
                  <Select
                    selectedValue={skill}
                    accessibilityLabel="Skill"
                    placeholder="Select skill"
                    rounded="lg"
                    _selectedItem={{
                      bg: "green.100",
                      endIcon: <CheckIcon size="5" />
                    }}
                    onValueChange={itemValue => setSkill(itemValue)}
                    dropdownIcon={<Icon as={Ionicons} name="chevron-down" size="sm" mr={2} />}
                  >
                    <Select.Item label="Beginner" value="beginner" />
                    <Select.Item label="Intermediate" value="intermediate" />
                    <Select.Item label="Advanced" value="advanced" />
                  </Select>
                </FormControl>
              </HStack>
            </Box>
            
            {/* Allergies and Restrictions */}
            <Box bg="darkBg" _light={{ bg: "coolGray.50" }} p={4} rounded="lg">
              <FormControl>
                <FormControl.Label _text={{ fontWeight: "medium", color: "darkText", _light: { color: "coolGray.800" } }}>Allergies & Restrictions</FormControl.Label>
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
                        _text={{ fontSize: 'xs', color: allergies.includes(item.id) ? "white" : "darkText", _light: { color: allergies.includes(item.id) ? "white" : "coolGray.800" } }}
                        startIcon={
                          allergies.includes(item.id) ? 
                          <Icon as={Ionicons} name="close-circle" size="xs" mr={1} color="white" /> : 
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
            rounded="full"
            shadow={2}
            onPress={handleSearch}
            isLoading={isLoading}
            isLoadingText="Searching"
            leftIcon={<Icon as={Ionicons} name="search" />}
            mb={4}
          >
            Find Recipes
          </Button>
          
          {/* Recipe Results */}
          {recipes && recipes.length > 0 && (
            <Box>
              <Heading size="md" mb={3} color="darkText" _light={{ color: "coolGray.800" }}>Recipe Results</Heading>
              <Box>
                {recipes.map((item, index) => (
                  <RecipeCard
                    key={`recipe-${index}-${(item && (item.name || item.title)) || index}`}
                    recipe={item}
                    onPress={() => handleRecipePress(item)}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <Center p={4}>
              <Spinner size="lg" color="green.500" />
              <Text mt={2} color="darkSubtext" _light={{ color: "coolGray.600" }}>Generating recipes...</Text>
            </Center>
          )}
          
          {/* No Results State */}
          {!isLoading && recipes.length === 0 && selectedIngredients.length > 0 && (
            <Box bg="darkCard" _light={{ bg: "white" }} p={5} rounded="xl" shadow={1} mb={4} alignItems="center">
              <Icon as={Ionicons} name="search-outline" size="xl" color="coolGray.400" mb={2} />
              <Text color="darkSubtext" _light={{ color: "coolGray.600" }} textAlign="center">No recipes found. Try different ingredients or settings.</Text>
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