/// <reference types="vite/client" />
import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { usePrompt } from "../contexts/PromptContext";

// Vite exposes env vars as import.meta.env
const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY as string | undefined;

// Server URL - use production URL in production, local proxy in development
export const SERVER_URL = import.meta.env.PROD
  ? "https://echo-server-eight.vercel.app"
  : "http://localhost:3000";

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
  const { prompt, setPrompt, firstMessage, setFirstMessage } = usePrompt();

  const functionCallPromptAddition =
    "### Tool Call Instructions: If the user asks you to change something about you or what you said or to write a prompt, they are likely refering to the prompt, call the edit voice prompt function";

  // --- Hold music setup (bare-bones HTML5 Audio) ---
  const holdMusicRef = useRef<HTMLAudioElement | null>(null);

  // We will create the audio element right before playing it. This guarantees
  // a fresh random track every time the hold music starts, so no setup is
  // needed at mount.

  // Play hold music – choose a random track each time we (re)start it
  const playHoldMusic = () => {
    // If we don't have an audio element yet (or it was cleared after stopping),
    // create a new one with a freshly-randomised track.
    if (!holdMusicRef.current) {
      const randomChoice = Math.random();
      const audioFile =
        randomChoice < 0.95 ? "/slack_jazz.mp3" : "/snake_jazz.mp3";

      holdMusicRef.current = new Audio(audioFile);
      holdMusicRef.current.loop = true;
      holdMusicRef.current.volume = 0.5; // 50% volume
    }

    holdMusicRef.current?.play();
  };

  const stopHoldMusic = () => {
    if (!holdMusicRef.current) return;
    holdMusicRef.current.pause();
    holdMusicRef.current.currentTime = 0;

    // Clear the reference so the next play picks a new random track
    holdMusicRef.current = null;
  };

  const stopSessionAndResetTranscript = useCallback(async () => {
    await vapiRef.current?.stop();
    console.log("Stopping session and resetting transcript");
    setTimeout(() => {
      playHoldMusic();
    }, 1000);
    setConversationTranscript([]);
  }, []);

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
          ?.filter(
            (msg: any) => msg.role && msg.message && msg.role !== "system"
          )
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

        // Stop the current session before modifying the prompt
        stopSessionAndResetTranscript();

        // Call our backend to get the updated prompt
        fetch(`${SERVER_URL}/edit-voice-ai-prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolCall,
            conversationTranscript,
            currentPrompt: prompt,
            firstMessage,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Edit prompt response:", data);
            if (!data.newPrompt) {
              throw new Error("No new prompt found in edit prompt response");
            }
            setPrompt(data.newPrompt);
            // Update first message if provided by the backend (can be empty)
            if (typeof data.newFirstMessage === "string") {
              setFirstMessage(data.newFirstMessage);
            }
            startCall(data.newPrompt, data.newFirstMessage);
          })
          .catch((err) => console.error("Failed to call endpoint", err))
          .finally(() => {
            // Ensure hold music stops regardless of success/failure
            stopHoldMusic();
          });
      }
    };

    vapiRef.current.on("message", handleMessage);

    return () => {
      vapiRef.current?.off("message", handleMessage);
    };
  }, [conversationTranscript, prompt]);

  useEffect(() => {
    init();
    return () => {
      vapiRef.current?.stop();
      vapiRef.current = null;
    };
  }, [init]);

  const startCall = async (promptToUse: string, firstMessageToUse?: string) => {
    if (!vapiRef.current) {
      console.log("No Vapi instance found");
      return;
    }

    try {
      // If a session is already active, stop it before starting a new one
      if (isSessionActive) {
        await vapiRef.current.stop();
      }

      setIsLoading(true);

      // Build assistant configuration dynamically so we omit `firstMessage` when empty.
      const assistantConfig: any = {
        clientMessages: ["tool-calls", "conversation-update"],
        model: {
          provider: "openai",
          model: "gpt-4o",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: promptToUse + functionCallPromptAddition,
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
                  properties: {
                    prompt_change_instruction: {
                      type: "string",
                      description:
                        "How the user wants the prompt to be changed or modified, have this be EXACTLY what the user said",
                    },
                  },
                  required: ["prompt_change_instruction"],
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

      // Only include firstMessage if it's not an empty string
      if (firstMessageToUse && firstMessageToUse.trim().length > 0) {
        assistantConfig.firstMessage = firstMessageToUse.trim();
      }

      await vapiRef.current.start(assistantConfig);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const toggleCall = async (
    promptToUse: string,
    firstMessageToUse?: string
  ) => {
    if (!vapiRef.current) {
      console.log("No Vapi instance found");
      return;
    }

    if (isSessionActive) {
      await vapiRef.current.stop();
    } else {
      await startCall(promptToUse, firstMessage);
    }
  };

  return {
    toggleCall,
    startCall,
    isSessionActive,
    isLoading,
    volumeLevel,
    lastFunctionCall,
    conversationTranscript,
  };
}
