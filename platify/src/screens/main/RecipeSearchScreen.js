import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box, Text, Heading, VStack, HStack, Icon, Input, Button,
  Spinner, Select, CheckIcon, FormControl, Slider, Badge,
  Pressable, ScrollView, Divider, FlatList, useToast
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
            {recipe.title}
          </Heading>
          
          <Text color="gray.600" numberOfLines={2}>
            {recipe.description}
          </Text>
          
          <HStack space={2} mt={1}>
            <Badge colorScheme="green" variant="subtle" rounded="md">
              {recipe.cooking_time} mins
            </Badge>
            
            <Badge colorScheme="blue" variant="subtle" rounded="md">
              {recipe.portions} portions
            </Badge>
            
            <Badge 
              colorScheme={recipe.skill_level === 'beginner' ? 'green' : recipe.skill_level === 'intermediate' ? 'orange' : 'red'} 
              variant="subtle" 
              rounded="md"
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
    <Box flex={1} bg="#F5F5F5" safeArea>
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <VStack space={4} p={4}>
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
                  <Badge colorScheme="green" rounded="full" variant="solid">
                    {portions}
                  </Badge>
                </HStack>
                <Slider
                  defaultValue={1}
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
                  <FormControl.Label _text={{ fontWeight: "medium" }}>Days for Meal Plan</FormControl.Label>
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
            <Box bg="#F5F5F5" p={4} rounded="lg" mb={4}>
              <FormControl>
                <HStack justifyContent="space-between" alignItems="center" mb={1}>
                  <FormControl.Label _text={{ fontWeight: "medium" }}>Max Cooking Time</FormControl.Label>
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
                    onPress={() => handleRecipePress(item)}
                  />
                ))}
              </Box>
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
