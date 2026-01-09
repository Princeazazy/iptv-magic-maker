import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ignore noisy errors coming from browser extensions (e.g. MetaMask) so they don't break the preview.
const isExtensionError = (payload: unknown) => {
  const text =
    typeof payload === "string"
      ? payload
      : payload && typeof payload === "object"
        ? JSON.stringify(payload)
        : "";
  return text.includes("chrome-extension://") || text.includes("MetaMask");
};

window.addEventListener("unhandledrejection", (event) => {
  const reason = (event as PromiseRejectionEvent).reason;
  const stack = reason?.stack ?? "";
  const message = reason?.message ?? "";

  if (isExtensionError(stack) || isExtensionError(message) || isExtensionError(reason)) {
    event.preventDefault();
  }
});

window.addEventListener("error", (event) => {
  const filename = (event as ErrorEvent).filename ?? "";
  const message = (event as ErrorEvent).message ?? "";

  if (isExtensionError(filename) || isExtensionError(message)) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
