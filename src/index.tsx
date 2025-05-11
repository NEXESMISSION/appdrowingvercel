import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import './styles/reset.css';
import reportWebVitals from './reportWebVitals';

// Import the regular App component
const App = lazy(() => import('./App'));

// Import the minimal app as a fallback
const MinimalApp = lazy(() => import('./MinimalApp'));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// Create a component that attempts to render the main App with a fallback
const AppWithFallback = () => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    // Set a timeout to check if the app has rendered properly
    const timeoutId = setTimeout(() => {
      // Check if the app has rendered anything
      const appElement = document.querySelector('.app');
      if (!appElement) {
        console.log('App component failed to render properly, using fallback...');
        setHasError(true);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, []);

  if (hasError) {
    return <MinimalApp />;
  }

  return (
    <Suspense fallback={<div style={{ backgroundColor: '#111827', color: '#fff', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>}>
      <App />
    </Suspense>
  );
};

root.render(
  <React.StrictMode>
    <AppWithFallback />
  </React.StrictMode>
);

reportWebVitals();