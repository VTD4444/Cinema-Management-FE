import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout';
import useAdminAuthStore from './store/useAdminAuthStore';
import useUserAuthStore from './store/useUserAuthStore';
import { hasAdminSession, hasUserSession } from './store/authSession';
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
import UserMovies from './pages/UserMovies';
import UserMovieDetail from './pages/UserMovieDetail';
import UserActorDetail from './pages/UserActorDetail';
import UserCinemaSystem from './pages/UserCinemaSystem';
import UserSearch from './pages/UserSearch';
import Profile from './pages/Profile';
import MyVouchers from './pages/MyVouchers';
import MyTickets from './pages/MyTickets';
import UserContact from './pages/UserContact';
import AboutUs from './pages/AboutUs';
import MovieDetails from './pages/MovieDetails';
import SeatSelection from './pages/SeatSelection';
import OrderSummary from './pages/OrderSummary';
import PaymentResult from './pages/PaymentResult';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const adminUser = useAdminAuthStore((state) => state.user);
  const hasAdminToken = hasAdminSession();
  const role = adminUser?.role;

  if (!isAuthenticated && !hasAdminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  if (role && role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

const AdminRootRedirect = () => {
  const isAuthenticated = useAdminAuthStore((state) => state.isAuthenticated);
  const hasAdminToken = hasAdminSession();

  if (isAuthenticated || hasAdminToken) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/admin/login" replace />;
};

const UserRootRedirect = () => {
  if (typeof window !== 'undefined') {
    const search = window.location.search;
    if (search.includes('vnp_ResponseCode')) {
      return <Navigate to={`/payment-result${search}`} replace />;
    }
  }

  return <Navigate to="/home" replace />;
};

const UserProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useUserAuthStore((state) => state.isAuthenticated);
  const hasUserToken = hasUserSession();

  if (!isAuthenticated && !hasUserToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ returnUrl: `${location.pathname}${location.search}` }}
      />
    );
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* User-facing routes */}
      <Route path="/" element={<UserRootRedirect />} />
      <Route path="/home" element={<UserHome />} />
      <Route path="/movie/:id" element={<MovieDetails />} />
      <Route
        path="/booking/:showtimeId"
        element={
          <UserProtectedRoute>
            <SeatSelection />
          </UserProtectedRoute>
        }
      />
      <Route
        path="/booking/:showtimeId/summary"
        element={
          <UserProtectedRoute>
            <OrderSummary />
          </UserProtectedRoute>
        }
      />
      <Route path="/payment-result" element={<PaymentResult />} />
      <Route path="/movies" element={<UserMovies />} />
      <Route path="/movies/:id" element={<UserMovieDetail />} />
      <Route path="/actors/:id" element={<UserActorDetail />} />
      <Route path="/cinemas" element={<UserCinemaSystem />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/search" element={<UserSearch />} />
      <Route
        path="/profile"
        element={
          <UserProtectedRoute>
            <Profile />
          </UserProtectedRoute>
        }
      />
      <Route
        path="/my-vouchers"
        element={
          <UserProtectedRoute>
            <MyVouchers />
          </UserProtectedRoute>
        }
      />
      <Route
        path="/my-tickets"
        element={
          <UserProtectedRoute>
            <MyTickets />
          </UserProtectedRoute>
        }
      />
      <Route path="/contact" element={<UserContact />} />
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

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
