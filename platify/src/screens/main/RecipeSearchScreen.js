import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
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
  Input,
  Button,
  Spinner,
  Select,
  CheckIcon,
  FormControl,
  Slider,
  Badge,
  Pressable,
  ScrollView,
  Divider,
  Chip
} from 'native-base';
import { Ionicons } from '@expo/vector-icons';
import { fetchIngredients } from '../../store/slices/ingredientSlice';
import { fetchRecipes, clearRecipes } from '../../store/slices/recipeSlice';
import { addIngredient, removeIngredient, clearSelectedIngredients } from '../../store/slices/ingredientSlice';

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
        <HStack justifyContent="space-between" alignItems="center">
          <VStack space={1} flex={1}>
            <Text fontSize="md" fontWeight="bold" numberOfLines={1}>
              {recipe.name}
            </Text>
            <HStack space={2} alignItems="center">
              <Icon as={Ionicons} name="time-outline" size="xs" color="gray.500" />
              <Text fontSize="xs" color="gray.500">
                {recipe.time_estimate}
              </Text>
            </HStack>
          </VStack>
          <Badge 
            colorScheme={
              recipe.skill_level === 'beginner' ? 'green' : 
              recipe.skill_level === 'intermediate' ? 'orange' : 'red'
            }
            variant="solid"
            rounded="full"
            _text={{ fontSize: 'xs' }}
          >
            {recipe.skill_level}
          </Badge>
        </HStack>
      </Box>
    </Pressable>
  );
};

const RecipeSearchScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { ingredients, selectedIngredients } = useSelector((state) => state.ingredients);
  const { recipes, isLoading } = useSelector((state) => state.recipes);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [portions, setPortions] = useState(4);
  const [days, setDays] = useState(1);
  const [diet, setDiet] = useState('');
  const [skill, setSkill] = useState('beginner');
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  
  // Fetch ingredients from Firestore on component mount
  useEffect(() => {
    dispatch(fetchIngredients());
    return () => {
      dispatch(clearRecipes());
    };
  }, [dispatch]);
  
  // Filter ingredients based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredIngredients([]);
    } else {
      const filtered = ingredients.filter(
        ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredIngredients(filtered);
    }
  }, [searchQuery, ingredients]);
  
  const handleAddIngredient = (ingredient) => {
    dispatch(addIngredient(ingredient));
    setSearchQuery('');
    setFilteredIngredients([]);
  };
  
  const handleRemoveIngredient = (id) => {
    dispatch(removeIngredient(id));
  };
  
  const handleClearIngredients = () => {
    dispatch(clearSelectedIngredients());
  };
  
  const handleSearch = () => {
    if (selectedIngredients.length === 0) {
      return;
    }
    
    const recipeParams = {
      ingredients: selectedIngredients.map(ing => ing.name),
      portions,
      days,
      diet: diet || undefined,
      skill
    };
    
    dispatch(fetchRecipes(recipeParams));
  };
  
  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetail', { recipe });
  };

  return (
      <Box flex={1} bg="gray.100" safeArea>
        <ScrollView>
          <VStack space={4} p={4}>
            <Heading size="lg" color="coolGray.800">
              Recipe Search
            </Heading>
            
            <FormControl>
              <FormControl.Label>Ingredients</FormControl.Label>
              <Input
                placeholder="Search ingredients..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                InputRightElement={
                  searchQuery ? (
                    <Pressable onPress={() => setSearchQuery('')} mr={2}>
                      <Icon as={Ionicons} name="close-outline" size="sm" color="gray.400" />
                    </Pressable>
                  ) : null
                }
              />
              
              {/* Ingredient search results */}
              {filteredIngredients.length > 0 && (
                <Box
                  bg="white"
                  shadow={2}
                  rounded="md"
                  mt={1}
                  maxH="200"
                >
                  <FlatList
                    data={filteredIngredients}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <Pressable
                        p={3}
                        borderBottomWidth={1}
                        borderBottomColor="gray.200"
                        onPress={() => handleAddIngredient(item)}
                      >
                        <Text>{item.name}</Text>
                      </Pressable>
                    )}
                  />
                </Box>
              )}
              
              {/* Selected ingredients */}
              {selectedIngredients.length > 0 && (
                <Box mt={4}>
                  <HStack justifyContent="space-between" alignItems="center" mb={2}>
                    <Text fontWeight="medium">Selected Ingredients</Text>
                    <Pressable onPress={handleClearIngredients}>
                      <Text color="red.500" fontSize="sm">Clear All</Text>
                    </Pressable>
                  </HStack>
                  <HStack flexWrap="wrap">
                    {selectedIngredients.map((item) => (
                      <Chip
                        key={item.id}
                        m={1}
                        colorScheme="green"
                        onClose={() => handleRemoveIngredient(item.id)}
                      >
                        {item.name}
                      </Chip>
                    ))}
                  </HStack>
                </Box>
              )}
            </FormControl>
            
            <Divider my={2} />
            
            <FormControl>
              <FormControl.Label>Portions ({portions})</FormControl.Label>
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
                <Slider.Thumb />
              </Slider>
            </FormControl>
            
            <FormControl>
              <FormControl.Label>Days for Meal Planning ({days})</FormControl.Label>
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
                <Slider.Thumb />
              </Slider>
            </FormControl>
            
            <FormControl>
              <FormControl.Label>Dietary Restrictions</FormControl.Label>
              <Select
                selectedValue={diet}
                minWidth="200"
                accessibilityLabel="Choose dietary restriction"
                placeholder="Choose dietary restriction"
                _selectedItem={{
                  bg: "green.100",
                  endIcon: <CheckIcon size="5" />
                }}
                onValueChange={itemValue => setDiet(itemValue)}
              >
                <Select.Item label="None" value="" />
                <Select.Item label="Vegan" value="vegan" />
                <Select.Item label="Vegetarian" value="vegetarian" />
                <Select.Item label="Gluten-Free" value="gluten-free" />
                <Select.Item label="Dairy-Free" value="dairy-free" />
                <Select.Item label="Keto" value="keto" />
                <Select.Item label="Paleo" value="paleo" />
              </Select>
            </FormControl>
            
            <FormControl>
              <FormControl.Label>Skill Level</FormControl.Label>
              <Select
                selectedValue={skill}
                minWidth="200"
                accessibilityLabel="Choose skill level"
                placeholder="Choose skill level"
                _selectedItem={{
                  bg: "green.100",
                  endIcon: <CheckIcon size="5" />
                }}
                onValueChange={itemValue => setSkill(itemValue)}
              >
                <Select.Item label="Beginner" value="beginner" />
                <Select.Item label="Intermediate" value="intermediate" />
                <Select.Item label="Advanced" value="advanced" />
              </Select>
            </FormControl>
            
            <Button
              mt={4}
              colorScheme="green"
              onPress={handleSearch}
              isDisabled={selectedIngredients.length === 0}
              isLoading={isLoading}
              isLoadingText="Searching"
            >
              Search Recipes
            </Button>
          </VStack>
          
          {/* Recipe Results */}
          {recipes.length > 0 && (
            <VStack space={2} p={4}>
              <Heading size="md" color="coolGray.800">
                Recipe Results
              </Heading>
              
              {recipes.map((recipe, index) => (
                <RecipeCard
                  key={index}
                  recipe={recipe}
                  onPress={() => handleRecipePress(recipe)}
                />
              ))}
            </VStack>
          )}
          
          {/* Loading state */}
          {isLoading && (
            <Center p={4}>
              <Spinner size="lg" color="green.500" />
              <Text mt={2} color="gray.500">
                Generating recipes...
              </Text>
            </Center>
          )}
        </ScrollView>
      </Box>
  );
};

export default RecipeSearchScreen;
