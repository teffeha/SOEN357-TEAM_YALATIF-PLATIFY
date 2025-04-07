import OpenAI from 'openai';
import { z } from 'zod';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: 'YOUR_OPENAI_API_KEY', // Replace with your actual API key or use environment variables
  dangerouslyAllowBrowser: true // Only for development, use backend in production
});

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
    const constants = ["water", "oil", "salt", "pepper"];
    
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
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
    throw new Error("Failed to generate recipes. Please try again.");
  }
};
