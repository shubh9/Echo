import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

// Initialize the OpenAI client using the API key from the environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a response from the OpenAI Chat Completion API.
 *
 * @param prompt - The prompt/question to send to the model.
 * @returns The model's response as a string.
 */
export async function generate(prompt: string): Promise<string> {
  if (!openai.apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set. Please provide it in your environment variables."
    );
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  // Extract and return the content of the first choice
  return completion.choices[0]?.message?.content?.trim() ?? "";
}
