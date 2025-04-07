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
  async ({ recipe, userId }, { rejectWithValue }) => {
    try {
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'favorites'), {
        userId,
        recipe,
        createdAt: new Date()
      });
      
      // Save to AsyncStorage for offline access
      const existingRecipesJson = await AsyncStorage.getItem('favoriteRecipes');
      const existingRecipes = existingRecipesJson ? JSON.parse(existingRecipesJson) : [];
      const updatedRecipes = [...existingRecipes, { id: docRef.id, ...recipe }];
      await AsyncStorage.setItem('favoriteRecipes', JSON.stringify(updatedRecipes));
      
      return { id: docRef.id, ...recipe };
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
      querySnapshot.forEach((doc) => {
        favorites.push({
          id: doc.id,
          ...doc.data().recipe
        });
      });
      
      // Update AsyncStorage for offline access
      await AsyncStorage.setItem('favoriteRecipes', JSON.stringify(favorites));
      
      return favorites;
    } catch (error) {
      // If Firestore fails, try to get from AsyncStorage
      try {
        const storedRecipes = await AsyncStorage.getItem('favoriteRecipes');
        return storedRecipes ? JSON.parse(storedRecipes) : [];
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
