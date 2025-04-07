import AsyncStorage from '@react-native-async-storage/async-storage';
import { ingredientCategories, flattenedIngredients } from '../data/ingredients';

// Keys for AsyncStorage
const CATEGORIES_KEY = 'platify_ingredient_categories';
const INGREDIENTS_KEY = 'platify_ingredients';
const STORAGE_VERSION_KEY = 'platify_ingredients_version';
const CURRENT_VERSION = '1.0.0'; // Increment this when data structure changes

/**
 * Initialize the ingredient data in AsyncStorage
 */
export const initializeIngredientData = async () => {
  try {
    // Check if we already have data and if it's the current version
    const version = await AsyncStorage.getItem(STORAGE_VERSION_KEY);
    
    // If we have the current version, no need to reinitialize
    if (version === CURRENT_VERSION) {
      console.log('Ingredient data already initialized with current version');
      return true;
    }
    
    console.log('Initializing ingredient data in AsyncStorage...');
    
    // Store categories
    await AsyncStorage.setItem(
      CATEGORIES_KEY, 
      JSON.stringify(ingredientCategories)
    );
    
    // Store ingredients
    await AsyncStorage.setItem(
      INGREDIENTS_KEY,
      JSON.stringify(flattenedIngredients)
    );
    
    // Update version
    await AsyncStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION);
    
    console.log('Successfully initialized ingredient data in AsyncStorage');
    return true;
  } catch (error) {
    console.error('Error initializing ingredient data:', error);
    throw error;
  }
};

/**
 * Get all ingredient categories
 */
export const getIngredientCategories = async () => {
  try {
    // Ensure data is initialized
    await initializeIngredientData();
    
    // Get categories from AsyncStorage
    const categoriesJson = await AsyncStorage.getItem(CATEGORIES_KEY);
    if (!categoriesJson) {
      return [];
    }
    
    return JSON.parse(categoriesJson);
  } catch (error) {
    console.error('Error getting ingredient categories:', error);
    return [];
  }
};

/**
 * Get all ingredients
 */
export const getIngredients = async () => {
  try {
    // Ensure data is initialized
    await initializeIngredientData();
    
    // Get ingredients from AsyncStorage
    const ingredientsJson = await AsyncStorage.getItem(INGREDIENTS_KEY);
    if (!ingredientsJson) {
      return [];
    }
    
    return JSON.parse(ingredientsJson);
  } catch (error) {
    console.error('Error getting ingredients:', error);
    return [];
  }
};

/**
 * Get ingredients by category
 */
export const getIngredientsByCategory = async (categoryId) => {
  try {
    const ingredients = await getIngredients();
    return ingredients.filter(ing => ing.category === categoryId);
  } catch (error) {
    console.error('Error getting ingredients by category:', error);
    return [];
  }
};

/**
 * Search ingredients by name
 */
export const searchIngredients = async (query) => {
  try {
    const ingredients = await getIngredients();
    if (!query || query.trim() === '') {
      return ingredients;
    }
    
    const searchTerm = query.toLowerCase().trim();
    return ingredients.filter(ing => 
      ing.name.toLowerCase().includes(searchTerm)
    );
  } catch (error) {
    console.error('Error searching ingredients:', error);
    return [];
  }
};
