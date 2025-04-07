import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getIngredientCategories, getIngredients, initializeIngredientData } from '../../services/ingredientStorage';

// Async thunk for fetching ingredient categories from AsyncStorage
export const fetchIngredientCategories = createAsyncThunk(
  'ingredients/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      // Initialize ingredient data if needed
      await initializeIngredientData();
      
      // Get categories from AsyncStorage
      const categories = await getIngredientCategories();
      
      // Sort categories alphabetically by name
      return categories.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching ingredients from AsyncStorage
export const fetchIngredients = createAsyncThunk(
  'ingredients/fetch',
  async (_, { rejectWithValue }) => {
    try {
      // Initialize ingredient data if needed
      await initializeIngredientData();
      
      // Get ingredients from AsyncStorage
      const ingredients = await getIngredients();
      
      // Add unique IDs if they don't exist
      const ingredientsWithIds = ingredients.map((ingredient, index) => ({
        ...ingredient,
        id: ingredient.id || `ingredient_${index}`
      }));
      
      return ingredientsWithIds;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  ingredients: [],
  categories: [],
  selectedIngredients: [],
  selectedCategory: null,
  isLoading: false,
  error: null
};

const ingredientSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    addIngredient: (state, action) => {
      // Only add if it doesn't already exist in the selected ingredients
      if (!state.selectedIngredients.some(ing => ing.id === action.payload.id)) {
        state.selectedIngredients.push(action.payload);
      }
    },
    removeIngredient: (state, action) => {
      state.selectedIngredients = state.selectedIngredients.filter(
        ingredient => ingredient.id !== action.payload
      );
    },
    clearSelectedIngredients: (state) => {
      state.selectedIngredients = [];
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedCategory: (state) => {
      state.selectedCategory = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchIngredientCategories
      .addCase(fetchIngredientCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredientCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchIngredientCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Handle fetchIngredients
      .addCase(fetchIngredients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ingredients = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  addIngredient, 
  removeIngredient, 
  clearSelectedIngredients,
  setSelectedCategory,
  clearSelectedCategory
} = ingredientSlice.actions;

export default ingredientSlice.reducer;
