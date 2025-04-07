import { populateIngredientsDatabase } from './populateIngredients';

// Simple script to run the populate function once
const runPopulate = async () => {
  console.log('Starting one-time population of ingredients database...');
  try {
    await populateIngredientsDatabase();
    console.log('Successfully populated ingredients database!');
  } catch (error) {
    console.error('Error populating database:', error);
  }
};

// Execute the function
runPopulate();
