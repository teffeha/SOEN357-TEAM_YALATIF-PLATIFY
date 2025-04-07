import { collection, getDocs, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { sampleIngredients } from '../constants/sampleIngredients';

/**
 * Initialize the Firestore database with sample ingredients data
 * This should be called once when the app is first installed
 */
export const initializeFirestore = async () => {
  try {
    // Initialize ingredients collection
    await initializeIngredients();
    console.log('Firestore initialization complete');
    return true;
  } catch (error) {
    console.error('Error initializing Firestore:', error);
    return false;
  }
};

/**
 * Initialize the ingredients collection if it doesn't exist
 * Uses batch writes for better performance
 */
const initializeIngredients = async () => {
  try {
    // Check if collection already has data
    const querySnapshot = await getDocs(collection(db, 'ingredients'));
    if (!querySnapshot.empty) {
      console.log('Ingredients collection already populated');
      return;
    }
    
    // Use batch writes for better performance
    const batch = writeBatch(db);
    const ingredientsCollection = collection(db, 'ingredients');
    
    // Split ingredients into smaller batches (Firestore has a limit of 500 operations per batch)
    const batchSize = 400;
    for (let i = 0; i < sampleIngredients.length; i += batchSize) {
      const currentBatch = sampleIngredients.slice(i, i + batchSize);
      
      for (const ingredient of currentBatch) {
        const newDocRef = doc(ingredientsCollection);
        batch.set(newDocRef, ingredient);
      }
      
      // Commit the batch
      await batch.commit();
      console.log(`Batch ${Math.floor(i / batchSize) + 1} committed`);
    }
    
    console.log('Successfully initialized ingredients collection');
  } catch (error) {
    console.error('Error initializing ingredients collection:', error);
    throw error;
  }
};

/**
 * Initialize user favorites collection structure
 * @param {string} userId - The user ID
 */
export const initializeUserCollections = async (userId) => {
  try {
    // Create favorites collection for the user if it doesn't exist
    const favoritesQuery = await getDocs(
      collection(db, 'favorites')
    );
    
    if (favoritesQuery.empty) {
      // Create an empty document to initialize the collection
      await addDoc(collection(db, 'favorites'), {
        userId,
        createdAt: new Date(),
        isPlaceholder: true
      });
      console.log('User favorites collection initialized');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing user collections:', error);
    return false;
  }
};
