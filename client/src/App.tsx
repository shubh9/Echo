import React from "react";
import VoiceAgentPanel from "./components/VoiceAgentPanel";
import { PromptProvider } from "./contexts/PromptContext";

const gradientBackground =
  "radial-gradient(circle at 50% -20%, #5B6BFF 0%, #5B6BFF 5%, #4650FF 20%, #3733FF 35%, #D34AFF 60%, #FF616D 75%, #FF9961 90%)";

const App: React.FC = () => {
  return (
    <PromptProvider>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          color: "#ffffff",
          textAlign: "center",
          padding: "4rem 1.5rem 0",
          background: gradientBackground,
          overflowX: "hidden",
        }}
      >
        <div style={{ maxWidth: 960, width: "100%" }}>
          <h1
            style={{
              fontSize: "clamp(2.25rem, 5vw + 1rem, 4rem)",
              fontWeight: 700,
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Build Voice Assistants through Voice... duh
          </h1>

          <div style={{ marginTop: "1rem" }}>
            <VoiceAgentPanel />
          </div>
        </div>
      </div>
    </PromptProvider>
  );
};

export default App;
