import React, { useEffect, useState } from "react";

const App: React.FC = () => {
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    fetch("/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage("Error: " + err.toString()));
  }, []);

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        textAlign: "center",
        marginTop: "2rem",
      }}
    >
      <h1>{message}</h1>
    </div>
  );
};

export default App;
