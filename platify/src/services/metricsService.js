import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for calculations
const AVERAGE_RECIPE_SEARCH_TIME_MINUTES = 25; // Average time to search for recipes manually
const AVERAGE_FOOD_WASTE_PER_UNUSED_INGREDIENT_GRAMS = 150; // Average food waste per unused ingredient

/**
 * Get the current week identifier (YYYY-WW format)
 * Weeks start on Monday and end on Sunday
 */
const getCurrentWeekId = () => {
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

/**
 * Check if metrics need to be reset for a new week
 * @param {Object} metrics - Current metrics object
 * @returns {Boolean} - True if metrics should be reset
 */
const shouldResetMetrics = (metrics) => {
  if (!metrics || !metrics.weekId) {
    return true;
  }
  
  const currentWeekId = getCurrentWeekId();
  return metrics.weekId !== currentWeekId;
};

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
      lastUpdated: null,
      weekId: getCurrentWeekId()
    };
    
    if (metricsJson) {
      const parsedMetrics = JSON.parse(metricsJson);
      
      // Check if we need to reset for a new week
      if (shouldResetMetrics(parsedMetrics)) {
        console.log('New week detected, resetting metrics');
        // Keep historical data in a separate storage key
        const historicalMetricsJson = await AsyncStorage.getItem('historicalMetrics');
        let historicalMetrics = [];
        
        if (historicalMetricsJson) {
          historicalMetrics = JSON.parse(historicalMetricsJson);
        }
        
        // Only save if we have meaningful data
        if (parsedMetrics.recipesGenerated > 0 || parsedMetrics.recipesCompleted > 0) {
          historicalMetrics.push({
            ...parsedMetrics,
            endDate: new Date().toISOString()
          });
          
          // Keep only the last 12 weeks
          if (historicalMetrics.length > 12) {
            historicalMetrics = historicalMetrics.slice(-12);
          }
          
          await AsyncStorage.setItem('historicalMetrics', JSON.stringify(historicalMetrics));
        }
        
        // Reset current metrics for the new week
        metrics = {
          timeSaved: 0,
          foodWasteAvoided: 0,
          recipesGenerated: 0,
          recipesCompleted: 0,
          ingredientsUsed: 0,
          lastUpdated: new Date().toISOString(),
          weekId: getCurrentWeekId()
        };
      } else {
        // Continue with current week's metrics
        metrics = parsedMetrics;
      }
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
      lastUpdated: null,
      weekId: getCurrentWeekId()
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
      const metrics = JSON.parse(metricsJson);
      
      // Check if we need to reset for a new week
      if (shouldResetMetrics(metrics)) {
        console.log('New week detected when getting metrics, resetting');
        
        // Save current metrics to historical data
        const historicalMetricsJson = await AsyncStorage.getItem('historicalMetrics');
        let historicalMetrics = [];
        
        if (historicalMetricsJson) {
          historicalMetrics = JSON.parse(historicalMetricsJson);
        }
        
        // Only save if we have meaningful data
        if (metrics.recipesGenerated > 0 || metrics.recipesCompleted > 0) {
          historicalMetrics.push({
            ...metrics,
            endDate: new Date().toISOString()
          });
          
          // Keep only the last 12 weeks
          if (historicalMetrics.length > 12) {
            historicalMetrics = historicalMetrics.slice(-12);
          }
          
          await AsyncStorage.setItem('historicalMetrics', JSON.stringify(historicalMetrics));
        }
        
        // Create new metrics for current week
        const newMetrics = {
          timeSaved: 0,
          foodWasteAvoided: 0,
          recipesGenerated: 0,
          recipesCompleted: 0,
          ingredientsUsed: 0,
          lastUpdated: new Date().toISOString(),
          weekId: getCurrentWeekId()
        };
        
        await AsyncStorage.setItem('userMetrics', JSON.stringify(newMetrics));
        return newMetrics;
      }
      
      return metrics;
    }
    
    // Return default metrics if none exist
    const defaultMetrics = {
      timeSaved: 0,
      foodWasteAvoided: 0,
      recipesGenerated: 0,
      recipesCompleted: 0,
      ingredientsUsed: 0,
      lastUpdated: new Date().toISOString(),
      weekId: getCurrentWeekId()
    };
    
    await AsyncStorage.setItem('userMetrics', JSON.stringify(defaultMetrics));
    return defaultMetrics;
  } catch (error) {
    console.error('Error getting metrics:', error);
    return {
      timeSaved: 0,
      foodWasteAvoided: 0,
      recipesGenerated: 0,
      recipesCompleted: 0,
      ingredientsUsed: 0,
      lastUpdated: new Date().toISOString(),
      weekId: getCurrentWeekId()
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
      recipesCompleted: 0,
      ingredientsUsed: 0,
      lastUpdated: new Date().toISOString(),
      weekId: getCurrentWeekId()
    }));
    return true;
  } catch (error) {
    console.error('Error resetting metrics:', error);
    return false;
  }
};

/**
 * Get historical metrics data
 * @returns {Array} Array of historical weekly metrics
 */
export const getHistoricalMetrics = async () => {
  try {
    const historicalMetricsJson = await AsyncStorage.getItem('historicalMetrics');
    
    if (historicalMetricsJson) {
      return JSON.parse(historicalMetricsJson);
    }
    
    return [];
  } catch (error) {
    console.error('Error getting historical metrics:', error);
    return [];
  }
};
