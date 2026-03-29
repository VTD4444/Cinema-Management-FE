import React, { useState } from 'react';
import UserLayout from '../components/layout/UserLayout';
import { Calendar, MapPin, CheckCircle2, AlertCircle, Hourglass } from 'lucide-react';

const MOCK_TICKETS = [
  {
    id: 'ORD-8823',
    status: 'success',
    movie: {
      title: 'Dune: Part Two',
      poster: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2JGjjc9CW.jpg',
      genres: 'Hành động, Phiêu lưu',
      duration: '2h 46p',
      format: 'IMAX 2D'
    },
    showtime: {
      date: '12/10/2023',
      time: '19:30',
      cinema: 'CinemaPlus Downtown'
    },
    seats: 'F12, F13, F14 (Hall 4)',
    totalPrice: 240000
  },
  {
    id: 'ORD-9021',
    status: 'processing',
    movie: {
      title: 'Kung Fu Panda 4',
      poster: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
      genres: 'Hoạt hình, Hài',
      duration: '1h 34p',
      format: 'Standard 2D'
    },
    showtime: {
      date: '14/10/2023',
      time: '14:00',
      cinema: 'CinemaPlus Vincom'
    },
    seats: 'E4, E5 (Hall 2)',
    totalPrice: 270000
  },
  {
    id: 'ORD-7712',
    status: 'failed',
    movie: {
      title: 'Godzilla x Kong',
      poster: 'https://image.tmdb.org/t/p/w500/tMefBSflR6PGQLvLuPEHZotcX0.jpg',
      genres: 'Hành động, Khoa học viễn tưởng',
      duration: '1h 55p',
      format: 'IMAX 3D'
    },
    showtime: {
      date: '10/10/2023',
      time: '20:15',
      cinema: 'CinemaPlus Vincom'
    },
    seats: 'G10, G11 (Hall 5)',
    totalPrice: 210000
  }
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const TicketCard = ({ ticket }) => {
  const isSuccess = ticket.status === 'success';
  const isProcessing = ticket.status === 'processing';
  const isFailed = ticket.status === 'failed';

  return (
    <div className="flex flex-col md:flex-row bg-[#1c1c1c] border border-zinc-800 rounded-2xl overflow-hidden p-5 gap-6">
      {/* Poster */}
      <div className="w-24 md:w-32 shrink-0 rounded-xl overflow-hidden bg-zinc-800 aspect-[2/3]">
        <img src={ticket.movie.poster} alt={ticket.movie.title} className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-4 mb-4 md:mb-0">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{ticket.movie.title}</h3>
            <p className="text-sm text-zinc-400 mb-4">{ticket.movie.genres} • {ticket.movie.duration}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-300">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>{ticket.showtime.date} - {ticket.showtime.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="line-clamp-1">{ticket.showtime.cinema}</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 18V9C4 7.89543 4.89543 7 6 7H18C19.1046 7 20 7.89543 20 9V18M4 18H20M4 18V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Ghế: <span className="text-white font-medium">{ticket.seats}</span></span>
              </div>
            </div>
          </div>
          <span className="text-red-500 font-bold text-sm tracking-wider whitespace-nowrap hidden md:block">
            {ticket.movie.format}
          </span>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-zinc-800 my-4" />

        {/* Footer Area / Action Area */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-3">
            <div className="text-xs text-zinc-500 flex items-center gap-3">
              <span>Mã vé: <span className="text-zinc-300">#{ticket.id}</span></span>
              <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
              <span>Tổng tiền: <span className="text-zinc-300">{formatCurrency(ticket.totalPrice)}</span></span>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center gap-2 text-sm font-medium">
              {isSuccess && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-green-500">Thanh toán thành công</span>
                </>
              )}
              {isProcessing && (
                <>
                  <Hourglass className="w-4 h-4 text-yellow-500" />
                  <span className="text-yellow-500">Đang trong quá trình đặt hàng</span>
                </>
              )}
              {isFailed && (
                <>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-500">Thanh toán thất bại</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isSuccess && (
              <>
                <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-zinc-700 text-white text-sm font-medium hover:bg-zinc-800 transition-colors">
                  Xem chi tiết
                </button>
                <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><rect x="14" y="14" width="3" height="3"/></svg>
                  Xem QR vé
                </button>
              </>
            )}
            {isProcessing && (
              <button className="flex-1 sm:flex-none px-8 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">
                Tiếp tục
              </button>
            )}
            {isFailed && (
              <button className="flex-1 sm:flex-none px-6 py-2 rounded-lg border border-red-900/50 text-red-500 text-sm font-medium hover:bg-red-950/20 transition-colors">
                Đặt lại vé
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MyTickets = () => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'success', label: 'Hoàn thành' },
    { id: 'processing', label: 'Đang xử lý' },
    { id: 'failed', label: 'Đã hủy' }
  ];

  const filteredTickets = MOCK_TICKETS.filter(t => activeTab === 'all' || t.status === activeTab);

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-3xl font-bold mb-8">Vé của tôi</h1>
          
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-zinc-800 mb-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-red-600 rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredTickets.length > 0 ? (
              filteredTickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))
            ) : (
              <div className="py-20 text-center text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
                Không có vé nào trong mục này.
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default MyTickets;
