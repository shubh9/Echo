/// <reference types="vite/client" />
import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";

// Vite exposes env vars as import.meta.env
const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY as string | undefined;
// We will generate a fresh assistant each call using the provided prompt.

export default function useVapi() {
  const vapiRef = useRef<any>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [lastFunctionCall, setLastFunctionCall] = useState<any>(null);
  const [conversationTranscript, setConversationTranscript] = useState<any[]>(
    []
  );
  const [currentPrompt, setCurrentPrompt] = useState<string>("default");

  const init = useCallback(() => {
    if (!PUBLIC_KEY) {
      console.warn("Vapi public key not set – check your .env file");
      return;
    }
    if (!vapiRef.current) {
      const instance = new Vapi(PUBLIC_KEY);
      vapiRef.current = instance;

      instance.on("call-start", () => {
        setIsSessionActive(true);
        setIsLoading(false);
        setConversationTranscript([]); // Reset transcript on new call
      });

      instance.on("call-end", () => {
        setIsSessionActive(false);
        setIsLoading(false);
      });

      instance.on("volume-level", (v: number) => setVolumeLevel(v));

      instance.on("error", (e: Error) => {
        console.error("Vapi error:", e);
        setIsLoading(false);
      });
    }
  }, []);

  // Set up message handler with proper dependencies
  useEffect(() => {
    if (!vapiRef.current) return;

    const handleMessage = (message: any) => {
      // Track conversation messages for transcript
      if (message?.type === "conversation-update") {
        //   console.log("Conversation update:", message);
        // Extract simplified transcript with just role and message
        const simplifiedMessages = message.messages
          ?.filter((msg: any) => msg.role && msg.message)
          .map((msg: any) => ({
            role: msg.role,
            message: msg.message,
          }));

        if (simplifiedMessages && simplifiedMessages.length > 0) {
          setConversationTranscript(simplifiedMessages);
        }
      }

      if (message?.type === "tool-calls") {
        const toolCall = message.toolCallList?.[0];
        if (!toolCall) return;

        console.log("Received tool call:", toolCall);
        setLastFunctionCall(toolCall);

        // Now we can safely use current state values directly!
        fetch("/api/edit-voice-ai-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolCall,
            conversationTranscript, // ✅ Fresh value!
            currentPrompt, // ✅ Fresh value!
          }),
        }).catch((err) => console.error("Failed to call endpoint", err));
      }
    };

    vapiRef.current.on("message", handleMessage);

    return () => {
      vapiRef.current?.off("message", handleMessage);
    };
  }, [conversationTranscript, currentPrompt]); // Re-run when either changes

  useEffect(() => {
    init();
    return () => {
      vapiRef.current?.stop();
      vapiRef.current = null;
    };
  }, [init]);

  const toggleCall = async (prompt: string) => {
    if (!vapiRef.current) return;

    console.log("Toggling call with prompt:", prompt);
    // Store the current prompt in state
    setCurrentPrompt(prompt);

    try {
      if (isSessionActive) {
        await vapiRef.current.stop();
      } else {
        setIsLoading(true);
        const assistantConfig = {
          clientMessages: ["tool-calls", "conversation-update"],
          model: {
            provider: "openai",
            model: "gpt-4o",
            temperature: 0.7,
            messages: [
              {
                role: "system",
                content: prompt,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "edit_voice_ai_prompt",
                  description: "Edit Voice AI Prompt",
                  parameters: {
                    type: "object",
                    properties: {},
                  },
                },
              },
            ],
          },
          voice: {
            provider: "11labs",
            voiceId: "burt",
          },
          transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "en",
          },
        } as any;

        await vapiRef.current.start(assistantConfig);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return {
    toggleCall,
    isSessionActive,
    isLoading,
    volumeLevel,
    lastFunctionCall,
    conversationTranscript,
  };
}
