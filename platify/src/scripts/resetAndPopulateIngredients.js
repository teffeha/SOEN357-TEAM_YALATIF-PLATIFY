import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ingredientCategories, flattenedIngredients } from '../data/ingredients';

/**
 * Clear existing ingredients and categories, then populate with fresh data
 */
export const resetAndPopulateIngredients = async () => {
  try {
    console.log('Starting to reset and populate ingredients database...');
    
    // Step 1: Delete all existing ingredients
    console.log('Clearing existing ingredients...');
    const ingredientsSnapshot = await getDocs(collection(db, 'ingredients'));
    const deleteIngredientsPromises = [];
    
    ingredientsSnapshot.forEach((document) => {
      deleteIngredientsPromises.push(deleteDoc(doc(db, 'ingredients', document.id)));
    });
    
    await Promise.all(deleteIngredientsPromises);
    console.log(`Deleted ${deleteIngredientsPromises.length} ingredients.`);
    
    // Step 2: Delete all existing categories
    console.log('Clearing existing ingredient categories...');
    const categoriesSnapshot = await getDocs(collection(db, 'ingredientCategories'));
    const deleteCategoriesPromises = [];
    
    categoriesSnapshot.forEach((document) => {
      deleteCategoriesPromises.push(deleteDoc(doc(db, 'ingredientCategories', document.id)));
    });
    
    await Promise.all(deleteCategoriesPromises);
    console.log(`Deleted ${deleteCategoriesPromises.length} categories.`);
    
    // Step 3: Populate with fresh data
    console.log('Populating with fresh data...');
    const batch = writeBatch(db);
    
    // Add categories first
    const categoryRefs = {};
    for (const category of ingredientCategories) {
      const categoryRef = doc(collection(db, 'ingredientCategories'));
      categoryRefs[category.id] = categoryRef;
      batch.set(categoryRef, {
        id: category.id,
        name: category.name,
        createdAt: new Date()
      });
    }
    
    // Add all ingredients with references to their categories
    for (const ingredient of flattenedIngredients) {
      const ingredientRef = doc(collection(db, 'ingredients'));
      batch.set(ingredientRef, {
        name: ingredient.name,
        image: ingredient.image,
        category: ingredient.category,
        categoryName: ingredient.categoryName,
        createdAt: new Date()
      });
    }
    
    // Commit the batch
    await batch.commit();
    console.log('Successfully reset and populated ingredients database.');
    
    return true;
  } catch (error) {
    console.error('Error resetting and populating ingredients database:', error);
    throw error;
  }
};

// Run the reset and populate function
resetAndPopulateIngredients()
  .then(() => console.log('Reset and populate operation completed successfully.'))
  .catch(error => console.error('Failed to reset and populate:', error));
