import React, { useRef, useEffect } from "react";
import { usePrompt } from "../contexts/PromptContext";
import VoiceAgentButton from "./VoiceAgentButton";

// Textarea height constants
const MIN_HEIGHT = 120; // Minimum height in pixels
const MAX_HEIGHT = 500; // Maximum height in pixels

const VoiceAgentPanel: React.FC = () => {
  const { prompt, setPrompt } = usePrompt();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      <textarea
        ref={textareaRef}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 800,
          borderRadius: 12,
          fontSize: 16,
          padding: 20,
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
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#4f46e5";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e1e5e9";
        }}
      />
    </div>
  );
};

export default VoiceAgentPanel;
