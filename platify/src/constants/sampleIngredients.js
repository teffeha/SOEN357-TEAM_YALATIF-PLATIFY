/**
 * Sample ingredients data for Firestore initialization
 * This can be used to populate the Firestore database with initial ingredients
 */

export const sampleIngredients = [
  // Proteins
  { id: '1', name: 'chicken', category: 'protein' },
  { id: '2', name: 'beef', category: 'protein' },
  { id: '3', name: 'pork', category: 'protein' },
  { id: '4', name: 'salmon', category: 'protein' },
  { id: '5', name: 'tuna', category: 'protein' },
  { id: '6', name: 'shrimp', category: 'protein' },
  { id: '7', name: 'tofu', category: 'protein' },
  { id: '8', name: 'eggs', category: 'protein' },
  { id: '9', name: 'turkey', category: 'protein' },
  { id: '10', name: 'lamb', category: 'protein' },
  
  // Grains
  { id: '11', name: 'rice', category: 'grain' },
  { id: '12', name: 'pasta', category: 'grain' },
  { id: '13', name: 'quinoa', category: 'grain' },
  { id: '14', name: 'couscous', category: 'grain' },
  { id: '15', name: 'bread', category: 'grain' },
  { id: '16', name: 'oats', category: 'grain' },
  { id: '17', name: 'barley', category: 'grain' },
  { id: '18', name: 'bulgur', category: 'grain' },
  { id: '19', name: 'tortillas', category: 'grain' },
  { id: '20', name: 'noodles', category: 'grain' },
  
  // Vegetables
  { id: '21', name: 'broccoli', category: 'vegetable' },
  { id: '22', name: 'carrots', category: 'vegetable' },
  { id: '23', name: 'spinach', category: 'vegetable' },
  { id: '24', name: 'bell peppers', category: 'vegetable' },
  { id: '25', name: 'onions', category: 'vegetable' },
  { id: '26', name: 'garlic', category: 'vegetable' },
  { id: '27', name: 'potatoes', category: 'vegetable' },
  { id: '28', name: 'tomatoes', category: 'vegetable' },
  { id: '29', name: 'zucchini', category: 'vegetable' },
  { id: '30', name: 'mushrooms', category: 'vegetable' },
  { id: '31', name: 'kale', category: 'vegetable' },
  { id: '32', name: 'cauliflower', category: 'vegetable' },
  { id: '33', name: 'cucumber', category: 'vegetable' },
  { id: '34', name: 'lettuce', category: 'vegetable' },
  { id: '35', name: 'corn', category: 'vegetable' },
  
  // Fruits
  { id: '36', name: 'apples', category: 'fruit' },
  { id: '37', name: 'bananas', category: 'fruit' },
  { id: '38', name: 'oranges', category: 'fruit' },
  { id: '39', name: 'strawberries', category: 'fruit' },
  { id: '40', name: 'blueberries', category: 'fruit' },
  { id: '41', name: 'lemons', category: 'fruit' },
  { id: '42', name: 'limes', category: 'fruit' },
  { id: '43', name: 'avocados', category: 'fruit' },
  { id: '44', name: 'pineapple', category: 'fruit' },
  { id: '45', name: 'mango', category: 'fruit' },
  
  // Dairy
  { id: '46', name: 'milk', category: 'dairy' },
  { id: '47', name: 'cheese', category: 'dairy' },
  { id: '48', name: 'yogurt', category: 'dairy' },
  { id: '49', name: 'butter', category: 'dairy' },
  { id: '50', name: 'cream', category: 'dairy' },
  { id: '51', name: 'sour cream', category: 'dairy' },
  { id: '52', name: 'cream cheese', category: 'dairy' },
  
  // Legumes
  { id: '53', name: 'black beans', category: 'legume' },
  { id: '54', name: 'chickpeas', category: 'legume' },
  { id: '55', name: 'lentils', category: 'legume' },
  { id: '56', name: 'kidney beans', category: 'legume' },
  { id: '57', name: 'pinto beans', category: 'legume' },
  
  // Nuts and Seeds
  { id: '58', name: 'almonds', category: 'nuts_seeds' },
  { id: '59', name: 'walnuts', category: 'nuts_seeds' },
  { id: '60', name: 'peanuts', category: 'nuts_seeds' },
  { id: '61', name: 'cashews', category: 'nuts_seeds' },
  { id: '62', name: 'chia seeds', category: 'nuts_seeds' },
  { id: '63', name: 'flax seeds', category: 'nuts_seeds' },
  { id: '64', name: 'sunflower seeds', category: 'nuts_seeds' },
  
  // Herbs and Spices
  { id: '65', name: 'basil', category: 'herb_spice' },
  { id: '66', name: 'oregano', category: 'herb_spice' },
  { id: '67', name: 'thyme', category: 'herb_spice' },
  { id: '68', name: 'rosemary', category: 'herb_spice' },
  { id: '69', name: 'cilantro', category: 'herb_spice' },
  { id: '70', name: 'parsley', category: 'herb_spice' },
  { id: '71', name: 'cumin', category: 'herb_spice' },
  { id: '72', name: 'paprika', category: 'herb_spice' },
  { id: '73', name: 'cinnamon', category: 'herb_spice' },
  { id: '74', name: 'turmeric', category: 'herb_spice' },
  { id: '75', name: 'ginger', category: 'herb_spice' },
  
  // Condiments
  { id: '76', name: 'soy sauce', category: 'condiment' },
  { id: '77', name: 'vinegar', category: 'condiment' },
  { id: '78', name: 'honey', category: 'condiment' },
  { id: '79', name: 'maple syrup', category: 'condiment' },
  { id: '80', name: 'ketchup', category: 'condiment' },
  { id: '81', name: 'mustard', category: 'condiment' },
  { id: '82', name: 'mayonnaise', category: 'condiment' },
  { id: '83', name: 'hot sauce', category: 'condiment' },
  { id: '84', name: 'olive oil', category: 'condiment' },
  { id: '85', name: 'coconut oil', category: 'condiment' },
];

/**
 * Function to initialize Firestore with sample ingredients
 * Usage example:
 * 
 * import { db } from '../services/firebase';
 * import { initializeIngredientsCollection } from '../constants/sampleIngredients';
 * 
 * // Call this function once to populate the database
 * initializeIngredientsCollection(db);
 */
export const initializeIngredientsCollection = async (db) => {
  const { collection, addDoc, getDocs } = require('firebase/firestore');
  
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
  }
};
