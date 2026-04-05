import React, { useState, useEffect } from 'react';
import UserLayout from '../components/layout/UserLayout';
import { Calendar, MapPin, CheckCircle2, AlertCircle, Hourglass, X, ScanLine } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { getMyOrderHistory } from '../api/orderApi';
import useAuthStore from '../store/useAuthStore';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const TicketCard = ({ ticket, onShowQR, onShowDetails }) => {
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
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">{ticket.movie.title}</h3>
              {/* Check-in badge */}
              {isSuccess && (
                ticket.checkedIn
                  ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <ScanLine className="w-3 h-3" /> Đã check-in
                    </span>
                  : <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <ScanLine className="w-3 h-3" /> Chưa check-in
                    </span>
              )}
            </div>
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
                <button 
                  onClick={() => onShowDetails(ticket)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-zinc-700 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  Xem chi tiết
                </button>
                <button 
                  onClick={() => onShowQR(ticket)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
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
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQrTicket, setSelectedQrTicket] = useState(null);
  const [selectedDetailTicket, setSelectedDetailTicket] = useState(null);

  const tabs = [
    { id: 'all', label: 'Tất cả', payload: '' },
    { id: 'success', label: 'Hoàn thành', payload: 'SUCCESS' },
    { id: 'processing', label: 'Đang xử lý', payload: 'PENDING' },
    { id: 'failed', label: 'Đã hủy', payload: 'FAILED' }
  ];

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const currentTab = tabs.find(t => t.id === activeTab);
        const params = { pageNo: 1, pageSize: 50 };
        if (currentTab && currentTab.payload) {
          params.order_status = currentTab.payload;
        }

        const res = await getMyOrderHistory(params);
        const dataItems = res?.data?.items || [];
        
        // Transform backend data to match TicketCard props
        const formatted = dataItems.map(item => {
          const dateObj = new Date(item.showtime);
          const duration = item.duration || 120;
          const runtimeH = Math.floor(duration / 60);
          const runtimeM = duration % 60;
          
          return {
            id: item.booking_code || `ORD-${item.order_id}`,
            status: item.payment_status === 'SUCCESS' ? 'success' : (item.payment_status === 'FAILED' ? 'failed' : 'processing'),
            // Nếu showtime đã qua thì khả năng cao là đã check-in (chưa có field riêng từ API)
            checkedIn: item.ticket_status === 'CHECKED_IN' || (new Date(item.showtime) < new Date()),
            movie: {
              title: item.movie_name || 'Phim rạp',
              poster: item.poster || 'https://via.placeholder.com/150',
              genres: Array.isArray(item.genres) ? item.genres.join(', ') : (item.genres || 'Đang cập nhật'),
              duration: runtimeH > 0 || runtimeM > 0 ? `${runtimeH}h ${runtimeM} phút` : 'N/A',
              format: 'Tiêu chuẩn',
            },
            showtime: {
              date: dateObj.toLocaleDateString('vi-VN'),
              time: dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              cinema: item.cinema || 'Rạp chiếu'
            },
            seats: `${(item.seats || []).join(', ')} (${item.room || 'Phòng chiếu'})`,
            ticketCodes: item.ticket_codes || [],
            totalPrice: item.total_amount || 0
          };
        });

        setTickets(formatted);

      } catch (error) {
        console.error("Lỗi lấy lịch sử vé", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [activeTab, user?.id]);

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
            {loading ? (
              <div className="py-20 text-center text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800/50 animate-pulse">
                Đang tải danh sách vé...
              </div>
            ) : tickets.length > 0 ? (
              tickets.map((ticket, idx) => (
                <TicketCard 
                  key={`${ticket.id}-${idx}`} 
                  ticket={ticket} 
                  onShowQR={setSelectedQrTicket} 
                  onShowDetails={setSelectedDetailTicket}
                />
              ))
            ) : (
              <div className="py-20 text-center text-zinc-500 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
                Không có vé nào trong mục này.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {selectedQrTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1c1c1c] border border-zinc-800 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-white uppercase tracking-wider">Mã vé điện tử</h3>
              <button onClick={() => setSelectedQrTicket(null)} className="text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-8 flex flex-col items-center bg-white overflow-y-auto max-h-[60vh]">
              
              <div className="bg-white p-2 rounded-xl mb-6">
                <QRCodeSVG 
                  value={selectedQrTicket.id} 
                  size={200}
                  level="H" // High error correction
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              </div>

              <span className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-1">Booking Code</span>
              <span className="text-3xl font-black text-black tracking-widest mb-6">{selectedQrTicket.id}</span>

              {/* Individual Seat Ticket Codes (if any) */}
              {selectedQrTicket.ticketCodes && selectedQrTicket.ticketCodes.length > 0 && (
                <div className="w-full pt-6 border-t border-zinc-200">
                  <h4 className="text-zinc-600 font-bold mb-3 text-center text-sm uppercase">Mã vé từng ghế</h4>
                  <div className="grid grid-cols-2 gap-3">
                     {selectedQrTicket.ticketCodes.map((code, index) => (
                       <div key={index} className="flex flex-col items-center bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                          <QRCodeSVG value={code} size={60} />
                          <span className="text-xs font-bold text-zinc-700 mt-2">{code}</span>
                       </div>
                     ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer details */}
            <div className="p-6 bg-[#141414] border-t border-zinc-800">
               <div className="text-center">
                 <div className="text-white font-bold mb-1 line-clamp-1">{selectedQrTicket.movie.title}</div>
                 <div className="text-zinc-400 text-xs">{selectedQrTicket.showtime.date} - {selectedQrTicket.showtime.time} • Ghế: {selectedQrTicket.seats}</div>
               </div>
               <button onClick={() => setSelectedQrTicket(null)} className="mt-6 w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors">
                 Đóng
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedDetailTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141414] border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl scale-100 animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-[#1c1c1c]">
              <h3 className="font-bold text-white text-lg">Chi tiết đơn hàng</h3>
              <button onClick={() => setSelectedDetailTicket(null)} className="text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700/50 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              
              {/* Movie info block */}
              <div className="flex gap-4">
                <img src={selectedDetailTicket.movie.poster} alt="poster" className="w-20 rounded-lg aspect-[2/3] object-cover bg-zinc-800" />
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{selectedDetailTicket.movie.title}</h4>
                  <p className="text-sm text-zinc-400 mb-2">{selectedDetailTicket.movie.genres} • {selectedDetailTicket.movie.duration}</p>
                  <span className="bg-zinc-800 text-red-500 text-xs font-bold px-2 py-1 rounded">{selectedDetailTicket.movie.format || 'STND'}</span>
                </div>
              </div>

              {/* Data table */}
              <div className="bg-[#1a1a1a] rounded-xl p-5 border border-zinc-800/50 space-y-4 text-sm">
                 <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Mã đặt chỗ (Booking)</span>
                    <span className="font-bold text-white">{selectedDetailTicket.id}</span>
                 </div>
                 <div className="w-full h-px bg-zinc-800 border-dashed" />
                 
                 <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Thời gian chiếu</span>
                    <span className="font-medium text-white text-right">
                      {selectedDetailTicket.showtime.time}<br/>
                      <span className="text-xs text-zinc-500">{selectedDetailTicket.showtime.date}</span>
                    </span>
                 </div>
                 <div className="w-full h-px bg-zinc-800 border-dashed" />
                 
                 <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Rạp chiếu</span>
                    <span className="font-medium text-white max-w-[200px] text-right line-clamp-2">{selectedDetailTicket.showtime.cinema}</span>
                 </div>
                 <div className="w-full h-px bg-zinc-800 border-dashed" />
                 
                 <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Vị trí ghế</span>
                    <span className="font-bold text-red-400">{selectedDetailTicket.seats}</span>
                 </div>
                 <div className="w-full h-px bg-zinc-800 border-dashed" />
                 <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Trạng thái vé</span>
                    {selectedDetailTicket.checkedIn ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        <ScanLine className="w-3.5 h-3.5" /> Đã check-in
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                        <ScanLine className="w-3.5 h-3.5" /> Chưa check-in
                      </span>
                    )}
                 </div>
              </div>

              {/* Payment info */}
              <div className="space-y-3">
                 <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                   <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   Thanh toán
                 </h4>
                 <div className="flex justify-between text-sm text-zinc-400">
                    <span>Trạng thái</span>
                    <span className="text-green-500 font-semibold uppercase tracking-wider">Đã thanh toán</span>
                 </div>
                 <div className="flex justify-between text-lg font-black text-white mt-2">
                    <span>Tổng cộng</span>
                    <span className="text-red-500">{formatCurrency(selectedDetailTicket.totalPrice)}</span>
                 </div>
              </div>

            </div>

            <div className="p-4 bg-[#1a1a1a] border-t border-zinc-800">
               <button onClick={() => setSelectedDetailTicket(null)} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors">
                 Đóng chi tiết
               </button>
            </div>
          </div>
        </div>
      )}
    </UserLayout>
  );
};

export default MyTickets;
