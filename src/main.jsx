import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

const renderFatal = (errorLike) => {
  const message =
    (errorLike && (errorLike.stack || errorLike.message)) ||
    'Application failed to start.';

  root.render(
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: '#fff',
        background: '#000',
        fontFamily: 'Helvetica, Inter, system-ui, sans-serif'
      }}
    >
      <div style={{ maxWidth: 840, width: '100%' }}>
        <h1 style={{ marginBottom: '1rem', opacity: 1 }}>Startup Error</h1>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            opacity: 0.9
          }}
        >
          {String(message)}
        </pre>
      </div>
    </div>
  );
};

window.addEventListener('error', (event) => {
  if (event?.error) renderFatal(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  renderFatal(event?.reason || 'Unhandled promise rejection');
});

const bootstrap = async () => {
  try {
    const { default: App } = await import('./App.jsx');
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    renderFatal(error);
  }
};

bootstrap();
