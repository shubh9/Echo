import React, { useState } from "react";
import VoiceAgentPanel from "./components/VoiceAgentPanel";
import { PromptProvider } from "./contexts/PromptContext";
import { SERVER_URL } from "./hooks/useVapi";

const gradientBackground =
  "radial-gradient(circle at 50% -20%, #5B6BFF 0%, #5B6BFF 5%, #4650FF 20%, #3733FF 35%, #D34AFF 60%, #FF616D 75%, #FF9961 90%)";

const App: React.FC = () => {
  const [helloResponse, setHelloResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const callHelloEndpoint = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/hello`);
      const data = await response.json();
      setHelloResponse(data.message);
    } catch (error) {
      console.error("Error calling hello endpoint:", error);
      setHelloResponse("Error calling endpoint");
    } finally {
      setIsLoading(false);
    }
  };

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

          <div style={{ marginTop: "2rem", marginBottom: "1rem" }}>
            <button
              onClick={callHelloEndpoint}
              disabled={isLoading}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "12px 24px",
                color: "#ffffff",
                fontSize: "16px",
                fontWeight: 500,
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
                backdropFilter: "blur(10px)",
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {isLoading ? "Calling..." : "Call Hello Endpoint"}
            </button>

            {helloResponse && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "12px 20px",
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  fontSize: "14px",
                  color: "#ffffff",
                  maxWidth: "400px",
                  margin: "1rem auto 0",
                }}
              >
                {helloResponse}
              </div>
            )}
          </div>

          <div style={{ marginTop: "1rem" }}>
            <VoiceAgentPanel />
          </div>
        </div>
      </div>
    </PromptProvider>
  );
};

export default App;
