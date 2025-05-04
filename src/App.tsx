import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UploadPage from './components/UploadPage';
import TracingPage from './components/TracingPage';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/tracing" element={<TracingPage />} />
          <Route path="/" element={<UploadPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;