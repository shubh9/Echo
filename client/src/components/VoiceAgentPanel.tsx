import React, { useRef, useEffect } from "react";
import { usePrompt } from "../contexts/PromptContext";
import VoiceAgentButton from "./VoiceAgentButton";

// Textarea height constants
const MIN_HEIGHT = 120; // Minimum height in pixels
const MAX_HEIGHT = 500; // Maximum height in pixels

// First message input height constants
const FIRST_MESSAGE_MIN_HEIGHT = 38; // Minimum height for first message input
const FIRST_MESSAGE_MAX_HEIGHT = 76; // Maximum height for first message input (3 rows)

const VoiceAgentPanel: React.FC = () => {
  const { prompt, setPrompt, firstMessage, setFirstMessage } = usePrompt();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const firstMessageRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to get the correct scrollHeight
      textareaRef.current.style.height = "auto";
      // Set height to scrollHeight (content height) or minimum height
      const scrollHeight = textareaRef.current.scrollHeight;
      const newHeight = Math.min(
        Math.max(scrollHeight, MIN_HEIGHT),
        MAX_HEIGHT
      );
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [prompt]);

  // Auto-resize first message input based on content
  useEffect(() => {
    if (firstMessageRef.current) {
      // Reset height to auto to get the correct scrollHeight
      firstMessageRef.current.style.height = "auto";
      // Set height to scrollHeight (content height) or minimum height
      const scrollHeight = firstMessageRef.current.scrollHeight;
      const newHeight = Math.min(
        Math.max(scrollHeight, FIRST_MESSAGE_MIN_HEIGHT),
        FIRST_MESSAGE_MAX_HEIGHT
      );
      firstMessageRef.current.style.height = `${newHeight}px`;
    }
  }, [firstMessage]);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <VoiceAgentButton />
      </div>

      {/* Header and small text input for agent's first message */}
      {/* <h3 style={{ margin: 0, marginBottom: 8 }}>Agent Speaks on Start</h3> */}
      <textarea
        ref={firstMessageRef}
        value={firstMessage}
        placeholder="Agent's first message (optional)"
        onChange={(e) => setFirstMessage(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 8,
          fontSize: 14,
          padding: 8,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          lineHeight: 1.4,
          border: "1px solid #e1e5e9",
          boxSizing: "border-box",
          outline: "none",
          transition: "border-color 0.2s ease",
          marginBottom: 20,
          resize: "none",
          minHeight: FIRST_MESSAGE_MIN_HEIGHT,
          maxHeight: FIRST_MESSAGE_MAX_HEIGHT,
          overflow: "auto",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#4f46e5";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e1e5e9";
        }}
      />

      {/* Header for the main prompt textarea */}
      {/* <h3 style={{ margin: 0, marginBottom: 8 }}>Agent Prompt</h3> */}

      {/* Existing large textarea for the full prompt */}
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Agent Prompt"
        style={{
          width: "100%",
          maxWidth: 800,
          borderRadius: 12,
          fontSize: 16,
          padding: 12,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          lineHeight: 1.5,
          border: "1px solid #e1e5e9",
          resize: "vertical",
          boxSizing: "border-box",
          outline: "none",
          transition: "border-color 0.2s ease",
          minHeight: MIN_HEIGHT,
          maxHeight: MAX_HEIGHT,
          overflow: "auto",
          marginBottom: 10,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#4f46e5";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e1e5e9";
        }}
      />

      {/* Descriptive text below the panel */}
      {/* <p
        style={{
          fontSize: 14,
          color: "#e5e7eb",
          textAlign: "center",
          margin: 0,
          marginTop: 0,
          maxWidth: 600,
          lineHeight: 1.5,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        }}
      >
        Paste in a prompt or ask the voice to write a prompt for you. As you ask
        for changes it will continually improve the prompt above
      </p> */}
    </div>
  );
};

export default VoiceAgentPanel;
