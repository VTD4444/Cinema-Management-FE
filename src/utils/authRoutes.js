const USER_AUTH_REQUIRED_PREFIXES = [
  '/profile',
  '/my-vouchers',
  '/my-tickets',
  '/booking',
];

/** Các route user xem được khi chưa đăng nhập */
export const isUserPublicRoute = (pathname) => {
  if (pathname === '/') return true;
  if (pathname === '/home') return true;
  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') return true;
  if (pathname === '/about' || pathname === '/search' || pathname === '/contact') return true;
  if (pathname === '/payment-result') return true;
  if (pathname === '/movies' || pathname.startsWith('/movies/')) return true;
  if (pathname === '/movie' || pathname.startsWith('/movie/')) return true;
  if (pathname === '/actors' || pathname.startsWith('/actors/')) return true;
  if (pathname === '/cinemas' || pathname.startsWith('/cinemas/')) return true;
  return false;
};

export const isUserAuthRequiredRoute = (pathname) => {
  if (pathname.startsWith('/admin')) return false;
  return USER_AUTH_REQUIRED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
};
