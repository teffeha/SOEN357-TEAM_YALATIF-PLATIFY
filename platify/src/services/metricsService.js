import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for calculations
const AVERAGE_RECIPE_SEARCH_TIME_MINUTES = 25; // Average time to search for recipes manually
const AVERAGE_FOOD_WASTE_PER_UNUSED_INGREDIENT_GRAMS = 150; // Average food waste per unused ingredient

/**
 * Calculate and update metrics based on app usage
 * @param {Object} params - Parameters for metrics calculation
 * @param {Array} params.selectedIngredients - Ingredients used in recipe generation
 * @param {Array} params.recipes - Recipes generated
 */
export const updateMetrics = async (params) => {
  try {
    const { selectedIngredients, recipes } = params;
    
    // Get current metrics from storage
    const metricsJson = await AsyncStorage.getItem('userMetrics');
    let metrics = {
      timeSaved: 0,
      foodWasteAvoided: 0,
      recipesGenerated: 0,
      recipesCompleted: 0,
      ingredientsUsed: 0,
      lastUpdated: null
    };
    
    if (metricsJson) {
      metrics = JSON.parse(metricsJson);
    }
    
    // Update only the recipes generated count
    // Time saved and food waste avoided are only calculated for completed recipes
    metrics.recipesGenerated += recipes.length;
    metrics.lastUpdated = new Date().toISOString();
    
    // Save updated metrics
    await AsyncStorage.setItem('userMetrics', JSON.stringify(metrics));
    
    return metrics;
  } catch (error) {
    console.error('Error updating metrics:', error);
    return null;
  }
};

/**
 * Mark a recipe as completed and update metrics accordingly
 * @param {Object} recipe - The completed recipe
 * @param {Array} ingredients - Ingredients used in the recipe
 */
