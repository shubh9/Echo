import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/hello", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Endpoint for Edit Voice AI Prompt function calls
app.post("/api/edit-voice-ai-prompt", (req, res) => {
  const { toolCall, conversationTranscript, currentPrompt } = req.body;

  console.log("Received Edit Voice AI Prompt call:");
  console.log("Tool Call:", toolCall);
  console.log("Current Prompt:", currentPrompt);
  console.log(
    "Conversation Transcript:",
    JSON.stringify(conversationTranscript, null, 2)
  );

  // Here you can process the conversation transcript and current prompt
  // For example, you might want to:
  // 1. Analyze the conversation to understand context
  // 2. Modify the prompt based on the conversation
  // 3. Store the conversation for later analysis
  // 4. Return a modified prompt or instructions

  res.status(200).json({
    status: "ok",
    message: "Received conversation transcript and current prompt",
    transcriptLength: conversationTranscript?.length || 0,
    promptLength: currentPrompt?.length || 0,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
