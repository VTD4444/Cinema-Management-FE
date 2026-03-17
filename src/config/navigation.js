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
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Phim',
    href: '/admin/movies',
    icon: Film,
    children: [
      { name: 'Danh sách Phim', href: '/admin/movies' },
      { name: 'Thể loại', href: '/admin/movies/genres' },
    ],
  },
  {
    name: 'Rạp',
    href: '/admin/cinemas',
    icon: MonitorPlay,
    children: [
      { name: 'Tỉnh/Thành phố', href: '/admin/cinemas/cities' },
      { name: 'Danh sách Rạp', href: '/admin/cinemas' },
      { name: 'Phòng chiếu & Ghế', href: '/admin/cinemas/rooms' },
      { name: 'Ghế', href: '/admin/cinemas/seats' },
    ],
  },
  {
    name: 'Lịch chiếu',
    href: '/admin/showtimes',
    icon: CalendarDays,
  },
  {
    name: 'Đồ ăn / Thức uống',
    href: '/admin/foods',
    icon: Utensils,
  },
  {
    name: 'Voucher',
    href: '/admin/vouchers',
    icon: Ticket,
  },
  {
    name: 'Check-in',
    href: '/admin/check-in',
    icon: ScanLine,
  },
  {
    name: 'Đơn hàng',
    href: '/admin/orders',
    icon: Receipt,
  },
  {
    name: 'Người dùng',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Phản hồi',
    href: '/admin/feedbacks',
    icon: MessageSquare,
  },
];
