import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './components/UploadPage';
import TracingPage from './components/TracingPage';
import LandingPage from './landing/LandingPage';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/tracing" element={<TracingPage />} />
          <Route path="/app" element={<UploadPage />} />
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;