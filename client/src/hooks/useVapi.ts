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

  useEffect(() => {
    init();
    return () => {
      vapiRef.current?.stop();
      vapiRef.current = null;
    };
  }, [init]);

  const toggleCall = async (prompt: string) => {
    if (!vapiRef.current) return;
    try {
      if (isSessionActive) {
        await vapiRef.current.stop();
      } else {
        setIsLoading(true);
        const assistantConfig = {
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

  return { toggleCall, isSessionActive, isLoading, volumeLevel };
}
