import express from "express";
import { generate } from "./llmService";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Function to edit the prompt using LLM
async function editPrompt(
  currentPrompt: string,
  conversationTranscript: Array<{ role: string; message: string }>,
  promptChangeInstruction: string
): Promise<string> {
  // Create a detailed prompt for the LLM to generate a new prompt
  const llmPrompt = `You are a prompt engineer. Your task is to modify an existing AI assistant prompt based on specific instructions and conversation context.

Current Prompt:
"${currentPrompt}"

Conversation Transcript:
${conversationTranscript.map((msg) => `${msg.role}: ${msg.message}`).join("\n")}

Instructions for changing the prompt:
${promptChangeInstruction}

Please generate a new prompt that:
1. Incorporates the requested changes from the instructions
2. Takes into account the conversation context
3. Maintains the core functionality of being a helpful assistant
4. Is clear, concise, and well-structured
5. If it doesn't need to be changed return the rest of the prompt EXACTLY as it is, just modify what's needed

Return only the new prompt text without any additional explanation or formatting.`;

  try {
    const newPrompt = await generate(llmPrompt);
    return newPrompt;
  } catch (error) {
    console.error("Error generating new prompt:", error);
    throw new Error("Failed to generate new prompt");
  }
}

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Endpoint for Edit Voice AI Prompt function calls
app.post("/api/edit-voice-ai-prompt", async (req, res) => {
  const { toolCall, conversationTranscript, currentPrompt } = req.body;

  console.log("Received Edit Voice AI Prompt call:");
  console.log("Tool Call:", toolCall);
  console.log("Current Prompt:", currentPrompt);
  console.log(
    "Conversation Transcript:",
    JSON.stringify(conversationTranscript, null, 2)
  );

  try {
    // Extract the prompt change instruction from the tool call
    const promptChangeInstruction =
      toolCall?.function?.arguments?.prompt_change_instruction;

    if (!promptChangeInstruction) {
      return res.status(400).json({
        status: "error",
        message: "Missing prompt_change_instruction in tool call",
      });
    }

    // Generate the new prompt
    const newPrompt = await editPrompt(
      currentPrompt,
      conversationTranscript,
      promptChangeInstruction
    );

    console.log("Generated new prompt:", newPrompt);

    res.status(200).json({
      status: "ok",
      message: "Successfully generated new prompt",
      newPrompt: newPrompt,
      transcriptLength: conversationTranscript?.length || 0,
      promptLength: currentPrompt?.length || 0,
    });
  } catch (error) {
    console.error("Error processing edit prompt request:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate new prompt",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
