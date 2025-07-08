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
        rows={6}
        style={{
          width: "100%",
          maxWidth: 640,
          borderRadius: 8,
          fontSize: 14,
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />
      <div style={{ marginTop: 16 }}>
        <VoiceAgentButton />
      </div>
    </div>
  );
};

export default VoiceAgentPanel;
