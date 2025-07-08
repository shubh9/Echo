import React from "react";
import { usePrompt } from "../contexts/PromptContext";
import VoiceAgentButton from "./VoiceAgentButton";

const VoiceAgentPanel: React.FC = () => {
  const { prompt, setPrompt } = usePrompt();

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={8}
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
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#4f46e5";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e1e5e9";
        }}
      />
      <div style={{ marginTop: 20 }}>
        <VoiceAgentButton />
      </div>
    </div>
  );
};

export default VoiceAgentPanel;
