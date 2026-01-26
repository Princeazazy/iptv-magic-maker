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

// Lock screen orientation to landscape on supported devices
const lockLandscape = async () => {
  try {
    if (screen.orientation && 'lock' in screen.orientation) {
      await (screen.orientation as any).lock('landscape');
    }
  } catch (e) {
    // Orientation lock not supported or not allowed
    console.log('Orientation lock not available');
  }
};

// Attempt to lock orientation on first user interaction
document.addEventListener('click', lockLandscape, { once: true });
document.addEventListener('touchstart', lockLandscape, { once: true });

createRoot(document.getElementById("root")!).render(<App />);
