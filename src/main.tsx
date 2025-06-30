import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress React DevTools warning in development
if (import.meta.env.DEV) {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    if (args[0]?.includes?.('Download the React DevTools')) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

// Global error handler for postMessage and other errors
window.addEventListener('error', (event) => {
  if (event.message?.includes?.('postMessage')) {
    event.preventDefault();
    console.warn('PostMessage error suppressed:', event.message);
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes?.('postMessage')) {
    event.preventDefault();
    console.warn('PostMessage promise rejection suppressed:', event.reason);
    return false;
  }
});

// Only import Superdev if environment variables are set
if (import.meta.env.VITE_APP_ID && import.meta.env.VITE_SUPERDEV_BASE_URL) {
  import("@/lib/superdev/client");
}

createRoot(document.getElementById("root")!).render(<App />);
