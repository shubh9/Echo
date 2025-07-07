import React, { useState } from "react";
import VoiceAgentButton from "./VoiceAgentButton";

const defaultPrompt = `You are Echo Voice AI, a helpful assistant. Keep responses concise and friendly.`;

const VoiceAgentPanel: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(defaultPrompt);

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
        <VoiceAgentButton prompt={prompt} />
      </div>
    </div>
  );
};

export default VoiceAgentPanel;
