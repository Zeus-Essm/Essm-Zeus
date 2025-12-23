import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UNHANDLED PROMISE]', event.reason);
});

window.addEventListener('error', (event) => {
  console.error('[GLOBAL ERROR]', event.error || event.message);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);