export const markRecipeCompleted = async (recipe) => {
  try {
    // Get current metrics
    const metricsJson = await AsyncStorage.getItem('userMetrics');
    let metrics = {
      timeSaved: 0,
      foodWasteAvoided: 0,
      recipesGenerated: 0,
      recipesCompleted: 0,
      ingredientsUsed: 0,
      lastUpdated: null
    };
    
    if (metricsJson) {
      metrics = JSON.parse(metricsJson);
    }
    
    // Get completed recipes list
    const completedRecipesJson = await AsyncStorage.getItem('completedRecipes');
    let completedRecipes = [];
    
    if (completedRecipesJson) {
      completedRecipes = JSON.parse(completedRecipesJson);
    }
    
    // Ensure recipe has a unique and consistent ID
    let recipeId = recipe.id;
    if (!recipeId) {
      // Create a consistent hash based on recipe content
      const nameStr = recipe.name || recipe.title || '';
      const stepsStr = recipe.steps ? JSON.stringify(recipe.steps) : '';
      const instructionsStr = recipe.instructions ? JSON.stringify(recipe.instructions) : '';
      const contentHash = `${nameStr}-${stepsStr || instructionsStr}`.split('').reduce(
        (hash, char) => ((hash << 5) - hash) + char.charCodeAt(0), 0
      ).toString(36);
      
      recipeId = `recipe-${nameStr.toLowerCase().replace(/\s+/g, '-')}-${contentHash}`;
    }
    
    // Check if already completed using the consistent ID
    const alreadyCompleted = completedRecipes.some(id => id === recipeId);
    
    if (!alreadyCompleted) {
      // Add to completed recipes
      completedRecipes.push(recipeId);
      await AsyncStorage.setItem('completedRecipes', JSON.stringify(completedRecipes));
      
      // Update recipe in history to mark as completed
      const historyJson = await AsyncStorage.getItem('recipeHistory');
      if (historyJson) {
        const history = JSON.parse(historyJson);
        
        // Check if this recipe already exists in history
        let recipeExists = false;
        const updatedHistory = history.map(historyRecipe => {
          // First, try to match by ID if both have IDs
          if (historyRecipe.id && historyRecipe.id === recipeId) {
            recipeExists = true;
            return { ...historyRecipe, completed: true, completedAt: new Date().toISOString() };
          }
          
          // If no ID match, try to match by name/title and steps (more precise)
          if ((historyRecipe.name === recipe.name || historyRecipe.title === recipe.title) && 
              ((historyRecipe.steps && recipe.steps && 
                JSON.stringify(historyRecipe.steps) === JSON.stringify(recipe.steps)) ||
               (historyRecipe.instructions && recipe.instructions && 
                JSON.stringify(historyRecipe.instructions) === JSON.stringify(recipe.instructions)))) {
            recipeExists = true;
            return { ...historyRecipe, id: recipeId, completed: true, completedAt: new Date().toISOString() };
          }
          
          return historyRecipe;
        });
        
        // If recipe doesn't exist in history, add it
        if (!recipeExists) {
          updatedHistory.push({
            ...recipe,
            id: recipeId,
            completed: true,
            completedAt: new Date().toISOString(),
            generatedAt: new Date().toISOString()
          });
        }
        
        await AsyncStorage.setItem('recipeHistory', JSON.stringify(updatedHistory));
      } else {
        // If no history exists, create one with this recipe
        const newHistory = [{
          ...recipe,
          id: recipeId,
          completed: true,
          completedAt: new Date().toISOString(),
          generatedAt: new Date().toISOString()
        }];
        await AsyncStorage.setItem('recipeHistory', JSON.stringify(newHistory));
      }
      
      // Calculate metrics for this completed recipe
      const timeSaved = AVERAGE_RECIPE_SEARCH_TIME_MINUTES;
      
      // Estimate ingredients used based on recipe complexity
      const ingredientsCount = recipe.ingredients ? recipe.ingredients.length : 
                              (recipe.skill_level === 'advanced' ? 10 : 
                               recipe.skill_level === 'intermediate' ? 7 : 5);
      
      const foodWasteAvoided = ingredientsCount * AVERAGE_FOOD_WASTE_PER_UNUSED_INGREDIENT_GRAMS;
      
      // Update metrics
      metrics.timeSaved += timeSaved;
      metrics.foodWasteAvoided += foodWasteAvoided;
      metrics.recipesCompleted += 1;
      metrics.ingredientsUsed += ingredientsCount;
      metrics.lastUpdated = new Date().toISOString();
      
      // Save updated metrics
      await AsyncStorage.setItem('userMetrics', JSON.stringify(metrics));
    }
    
    return metrics;
  } catch (error) {
    console.error('Error marking recipe as completed:', error);
    return null;
  }
};

/**
 * Get current user metrics
 * @returns {Object} Current metrics
 */
export const getMetrics = async () => {
  try {
    const metricsJson = await AsyncStorage.getItem('userMetrics');
    
    if (metricsJson) {
      return JSON.parse(metricsJson);
    }
    
    // Return default metrics if none exist
    return {
      timeSaved: 0,
      foodWasteAvoided: 0,
      recipesGenerated: 0,
      ingredientsUsed: 0,
      lastUpdated: null
    };
  } catch (error) {
    console.error('Error getting metrics:', error);
    return {
      timeSaved: 0,
      foodWasteAvoided: 0,
      recipesGenerated: 0,
      ingredientsUsed: 0,
      lastUpdated: null
    };
  }
};

/**
 * Reset user metrics
 */
export const resetMetrics = async () => {
  try {
    await AsyncStorage.setItem('userMetrics', JSON.stringify({
      timeSaved: 0,
      foodWasteAvoided: 0,
      recipesGenerated: 0,
      ingredientsUsed: 0,
      lastUpdated: new Date().toISOString()
    }));
    return true;
  } catch (error) {
    console.error('Error resetting metrics:', error);
    return false;
  }
};
