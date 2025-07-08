import express from "express";
import { generate } from "./llmService";

const app = express();

app.use(express.json());

// Function to edit the prompt using LLM
async function editPrompt(
  currentPrompt: string,
  conversationTranscript: Array<{ role: string; message: string }>,
  promptChangeInstruction: string
): Promise<string> {
  // Create a detailed prompt for the LLM to generate a new prompt
  const llmPrompt = `You are **PromptSmith**, an expert prompt-engineer whose job is to **revise existing AI-assistant prompts**—not necessarily create them from scratch.

Current Prompt (to be edited):
\`\`\`
${currentPrompt}
\`\`\`

Conversation Transcript (context):
\`\`\`
${conversationTranscript
  .map((msg) => `${msg.role}: ${msg.message}`)
  .join("\\n")}
\`\`\`

Requested Changes:
\`\`\`
${promptChangeInstruction}
\`\`\`

---

## Your Revision Strategy

1. **Detect scope**
   - If the *Current Prompt* is **short or poorly structured** (≈ < 300 words **or** missing clear sections), **re-format it** using the *Writing Standards* and *Output Format* below.  
   - Otherwise, **preserve the original structure** and **apply only the minimal edits** needed to satisfy *Requested Changes*.

2. **Always keep core intent intact.**

3. **Do not add explanatory notes, headings, or boilerplate that weren’t asked for unless rule 1 requires a full re-format.**

---

### Writing Standards *(apply only when a full re-format is warranted)*

- Plain, jargon-free language unless domain demands it  
- One intent per sentence/question  
- Read-back confirmations for critical data (dates, amounts, names)  
- Empathetic yet efficient tone  
- No paragraph > 120 words  

### Output Format *(when re-formatting)*

Use these H2 sections—**exactly in this order**:

1. Identity & Purpose  
2. Voice & Persona  
3. Conversation Flow  
4. Response Guidelines  
5. Scenario Handling  
6. Knowledge Base  
7. Response Refinement  
8. Call / Session Management  
9. Success Reminder  

---

## Deliverable

- **Return only the revised prompt text.**  
- If no change is necessary, return the *Current Prompt* verbatim.

`;

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

// Root endpoint
app.get("/", (_req, res) => {
  res.json({ message: "hello world" });
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

// For local development
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// Export for Vercel
export default app;
