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

  // Ensure recipe properties exist with fallbacks
  const title = recipe.title || recipe.name || "Untitled Recipe";
  const description = recipe.description || "No description available";
  const cookingTime = recipe.cooking_time || recipe.cookingTime || 0;
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
      
        <VStack space={2}>
          <Heading size="md">

            {recipe.title || recipe.name}
          </Heading>
          
          <Text color="gray.600" numberOfLines={2}>
            {description}
          </Text>

          <HStack space={2} mt={1} flexWrap="nowrap">
            <Badge 
              colorScheme="green" 
              variant="subtle" 
              rounded="md" 
              px={2} 
              minWidth="70px"
              maxWidth="85px"
              _text={{ noOfLines: 1, fontSize: "xs" }}
            >
              {recipe.cooking_time || recipe.time_estimate || '30'} 
            </Badge>
            
            <Badge 
              colorScheme="blue" 
              variant="subtle" 
              rounded="md" 
              px={2}
              minWidth="80px"
              maxWidth="105px"
              _text={{ noOfLines: 1, fontSize: "xs" }}
            >
              {recipe.portions || recipe.servings || '2'} servings
            </Badge>
            
            <Badge 
              colorScheme={skillLevel === 'beginner' ? 'green' : skillLevel === 'intermediate' ? 'orange' : 'red'} 
              variant="subtle" 
              rounded="md"
              px={2}
              minWidth="70px"
              maxWidth="85px"
              _text={{ noOfLines: 1, fontSize: "xs" }}
            >
              {skillLevel}
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
  const [maxCookingTime, setMaxCookingTime] = useState(60);
  const [diet, setDiet] = useState("");
  const [skill, setSkill] = useState("");
  const [allergies, setAllergies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Redux state
  const { 
    ingredients, 
    categories, 
    selectedIngredients, 
    selectedCategory,
    isLoadingIngredients 
  } = useSelector((state) => state.ingredients);
  
  const { recipes, isLoading, error } = useSelector((state) => state.recipes);
  
  // Fetch ingredients and categories on mount
  useEffect(() => {
    const loadData = async () => {
      await initializeIngredientData();
      dispatch(fetchIngredientCategories());
      dispatch(fetchIngredients());
    };
    
    loadData();
    
    // Clear recipes when component unmounts
    return () => {
      dispatch(clearRecipes());
    };
  }, [dispatch]);
  
  // Filter ingredients based on search query and selected category
  const filteredIngredients = ingredients.filter(ingredient => {
    if (!ingredient) return false;
    
    const matchesQuery = searchQuery === "" || 
      ingredient.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "" || 
      (selectedCategory && ingredient.category === selectedCategory.id);
    
    return matchesQuery && matchesCategory;
  });
  
  // Handle search for recipes
  const handleSearch = () => {
    if (selectedIngredients.length === 0) {
      toast.show({
        description: "Please select at least one ingredient",
        placement: "bottom",
        duration: 2000,
        backgroundColor: "coolGray.700",
        _text: { color: "white" },
        borderRadius: "md",
        marginBottom: 4
      });
      return;
    }
    
    dispatch(fetchRecipes({
      ingredients: selectedIngredients.map(ing => ing.name),
      portions,
      days,
      diet: diet || undefined,
      skill: skill || undefined,
      allergies,
      maxCookingTime
    }));
  };
  
  // Handle ingredient selection
  const handleIngredientPress = (ingredient) => {
    const isSelected = selectedIngredients.some(ing => ing.id === ingredient.id);
    
    if (isSelected) {
      dispatch(removeIngredient(ingredient));
    } else {
      dispatch(addIngredient(ingredient));
    }
  };
  
  // Handle allergy toggle
  const handleAllergyToggle = (allergy) => {
    if (allergies.includes(allergy)) {
      setAllergies(allergies.filter(a => a !== allergy));
    } else {
      setAllergies([...allergies, allergy]);
    }
  };
  
  // Render ingredient item
  const renderIngredientItem = ({ item }) => {
    const isSelected = selectedIngredients.some(ing => ing.id === item.id);
    
    return (
      <Pressable 
        onPress={() => handleIngredientPress(item)}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.8 : 1,
          }
        ]}
      >
        <Box 
          bg={isSelected ? "primary.100" : "coolGray.100"} 
          p={2} 
          m={1}
          rounded="md"
          borderWidth={1}
          borderColor={isSelected ? "primary.500" : "transparent"}
        >
          <HStack space={2} alignItems="center">
            <Icon 
              as={Ionicons} 
              name={isSelected ? "checkmark-circle" : "add-circle-outline"} 
              color={isSelected ? "primary.500" : "coolGray.400"}
              size="sm"
            />
            <Text color={isSelected ? "primary.700" : "coolGray.800"}>
              {item.name}
            </Text>
          </HStack>
        </Box>
      </Pressable>
    );
  };
  
  return (
    <Box flex={1} bg="white" safeArea>
      <VStack space={4} p={4} flex={1}>
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
                  placement: "bottom",
                  duration: 2000,
                  backgroundColor: "coolGray.700",
                  _text: { color: "white" },
                  borderRadius: "md",
                  marginBottom: 4
                });
                await refreshIngredients();
                await dispatch(fetchIngredientCategories()).unwrap();
                await dispatch(fetchIngredients()).unwrap();
                toast.show({
                  description: "Ingredients refreshed",
                  placement: "bottom",
                  duration: 2000,
                  backgroundColor: "coolGray.700",
                  _text: { color: "white" },
                  borderRadius: "md",
                  marginBottom: 4
                });
              } catch (error) {
                console.error('Error refreshing ingredients:', error);
                toast.show({
                  description: "Failed to refresh ingredients",
                  placement: "bottom",
                  duration: 3000,
                  backgroundColor: "coolGray.700",
                  _text: { color: "white" },
                  borderRadius: "md",
                  marginBottom: 4
                });
              }
            }}
          >
            Refresh
          </Button>
        </HStack>
        
        {/* Main Content */}
        <Box flex={1}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            nestedScrollEnabled={true}
          >
            {/* Ingredient Selection */}
            <Box bg="white" p={4} rounded="xl" shadow={1} mb={4}>
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
                    <Pressable onPress={() => {
                      setSearchQuery('');
                      dispatch(clearSelectedCategory());
                    }} mr={3}>
                      <Icon as={Ionicons} name="close-circle" size="sm" color="gray.500" />
                    </Pressable>
                  ) : null
                }
              />
              
              {/* Category or Ingredient View */}
              {!selectedCategory || selectedCategory === "" ? (
                <Box>
                  <Heading size="sm" mb={3}>Categories</Heading>
                  <Box flexDirection="row" flexWrap="wrap" justifyContent="center">
                    {categories && categories.length > 0 ? categories.map((item, index) => (
                      <Box key={item?.id || index} width="45%" p={1}>
                      <Pressable 
                        onPress={() => dispatch(setSelectedCategory(item))}
                        bg="white"
                        p={3}
                        m={1}
                        rounded="lg"
                        shadow={1}
                        borderLeftWidth={3}
                        borderLeftColor="green.500"
                        alignItems="center"
                        justifyContent="center"
                        height={100}
                        width="100%"
                      >
                        <Icon
                          as={Ionicons}
                          name={item?.id === 'vegetables' ? 'leaf' : item?.id === 'fruits' ? 'nutrition' : item?.id === 'proteins' ? 'fitness' : item?.id === 'dairy' ? 'water' : item?.id === 'grains' ? 'grid' : item?.id === 'legumes' ? 'apps' : item?.id === 'herbs_spices' ? 'flower' : item?.id === 'sauces_condiments' ? 'flask' : 'restaurant'}
                          size={6}
                          color="green.600"
                          mb={2}
                        />
                        <Text fontWeight="medium" textAlign="center" numberOfLines={2} isTruncated>{item?.name || 'Category'}</Text>
                      </Pressable>
                      </Box>
                    )) : (
                      <Text color="coolGray.500" italic>No categories available</Text>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box>
                  {/* Ingredient List Header */}
                  <HStack justifyContent="space-between" alignItems="center" mb={3}>
                    <Heading size="sm">
                      {selectedCategory && selectedCategory.name ? selectedCategory.name : 'Ingredients'}
                    </Heading>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      leftIcon={<Icon as={Ionicons} name="arrow-back" />} 
                      onPress={() => {
                        setSearchQuery('');
                        dispatch(clearSelectedCategory());
                      }}
                    >
                      Back
                    </Button>
                  </HStack>
                  
                  {/* Ingredient List */}
                  <Box flexDirection="row" flexWrap="wrap" justifyContent="center">
                    {filteredIngredients && filteredIngredients.length > 0 ? filteredIngredients.map((item, index) => (
                      <Box key={item?.id || index} width="45%" p={1}>
                      <Pressable 
                        onPress={() => handleIngredientPress(item)}
                        bg="white"
                        p={3}
                        m={1}
                        rounded="lg"
                        shadow={1}
                        alignItems="center"
                        justifyContent="center"
                        height={100}
                        width="100%"
                      >
                        <Text fontWeight="medium" textAlign="center" numberOfLines={2} isTruncated mb={2}>{item?.name || 'Ingredient'}</Text>
                        <Button
                          size="xs"
                          colorScheme="green"
                          rounded="full"
                          leftIcon={<Icon as={Ionicons} name="add" size="xs" />}
                          onPress={() => handleIngredientPress(item)}
                        >
                          Add
                        </Button>
                      </Pressable>
                      </Box>
                    )) : (
                      <Text color="coolGray.500" italic p={4}>No ingredients found</Text>
                    )}
                  </Box>
                </Box>
              )}
              
              {/* Selected Ingredients */}
              <Box bg="white" p={4} rounded="lg" shadow={1} mb={4}>
                <HStack justifyContent="space-between" alignItems="center" mb={3}>
                  <Heading size="sm">Selected Ingredients</Heading>
                  {selectedIngredients && selectedIngredients.length > 0 && (
                    <Button 
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onPress={() => dispatch(clearSelectedIngredients())}
                    >
                      Clear All
                    </Button>
                  )}
                </HStack>
                
                {selectedIngredients && selectedIngredients.length > 0 ? (
                  <Box flexDirection="row" flexWrap="wrap" justifyContent="center">
                    {selectedIngredients.map((item, index) => (
                      <Badge
                        key={item?.id || index}
                        colorScheme="green"
                        variant="subtle"
                        rounded="full"
                        m={1}
                        p={1}
                        px={2}
                        endIcon={
                          <Icon
                            as={Ionicons}
                            name="close-circle"
                            size="xs"
                            color="white"
                            ml={1}
                            onPress={() => dispatch(removeIngredient(item))}
                          />
                        }
                      >
                        {item?.name || 'Ingredient'}
                      </Badge>
                    ))}
                  </Box>
                ) : (
                  <Text color="coolGray.500" italic textAlign="center">
                    No ingredients selected. Search and add ingredients above.
                  </Text>
                )}
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
                  <HStack space={2} alignItems="center" justifyContent="space-between">
                    <Button 
                      colorScheme="green" 
                      variant="outline" 
                      size="sm" 
                      rounded="full"
                      onPress={() => setPortions(Math.max(1, portions - 1))}
                      leftIcon={<Icon as={Ionicons} name="remove" size="sm" />}
                      isDisabled={portions <= 1}
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
                
                <FormControl>
                  <HStack justifyContent="space-between" alignItems="center" mb={1}>
                    <FormControl.Label _text={{ fontWeight: "medium" }}>Days for Meal Plan</FormControl.Label>
                  </HStack>
                  <HStack space={2} alignItems="center" justifyContent="space-between">
                    <Button 
                      colorScheme="green" 
                      variant="outline" 
                      size="sm" 
                      rounded="full"
                      onPress={() => setDays(Math.max(1, days - 1))}
                      leftIcon={<Icon as={Ionicons} name="remove" size="sm" />}
                      isDisabled={days <= 1}
                    >
                      Decrease
                    </Button>
                    <Text fontWeight="bold">{days}</Text>
                    <Button 
                      colorScheme="green" 
                      variant="outline" 
                      size="sm" 
                      rounded="full"
                      onPress={() => setDays(Math.min(7, days + 1))}
                      leftIcon={<Icon as={Ionicons} name="add" size="sm" />}
                      isDisabled={days >= 7}
                    >
                      Increase
                    </Button>
                  </HStack>
                </FormControl>
              </Box>
              
              {/* Max Cooking Time */}
              <Box bg="#F5F5F5" p={4} rounded="lg" mb={4}>
                <FormControl>
                  <HStack justifyContent="space-between" alignItems="center" mb={1}>
                    <FormControl.Label _text={{ fontWeight: "medium" }}>Max Cooking Time</FormControl.Label>
                  </HStack>
                  <HStack space={2} alignItems="center" justifyContent="space-between">
                    <Button 
                      colorScheme="green" 
                      variant="outline" 
                      size="sm" 
                      rounded="full"
                      onPress={() => setMaxCookingTime(Math.max(15, maxCookingTime - 15))}
                      leftIcon={<Icon as={Ionicons} name="remove" size="sm" />}
                      isDisabled={maxCookingTime <= 15}
                    >
                      Decrease
                    </Button>
                    <Text fontWeight="bold">{maxCookingTime} min</Text>
                    <Button 
                      colorScheme="green" 
                      variant="outline" 
                      size="sm" 
                      rounded="full"
                      onPress={() => setMaxCookingTime(Math.min(180, maxCookingTime + 15))}
                      leftIcon={<Icon as={Ionicons} name="add" size="sm" />}
                      isDisabled={maxCookingTime >= 180}
                    >
                      Increase
                    </Button>
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
                        onPress={() => handleAllergyToggle(item.id)}
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
              rounded="full"
              shadow={2}
              onPress={handleSearch}
              isDisabled={selectedIngredients.length === 0}
              isLoading={isLoading}
              isLoadingText="Searching"
              leftIcon={<Icon as={Ionicons} name="search" />}
              mb={4}
            >
              Find Recipes
            </Button>
            
            {/* Recipe Results */}
            {recipes.length > 0 && (
              <Box>
                <Heading size="md" mb={3}>Recipe Results</Heading>
                <Box>
                  {recipes.map((item, index) => (
                    <RecipeCard
                      key={`recipe-${index}-${item.name}`}
                      recipe={item}
                      onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </ScrollView>
        </Box>
      </VStack>
    </Box>
  );
};

export default RecipeSearchScreen;
