import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

// Async thunk for fetching ingredients from Firestore
export const fetchIngredients = createAsyncThunk(
  'ingredients/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const querySnapshot = await getDocs(collection(db, 'ingredients'));
      const ingredients = [];
      
      querySnapshot.forEach((doc) => {
        ingredients.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return ingredients;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  ingredients: [],
  selectedIngredients: [],
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
    }
  },
  extraReducers: (builder) => {
    builder
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
  clearSelectedIngredients 
} = ingredientSlice.actions;

export default ingredientSlice.reducer;
