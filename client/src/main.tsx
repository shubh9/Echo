import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Global CSS reset to remove default margins and padding
document.documentElement.style.margin = "0";
document.documentElement.style.padding = "0";
document.body.style.margin = "0";
document.body.style.padding = "0";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
