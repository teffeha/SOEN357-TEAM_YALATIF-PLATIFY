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
          content: "You are a professional chef assistant that creates recipes based on available ingredients. Provide exactly 3 recipes in JSON format with the following structure:\n{\n  \"recipes\": [\n    {\n      \"name\": \"Recipe Name\",\n      \"skill_level\": \"beginner\", // must be one of: beginner, intermediate, advanced\n      \"steps\": [\"Step 1\", \"Step 2\"],\n      \"time_estimate\": \"30 minutes\",\n      \"ingredients\": [\"ingredient 1\", \"ingredient 2\"],\n      \"description\": \"Brief description\"\n    }\n  ]\n}\nIf allergies are specified, ensure recipes completely avoid those ingredients. If maxCookingTime is specified, ensure recipes can be prepared within that time limit."
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
    });

    const responseData = JSON.parse(response.choices[0].message.content);
    
    // Validate the response with Zod
    const validatedData = RecipeResponseSchema.parse(responseData);
    
    return validatedData.recipes;
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("Failed to generate recipes. Please try again.");
  }
};
