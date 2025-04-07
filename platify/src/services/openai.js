import OpenAI from 'openai';
import { z } from 'zod';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'sk-placeholder-key', // Using environment variable
  dangerouslyAllowBrowser: true // Only for development, use backend in production
});

// Flag to force using sample recipes for development/demo
const FORCE_SAMPLE_RECIPES = true; // Set to false when API key is properly configured

// Sample recipes for fallback when API is not available
const SAMPLE_RECIPES = [
  {
    name: "Quick Vegetable Stir Fry",
    skill_level: "beginner",
    steps: [
      "Heat oil in a pan over medium-high heat.",
      "Add chopped vegetables and stir fry for 5-7 minutes.",
      "Add soy sauce, garlic, and ginger.",
      "Cook for another 2 minutes and serve over rice."
    ],
    time_estimate: "15 minutes",
    ingredients: ["vegetables", "soy sauce", "garlic", "ginger", "rice"],
    portions: 2,
    description: "A quick and healthy vegetable stir fry that's perfect for busy weeknights."
  },
  {
    name: "Simple Pasta with Tomato Sauce",
    skill_level: "beginner",
    steps: [
      "Boil pasta according to package instructions.",
      "In a separate pan, heat olive oil and add minced garlic.",
      "Add canned tomatoes, salt, pepper, and Italian herbs.",
      "Simmer for 10 minutes, then combine with drained pasta."
    ],
    time_estimate: "20 minutes",
    ingredients: ["pasta", "tomatoes", "garlic", "olive oil", "Italian herbs"],
    portions: 4,
    description: "A classic pasta dish with a simple tomato sauce that everyone will love."
  },
  {
    name: "Chicken and Rice Bowl",
    skill_level: "intermediate",
    steps: [
      "Season chicken with salt, pepper, and your favorite spices.",
      "Cook chicken in a pan until golden and cooked through.",
      "Prepare rice according to package instructions.",
      "Serve chicken over rice with vegetables of your choice."
    ],
    time_estimate: "30 minutes",
    ingredients: ["chicken", "rice", "vegetables", "spices"],
    portions: 2,
    description: "A satisfying and customizable meal that's perfect for meal prep."
  },
  {
    name: "Fruit and Yogurt Parfait",
    skill_level: "beginner",
    steps: [
      "Layer yogurt in a glass or bowl.",
      "Add a layer of mixed fruits (berries, banana, etc.).",
      "Add a layer of granola or nuts.",
      "Repeat layers and top with honey or maple syrup."
    ],
    time_estimate: "5 minutes",
    ingredients: ["yogurt", "fruits", "granola", "honey"],
    portions: 1,
    description: "A quick and healthy breakfast or snack option that's customizable with your favorite fruits."
  },
  {
    name: "Beef and Vegetable Stew",
    skill_level: "advanced",
    steps: [
      "Brown beef chunks in a large pot.",
      "Add chopped onions, carrots, and celery and sauté until soft.",
      "Add beef broth, tomato paste, and herbs.",
      "Simmer for 1-2 hours until beef is tender."
    ],
    time_estimate: "2 hours",
    ingredients: ["beef", "onions", "carrots", "celery", "beef broth", "tomato paste"],
    portions: 6,
    description: "A hearty and comforting stew that's perfect for cold weather."
  }
];

// Recipe schema validation using Zod
const RecipeSchema = z.object({
  name: z.string(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced']),
  steps: z.array(z.string()),
  time_estimate: z.string()
});

const RecipeResponseSchema = z.object({
  recipes: z.array(RecipeSchema).length(3)
});

/**
 * Generate recipes based on user inputs
 * @param {Object} params - Recipe generation parameters
 * @param {Array<string>} params.ingredients - List of ingredients
 * @param {number} params.portions - Number of portions (1-10)
 * @param {number} params.days - Number of days for meal planning (1-7)
 * @param {string} params.diet - Dietary restrictions
 * @param {string} params.skill - Skill level (beginner/intermediate/advanced)
 * @returns {Promise<Array>} - Array of recipe objects
 */
export const generateRecipes = async ({ ingredients, portions, days, diet, skill }) => {
  try {
    // For development/demo, force using sample recipes
    if (FORCE_SAMPLE_RECIPES) {
      console.log('Using sample recipes (forced for development)');
      
      // Filter sample recipes based on ingredients if provided
      if (ingredients && ingredients.length > 0) {
        console.log('Filtering sample recipes based on ingredients:', ingredients);
        
        // Create a simple matching algorithm
        const filteredRecipes = SAMPLE_RECIPES.filter(recipe => {
          // Check if any of the user's ingredients are in the recipe
          return ingredients.some(ing => {
            // Check if the ingredient is in the recipe's ingredients list
            return recipe.ingredients.some(recipeIng => 
              recipeIng.toLowerCase().includes(ing.toLowerCase())
            );
          });
        });
        
        // If we found matching recipes, return them
        if (filteredRecipes.length > 0) {
          console.log(`Found ${filteredRecipes.length} matching recipes`);
          return filteredRecipes;
        }
      }
      
      // If no ingredients specified or no matches found, return all sample recipes
      return SAMPLE_RECIPES;
    }
    
    // Check if we have a valid API key
    if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.EXPO_PUBLIC_OPENAI_API_KEY === 'sk-placeholder-key') {
      console.log('Using sample recipes due to missing API key');
      // Return sample recipes for development/demo purposes
      return SAMPLE_RECIPES;
    }
    
    const constants = ["water", "oil", "salt", "pepper"];
    
    console.log('Generating recipes with parameters:', { ingredients, portions, days, diet, skill });
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using a more widely available model
      messages: [
        {
          role: "system",
          content: "You are a professional chef assistant that creates recipes based on available ingredients. Provide exactly 3 recipes in JSON format."
        },
        {
          role: "user",
          content: JSON.stringify({
            ingredients,
            portions,
            days,
            diet,
            skill,
            constants
          })
        }
      ],
      response_format: { type: "json_object" }
    });

    const responseData = JSON.parse(response.choices[0].message.content);
    
    // Validate the response with Zod
    const validatedData = RecipeResponseSchema.parse(responseData);
    
    return validatedData.recipes;
  } catch (error) {
    console.error("Error generating recipes:", error);
    console.log("Falling back to sample recipes");
    // Return sample recipes as fallback
    return SAMPLE_RECIPES;
  }
};
