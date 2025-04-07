import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import recipeReducer from './slices/recipeSlice';
import ingredientReducer from './slices/ingredientSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipeReducer,
    ingredients: ingredientReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});
