import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { sampleIngredients } from '../constants/sampleIngredients';

/**
 * Initialize the Firestore database with sample data
 * This should be called once when the app is first installed
 */
export const initializeDatabase = async () => {
  try {
    await initializeIngredients();
    console.log('Database initialization complete');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

/**
 * Initialize the ingredients collection if it doesn't exist
 */
const initializeIngredients = async () => {
  try {
    // Check if collection already has data
    const querySnapshot = await getDocs(collection(db, 'ingredients'));
    if (!querySnapshot.empty) {
      console.log('Ingredients collection already populated');
      return;
    }
    
    // Add ingredients to Firestore
    const ingredientsCollection = collection(db, 'ingredients');
    
    for (const ingredient of sampleIngredients) {
      await addDoc(ingredientsCollection, ingredient);
    }
    
    console.log('Successfully initialized ingredients collection');
  } catch (error) {
    console.error('Error initializing ingredients collection:', error);
    throw error;
  }
};
