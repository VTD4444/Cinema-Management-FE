import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout';
import Dashboard from './pages/Dashboard';
import Movies from './pages/Movies';
import Genres from './pages/Genres';
import Cities from './pages/Cities';
import Cinemas from './pages/Cinemas';
import Rooms from './pages/Rooms';
import Seats from './pages/Seats';
import Placeholder from './pages/Placeholder';
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
        <Route path="/movies/genres" element={<Genres />} />
        <Route path="/cinemas/cities" element={<Cities />} />
        <Route path="/cinemas" element={<Cinemas />} />
        <Route path="/cinemas/rooms" element={<Rooms />} />
        <Route path="/cinemas/seats" element={<Seats />} />
        <Route path="/showtimes" element={<Showtimes />} />
        <Route path="/services" element={<Services />} />

        {/* Fallback route - could be a 404 page later */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
