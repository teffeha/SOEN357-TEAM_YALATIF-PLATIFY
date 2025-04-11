 import OpenAI from 'openai';
import { z } from 'zod';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: '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', // Replace with your actual API key or use environment variables
  dangerouslyAllowBrowser: true // Only for development, use backend in production
});

// Recipe schema validation using Zod
const RecipeSchema = z.object({
  title: z.string(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced']),
  steps: z.array(z.string()),
  cooking_time: z.number(),
  portions: z.number(),
  ingredients: z.array(z.string()).optional(),
  description: z.string().optional()
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
 * @param {Array<string>} params.allergies - List of allergies to avoid
 * @param {number} params.maxCookingTime - Maximum cooking time in minutes
 * @returns {Promise<Array>} - Array of recipe objects
 */
export const generateRecipes = async ({ ingredients, portions, days, diet, skill, allergies = [], maxCookingTime = 180 }) => {
  try {
    const constants = ["water", "oil", "salt", "pepper"];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional chef assistant that creates recipes based on available ingredients. You must respond ONLY with valid JSON. Provide exactly 3 recipes in JSON format with the following structure:\n{\n  \"recipes\": [\n    {\n      \"title\": \"Recipe Name\",\n      \"skill_level\": \"beginner\", // must be one of: beginner, intermediate, advanced\n      \"steps\": [\"Step 1: Detailed instruction including cooking techniques, temperatures, and timing\", \"Step 2: Detailed instruction with specific measurements and methods\"],\n      \"cooking_time\": 30, // numeric value in minutes\n      \"portions\": 2, // numeric value\n      \"ingredients\": [\"ingredient 1\", \"ingredient 2\"],\n      \"description\": \"Brief description\"\n    }\n  ]\n}\n\nFor recipe steps, provide detailed instructions that include:\n1. Specific measurements and quantities\n2. Cooking temperatures when applicable\n3. Precise timing for each step (e.g., 'sauté for 5 minutes until golden')\n4. Cooking techniques and methods clearly explained\n5. Visual cues to help users know when something is done\n6. Tips for best results where appropriate\n\nEach step should be comprehensive enough that even beginner cooks can follow along successfully. Number each step clearly (e.g., 'Step 1: Preheat oven to 350°F (175°C) and line a baking sheet with parchment paper').\n\nIf allergies are specified, ensure recipes completely avoid those ingredients. If maxCookingTime is specified, ensure recipes can be prepared within that time limit. Make sure cooking_time and portions are numeric values, not strings. DO NOT include any text before or after the JSON."
        },
        {
          role: "user",
          content: JSON.stringify({
            ingredients,
            portions,
            days,
            diet,
            skill,
            allergies,
            maxCookingTime,
            constants
          })
        }
      ]
      // Removed response_format parameter as it's not supported by the model
    });

    let responseContent = response.choices[0].message.content;
    
    // Try to clean the response if it's not valid JSON
    try {
      // Parse the response to check if it's valid JSON
      const responseData = JSON.parse(responseContent);
      
      // Validate the response with Zod
      const validatedData = RecipeResponseSchema.parse(responseData);
      
      // Ensure all recipes have the correct property names and types
      const processedRecipes = validatedData.recipes.map(recipe => ({
        ...recipe,
        title: recipe.title || recipe.name || "Untitled Recipe",
        cooking_time: typeof recipe.cooking_time === 'number' ? recipe.cooking_time : 
                     (recipe.time_estimate ? parseInt(recipe.time_estimate) : 30),
        portions: typeof recipe.portions === 'number' ? recipe.portions : portions
      }));
      
      return processedRecipes;
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      
      // Try to extract JSON from the response if it contains additional text
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = jsonMatch[0];
          const responseData = JSON.parse(extractedJson);
          
          // Validate the response with Zod
          const validatedData = RecipeResponseSchema.parse(responseData);
          
          // Ensure all recipes have the correct property names and types
          const processedRecipes = validatedData.recipes.map(recipe => ({
            ...recipe,
            title: recipe.title || recipe.name || "Untitled Recipe",
            cooking_time: typeof recipe.cooking_time === 'number' ? recipe.cooking_time : 
                         (recipe.time_estimate ? parseInt(recipe.time_estimate) : 30),
            portions: typeof recipe.portions === 'number' ? recipe.portions : portions
          }));
          
          return processedRecipes;
        } catch (extractError) {
          console.error("Error extracting JSON:", extractError);
          throw new Error("Failed to parse recipe data. Please try again.");
        }
      } else {
        throw new Error("Invalid response format. Please try again.");
      }
    }
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("Failed to generate recipes. Please try again.");
  }
};
