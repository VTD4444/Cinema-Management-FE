import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import Showtimes from './pages/Showtimes';
import Services from './pages/Services';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        {/* Default route redirects to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/showtimes" element={<Showtimes />} />
        <Route path="/services" element={<Services />} />

        {/* Fallback route - could be a 404 page later */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
