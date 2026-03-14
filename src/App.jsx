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
import Foods from './pages/Foods';
import Vouchers from './pages/Vouchers';
import Orders from './pages/Orders';
import Users from './pages/Users';
import Checkins from './pages/Checkins';
import Feedbacks from './pages/Feedbacks';
import Login from './pages/Login';
function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Area */}
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
        <Route path="/foods" element={<Foods />} />
        <Route path="/vouchers" element={<Vouchers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/users" element={<Users />} />
        <Route path="/feedbacks" element={<Feedbacks />} />
        <Route path="/check-in" element={<Checkins />} />

        {/* Fallback route - could be a 404 page later */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
