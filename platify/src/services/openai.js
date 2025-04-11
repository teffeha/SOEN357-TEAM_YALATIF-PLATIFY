import OpenAI from 'openai';
import { z } from 'zod';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: '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', // Replace with your actual API key or use environment variables
  dangerouslyAllowBrowser: true // Only for development, use backend in production
});

// Recipe schema validation using Zod
const RecipeSchema = z.object({
  name: z.string(),
  skill_level: z.enum(['beginner', 'intermediate', 'advanced']),
  steps: z.array(z.string()),
  time_estimate: z.string(),
  ingredients: z.array(z.string()).optional(),
  description: z.string().optional()
});

const RecipeResponseSchema = z.object({
  recipes: z.array(RecipeSchema).min(1).max(3)
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
          content: "You are a professional chef assistant that creates detailed, easy-to-follow recipes based on available ingredients. Provide exactly 3 recipes in JSON format with the following structure:\n{\n  \"recipes\": [\n    {\n      \"name\": \"Recipe Name\",\n      \"skill_level\": \"beginner\", // must be one of: beginner, intermediate, advanced\n      \"steps\": [\"Step 1\", \"Step 2\"],\n      \"time_estimate\": \"30 minutes\",\n      \"ingredients\": [\"ingredient 1\", \"ingredient 2\"],\n      \"description\": \"Brief description\"\n    }\n  ]\n}\n\nIMPORTANT INSTRUCTIONS FOR RECIPE QUALITY:\n1. Each ingredient MUST include precise measurements (e.g., '2 cups flour' not just 'flour')\n2. Recipe steps MUST be detailed and include:\n   - Specific cooking times (e.g., 'Bake for 25 minutes' or 'Simmer for 10-15 minutes')\n   - Cooking temperatures when applicable (e.g., 'Preheat oven to 350°F' or 'Heat oil to medium-high')\n   - Clear instructions for ingredient preparation and combination\n   - Visual cues for doneness (e.g., 'until golden brown' or 'until internal temperature reaches 165°F')\n3. Make instructions easy to follow with a logical step-by-step progression\n4. Include any resting or cooling times needed\n\nIf allergies are specified, ensure recipes completely avoid those ingredients. If maxCookingTime is specified, ensure recipes can be prepared within that time limit."
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
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    let responseData;
    try {
      responseData = JSON.parse(response.choices[0].message.content);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", response.choices[0].message.content);
      throw new Error("Failed to parse recipe data. The AI response was not in the expected format.");
    }
    
    // Check if recipes array exists
    if (!responseData.recipes || !Array.isArray(responseData.recipes)) {
      console.error("Invalid response format - missing recipes array:", responseData);
      throw new Error("The AI response did not contain a valid recipes array.");
    }
    
    // Validate the response with Zod
    try {
      const validatedData = RecipeResponseSchema.parse(responseData);
      return validatedData.recipes;
    } catch (validationError) {
      console.error("Validation error:", validationError);
      
      // If we have at least one recipe but validation failed, try to salvage what we can
      if (responseData.recipes.length > 0) {
        console.log("Attempting to salvage partial recipe data...");
        
        // Try to validate each recipe individually and return the valid ones
        const validRecipes = [];
        for (const recipe of responseData.recipes) {
          try {
            const validRecipe = RecipeSchema.parse(recipe);
            validRecipes.push(validRecipe);
          } catch (recipeError) {
            console.error("Invalid recipe:", recipe, recipeError);
          }
        }
        
        if (validRecipes.length > 0) {
          console.log(`Salvaged ${validRecipes.length} valid recipes`);
          return validRecipes;
        }
      }
      
      throw new Error("Failed to validate recipe data. Please try again with different ingredients.");
    }
  } catch (error) {
    console.error("Error generating recipes:", error);
    if (error.response) {
      console.error("OpenAI API error:", error.response.status, error.response.data);
    }
    throw new Error(error.message || "Failed to generate recipes. Please try again.");
  }
};
