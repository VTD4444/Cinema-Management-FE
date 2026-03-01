import {
  LayoutDashboard,
  Film,
  MonitorPlay,
  CalendarDays,
  Utensils,
  Ticket,
  ScanLine,
  Receipt,
  Users,
} from 'lucide-react';

export const NAVIGATION_ITEMS = [
  {
    name: 'Tổng quan',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Phim',
    href: '/movies',
    icon: Film,
    children: [
      { name: 'Danh sách Phim', href: '/movies' },
      { name: 'Thể loại', href: '/movies/genres' },
    ],
  },
  {
    name: 'Rạp',
    href: '/cinemas',
    icon: MonitorPlay,
  },
  {
    name: 'Lịch chiếu',
    href: '/showtimes',
    icon: CalendarDays,
  },
  {
    name: 'Dịch vụ',
    href: '/services',
    icon: Utensils,
  },
  {
    name: 'Voucher',
    href: '/vouchers',
    icon: Ticket,
  },
  {
    name: 'Check-in',
    href: '/check-in',
    icon: ScanLine,
  },
  {
    name: 'Đơn hàng',
    href: '/orders',
    icon: Receipt,
  },
  {
    name: 'Người dùng',
    href: '/users',
    icon: Users,
  },
];
