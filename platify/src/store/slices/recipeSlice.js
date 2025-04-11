import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateRecipes } from '../../services/openai';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunk for generating recipes
export const fetchRecipes = createAsyncThunk(
  'recipes/fetch',
  async (recipeParams, { rejectWithValue }) => {
    try {
      const recipes = await generateRecipes(recipeParams);
      return recipes;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for saving a recipe to favorites
export const saveRecipe = createAsyncThunk(
  'recipes/save',
  async ({ recipe, userId }, { rejectWithValue, getState }) => {
    try {
      // Check if recipe already exists in favorites
      const state = getState();
      const currentFavorites = state.recipes.favoriteRecipes;
      
      // Create a consistent identifier for the recipe
      const recipeNameStr = recipe.name || recipe.title || '';
      const recipeStepsStr = recipe.steps ? JSON.stringify(recipe.steps) : '';
      
      // Check if this recipe already exists in favorites
      const isDuplicate = currentFavorites.some(existingRecipe => {
        const existingNameStr = existingRecipe.name || existingRecipe.title || '';
        const existingStepsStr = existingRecipe.steps ? JSON.stringify(existingRecipe.steps) : '';
        
        // Compare name and steps to identify duplicates
        return (
          recipeNameStr.toLowerCase() === existingNameStr.toLowerCase() && 
          recipeStepsStr === existingStepsStr
        );
      });
      
      if (isDuplicate) {
        // Return the existing recipe without saving again
        console.log('Recipe already exists in favorites, not adding duplicate');
        return recipe;
      }
      
      // Ensure recipe has all required fields
      const recipeToSave = {
        name: recipe.name || recipe.title || 'Unnamed Recipe',
        skill_level: recipe.skill_level || 'beginner',
        time_estimate: recipe.time_estimate || '30 minutes',
        steps: recipe.steps || [],
        ingredients: recipe.ingredients || [],
        description: recipe.description || '',
        ...recipe
      };
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'favorites'), {
        userId,
        recipe: recipeToSave,
        createdAt: new Date()
      });
      
      // Save to AsyncStorage for offline access
      const existingRecipesJson = await AsyncStorage.getItem('favoriteRecipes');
      const existingRecipes = existingRecipesJson ? JSON.parse(existingRecipesJson) : [];
      const updatedRecipes = [...existingRecipes, { id: docRef.id, ...recipeToSave }];
      await AsyncStorage.setItem('favoriteRecipes', JSON.stringify(updatedRecipes));
      
      return { id: docRef.id, ...recipeToSave };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching favorite recipes
export const fetchFavoriteRecipes = createAsyncThunk(
  'recipes/fetchFavorites',
  async (userId, { rejectWithValue }) => {
    try {
      // Try to get from Firestore first
      const q = query(collection(db, 'favorites'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      
      const favorites = [];
      const recipeIds = new Set(); // Track recipe IDs to prevent duplicates
      
      querySnapshot.forEach((doc) => {
        const docData = doc.data();
        // Log the entire document data
        console.log('Document data:', JSON.stringify(docData, null, 2));
        
        // Check if recipe data is nested or flat
        const recipeData = docData.recipe || docData;
        
        // Log the structure to help debug
        console.log('Recipe data structure:', JSON.stringify(recipeData, null, 2));
        console.log('Recipe name:', recipeData.name);
        
        // Generate a unique ID for the recipe
        const recipeId = doc.id || `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Skip if we've already added this recipe (by ID)
        if (recipeIds.has(recipeId)) {
          console.log(`Skipping duplicate recipe with ID: ${recipeId}`);
          return;
        }
        
        // Also check for duplicates by name and content
        const recipeName = recipeData.name || recipeData.title || '';
        const recipeSteps = recipeData.steps ? JSON.stringify(recipeData.steps) : '';
        const recipeSignature = `${recipeName.toLowerCase()}-${recipeSteps}`;
        
        // Skip if we've already added a recipe with the same name and steps
        if (favorites.some(r => {
          const rName = r.name || r.title || '';
          const rSteps = r.steps ? JSON.stringify(r.steps) : '';
          return `${rName.toLowerCase()}-${rSteps}` === recipeSignature;
        })) {
          console.log(`Skipping duplicate recipe: ${recipeName}`);
          return;
        }
        
        // Add the ID to our tracking set
        recipeIds.add(recipeId);
        
        // Ensure recipe has all required fields
        const recipe = {
          id: recipeId,
          // Use title as fallback for name
          name: recipeData.name || recipeData.title || '',
          skill_level: recipeData.skill_level || 'beginner',
          time_estimate: recipeData.time_estimate || '30 minutes',
          cooking_time: recipeData.cooking_time || recipeData.time_estimate || '30 minutes',
          portions: recipeData.portions || recipeData.servings || 2,
          steps: recipeData.steps || [],
          ingredients: recipeData.ingredients || [],
          description: recipeData.description || '',
          ...recipeData
        };
        favorites.push(recipe);
      });
      
      // Update AsyncStorage for offline access
      await AsyncStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
      
      return favorites;
    } catch (error) {
      // If Firestore fails, try to get from AsyncStorage
      try {
        const storedRecipes = await AsyncStorage.getItem('favoriteRecipes');
        if (storedRecipes) {
          const recipes = JSON.parse(storedRecipes);
          // Ensure each recipe has all required fields
          return recipes.map(recipe => {
            // Don't use fallback for name if it exists
            const recipeName = recipe.name !== undefined && recipe.name !== null ? recipe.name : '';
            
            return {
              id: recipe.id || `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name: recipeName,
              skill_level: recipe.skill_level || 'beginner',
              time_estimate: recipe.time_estimate || '30 minutes',
              steps: recipe.steps || [],
              ingredients: recipe.ingredients || [],
              description: recipe.description || '',
              ...recipe
            };
          });
        }
        return [];
      } catch (storageError) {
        return rejectWithValue(error.message);
      }
    }
  }
);

// Async thunk for removing a recipe from favorites
export const removeRecipe = createAsyncThunk(
  'recipes/remove',
  async ({ recipeId, userId }, { rejectWithValue }) => {
    try {
      // Remove from Firestore
      await deleteDoc(doc(db, 'favorites', recipeId));
      
      // Update AsyncStorage
      const storedRecipes = await AsyncStorage.getItem('favoriteRecipes');
      if (storedRecipes) {
        const recipes = JSON.parse(storedRecipes);
        const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
        await AsyncStorage.setItem('favoriteRecipes', JSON.stringify(updatedRecipes));
      }
      
      return recipeId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  recipes: [],
  favoriteRecipes: [],
  isLoading: false,
  error: null,
  metrics: {
    timeSaved: 0,
    foodWasteAvoided: 0
  }
};

const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    updateMetrics: (state, action) => {
      state.metrics = {
        ...state.metrics,
        ...action.payload
      };
    },
    clearRecipes: (state) => {
      state.recipes = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch recipes
      .addCase(fetchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recipes = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Save recipe
      .addCase(saveRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favoriteRecipes.push(action.payload);
      })
      .addCase(saveRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch favorite recipes
      .addCase(fetchFavoriteRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavoriteRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favoriteRecipes = action.payload;
      })
      .addCase(fetchFavoriteRecipes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Remove recipe
      .addCase(removeRecipe.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeRecipe.fulfilled, (state, action) => {
        state.isLoading = false;
        state.favoriteRecipes = state.favoriteRecipes.filter(
          recipe => recipe.id !== action.payload
        );
      })
      .addCase(removeRecipe.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { updateMetrics, clearRecipes } = recipeSlice.actions;
export default recipeSlice.reducer;
