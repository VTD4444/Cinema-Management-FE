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
  MessageSquare,
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
    children: [
      { name: 'Tỉnh/Thành phố', href: '/cinemas/cities' },
      { name: 'Danh sách Rạp', href: '/cinemas' },
      { name: 'Phòng chiếu & Ghế', href: '/cinemas/rooms' },
      { name: 'Ghế', href: '/cinemas/seats' },
    ],
  },
  {
    name: 'Lịch chiếu',
    href: '/showtimes',
    icon: CalendarDays,
  },
  {
    name: 'Đồ ăn / Thức uống',
    href: '/foods',
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
  {
    name: 'Phản hồi',
    href: '/feedbacks',
    icon: MessageSquare,
  },
];
