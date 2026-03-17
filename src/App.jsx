import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout';
import useAuthStore from './store/useAuthStore';
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
import UserLogin from './pages/UserLogin';
import UserRegister from './pages/UserRegister';
import UserForgotPassword from './pages/UserForgotPassword';
import UserHome from './pages/UserHome';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');
  const role = user?.role || (typeof window !== 'undefined' && localStorage.getItem('userRole'));

  // Chưa đăng nhập → về trang login admin
  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/admin/login" replace />;
  }

  // Đã đăng nhập nhưng không phải ADMIN → về login admin
  if (role && role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

const AdminRootRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('accessToken');

  if (isAuthenticated || hasToken) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/admin/login" replace />;
};

const UserRootRedirect = () => {
  const hasUserToken = typeof window !== 'undefined' && localStorage.getItem('userAccessToken');

  if (hasUserToken) {
    return <Navigate to="/home" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* User-facing routes */}
      <Route path="/" element={<UserRootRedirect />} />
      <Route path="/home" element={<UserHome />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/forgot-password" element={<UserForgotPassword />} />

      {/* Admin public routes */}
      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminRootRedirect />} />

      {/* Admin protected area */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/movies" element={<Movies />} />
        <Route path="/admin/movies/genres" element={<Genres />} />
        <Route path="/admin/cinemas/cities" element={<Cities />} />
        <Route path="/admin/cinemas" element={<Cinemas />} />
        <Route path="/admin/cinemas/rooms" element={<Rooms />} />
        <Route path="/admin/cinemas/seats" element={<Seats />} />
        <Route path="/admin/showtimes" element={<Showtimes />} />
        <Route path="/admin/foods" element={<Foods />} />
        <Route path="/admin/vouchers" element={<Vouchers />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/feedbacks" element={<Feedbacks />} />
        <Route path="/admin/check-in" element={<Checkins />} />

        {/* Fallback route trong khu vực admin */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
