import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log('[main.tsx] Application starting...');

// Global error handler
window.addEventListener('error', (event) => {
  console.error('[Global Error Handler]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', {
    reason: event.reason,
    promise: event.promise
  });
});

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  console.log('[main.tsx] Root element found, creating React root...');
  createRoot(rootElement).render(<App />);
  console.log('[main.tsx] App rendered successfully');
} catch (error) {
  console.error('[main.tsx] Failed to render app:', error);
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-center; min-height: 100vh; flex-direction: column; padding: 20px; text-align: center;">
      <h1 style="color: #ef4444; margin-bottom: 16px;">앱 로딩 실패</h1>
      <p style="color: #64748b; margin-bottom: 8px;">애플리케이션을 시작할 수 없습니다.</p>
      <pre style="background: #f1f5f9; padding: 16px; border-radius: 8px; overflow: auto; max-width: 100%;">${error}</pre>
    </div>
  `;
}
