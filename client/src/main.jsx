import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { RainbowKitProviderWrapper } from "./Providers/RainbowKitProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RainbowKitProviderWrapper>
      <App />
    </RainbowKitProviderWrapper>
  </StrictMode>
);
