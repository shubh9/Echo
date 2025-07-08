/// <reference types="vite/client" />
import { useEffect, useRef, useState, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import { usePrompt } from "../contexts/PromptContext";

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
  const { prompt, setPrompt } = usePrompt();

  const functionCallPromptAddition =
    "### Tool Call Instructions: If the user asks you to change something about you or what you said, they are likely refering to the prompt, call the edit voice prompt function";

  // --- Hold music setup (bare-bones HTML5 Audio) ---
  const holdMusicRef = useRef<HTMLAudioElement | null>(null);

  // Create the Audio instance once when the hook mounts
  useEffect(() => {
    // Randomly choose between the two audio files
    // 80% chance for slack_jazz.mp3, 20% chance for snake_jazz.mp3
    const randomChoice = Math.random();
    console.log("Random choice:", randomChoice);
    const audioFile =
      randomChoice < 0.8 ? "/slack_jazz.mp3" : "/snake_jazz.mp3";

    holdMusicRef.current = new Audio(audioFile);
    holdMusicRef.current.loop = true;
    holdMusicRef.current.volume = 0.5; // Set volume to 50%
  }, []);

  const playHoldMusic = () => holdMusicRef.current?.play();
  const stopHoldMusic = () => {
    if (!holdMusicRef.current) return;
    holdMusicRef.current.pause();
    holdMusicRef.current.currentTime = 0;
  };

  const stopSessionAndResetTranscript = useCallback(() => {
    vapiRef.current?.stop();
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

        // Stop the current session before modifying the prompt
        stopSessionAndResetTranscript();

        // Play hold music while we wait for the backend response
        playHoldMusic();

        // Call our backend to get the updated prompt
        fetch("/api/edit-voice-ai-prompt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            toolCall,
            conversationTranscript,
            currentPrompt: prompt,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Edit prompt response:", data);
            if (!data.newPrompt) {
              throw new Error("No new prompt found in edit prompt response");
            }
            setPrompt(data.newPrompt);
            startCall(data.newPrompt);
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

  const startCall = async (promptToUse: string) => {
    if (!vapiRef.current) {
      console.log("No Vapi instance found");
      return;
    }

    console.log("Starting call with prompt:", promptToUse);
    try {
      // If a session is already active, stop it before starting a new one
      if (isSessionActive) {
        await vapiRef.current.stop();
      }

      setIsLoading(true);

      const assistantConfig = {
        firstMessage: "Hi how are you?",
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

      await vapiRef.current.start(assistantConfig);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const toggleCall = async (promptToUse: string) => {
    if (!vapiRef.current) {
      console.log("No Vapi instance found");
      return;
    }

    console.log("Toggling call with prompt:", promptToUse);

    if (isSessionActive) {
      await vapiRef.current.stop();
    } else {
      await startCall(promptToUse);
    }
  };

  return {
    toggleCall,
    startCall,
    stopSessionAndResetTranscript,
    isSessionActive,
    isLoading,
    volumeLevel,
    lastFunctionCall,
    conversationTranscript,
  };
}
