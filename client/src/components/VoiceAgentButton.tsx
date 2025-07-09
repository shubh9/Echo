import React from "react";
import useVapi from "../hooks/useVapi";
import { usePrompt } from "../contexts/PromptContext";

const VoiceAgentButton: React.FC = () => {
  const { prompt, firstMessage } = usePrompt();
  const { toggleCall, isSessionActive, isLoading, volumeLevel } = useVapi();

  const scale = isSessionActive ? 1 + volumeLevel * 0.3 : 1;

  const handleClick = () => {
    toggleCall(prompt, firstMessage);
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={isSessionActive ? "End call" : "Start voice"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 64,
        height: 64,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background: isSessionActive
          ? "linear-gradient(135deg,#ff6b6b,#ee5a52)"
          : "linear-gradient(135deg,#5B6BFF,#3733FF)",
        color: "#fff",
        fontSize: 24,
        transform: `scale(${scale})`,
        transition: "transform 0.1s ease",
      }}
    >
      {isLoading ? (
        "⟳"
      ) : isSessionActive ? (
        // Mic off icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 9v3a3 3 0 0 0 4.5 2.598" />
          <path d="M15 9v3a3 3 0 0 1-.465 1.611" />
          <path d="M12 3a3 3 0 0 1 3 3v3" />
          <path d="M9 6v3" />
          <line x1="3" y1="3" x2="21" y2="21" />
          <path d="M15 19v2" />
          <path d="M9 19v2" />
          <path d="M12 22v-3" />
        </svg>
      ) : (
        // Mic on icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="28"
          height="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 1a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10a7 7 0 0 1-7 7 7 7 0 0 1-7-7" />
          <line x1="12" y1="17" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      )}
    </button>
  );
};

export default VoiceAgentButton;
