import { collection, addDoc, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { ingredientCategories, flattenedIngredients } from '../data/ingredients';

/**
 * Populate the Firestore database with ingredient categories and ingredients
 */
export const populateIngredientsDatabase = async () => {
  try {
    console.log('Starting to populate ingredients database...');
    
    // Check if categories already exist to avoid duplicates
    const categoriesSnapshot = await getDocs(collection(db, 'ingredientCategories'));
    if (!categoriesSnapshot.empty) {
      console.log('Ingredients already populated. Skipping...');
      return;
    }

    // Use a batch write for better performance
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
    console.log('Successfully populated ingredients database with categories and ingredients');
    
    return true;
  } catch (error) {
    console.error('Error populating ingredients database:', error);
    throw error;
  }
};

// Function to check if ingredients exist and populate if they don't
export const ensureIngredientsPopulated = async () => {
  try {
    const ingredientsSnapshot = await getDocs(collection(db, 'ingredients'));
    if (ingredientsSnapshot.empty) {
      console.log('No ingredients found. Populating database...');
      return populateIngredientsDatabase();
    } else {
      console.log(`Found ${ingredientsSnapshot.size} ingredients in database.`);
      return true;
    }
  } catch (error) {
    console.error('Error checking ingredients:', error);
    throw error;
  }
};
