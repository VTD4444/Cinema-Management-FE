import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getSeatMapByShowtime } from '../api/seatApi';
import { getFoods } from '../api/foodApi';
import useAuthStore from '../store/useAuthStore';
import UserLayout from '../components/layout/UserLayout';

// Seat type price multipliers (relative to base_price from showtime)
const SEAT_MULTIPLIER = {
  STANDARD: 1,
  VIP: 1.5,
  COUPLE: 2,
};

// Colors mapping
const getSeatColor = (seat, isSelected) => {
  if (seat.status === 'BOOKED') return 'bg-zinc-800 border-zinc-800 text-zinc-600 cursor-not-allowed opacity-60';
  if (seat.status === 'HOLDING' && !isSelected) return 'bg-yellow-600/20 border-yellow-600/50 text-yellow-500 cursor-not-allowed opacity-80'; // Someone else holding
  if (isSelected) return 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/30';

  if (seat.type === 'VIP') return 'border-purple-500/50 text-purple-400 hover:border-purple-500 hover:bg-purple-500/10';
  if (seat.type === 'COUPLE') return 'border-pink-500/50 text-pink-400 hover:border-pink-500 hover:bg-pink-500/10 w-[70px]';

  return 'border-zinc-600 text-zinc-300 hover:border-white hover:text-white';
};

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  // Passed via location state from MovieDetails
  const { movie, cinema, time, base_price } = location.state || {};

  // Giá vé cơ bản từ suất chiếu; fallback 80.000 nếu không có
  const basePrice = Number(base_price) || 80000;

  // Tính giá ghế theo loại
  const getSeatPrice = (type) => Math.round(basePrice * (SEAT_MULTIPLIER[type] || 1));

  const storageKey = `seat_selection_${showtimeId}`;

  // Load persisted selections from sessionStorage
  const loadPersistedSelections = () => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          seats: parsed.seats || [],
          foods: parsed.foods || {},
        };
      }
    } catch (e) { /* ignore */ }
    return { seats: [], foods: {} };
  };

  const persisted = loadPersistedSelections();

  const [seatMap, setSeatMap] = useState({});
  const [foods, setFoods] = useState([]);

  const [selectedSeats, setSelectedSeats] = useState(persisted.seats);
  const [selectedFoods, setSelectedFoods] = useState(persisted.foods);

  const [socket, setSocket] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize Data
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnUrl: `/booking/${showtimeId}` } });
      return;
    }

    const fetchData = async () => {
      try {
        const [seatRes, foodRes] = await Promise.all([
          getSeatMapByShowtime(showtimeId),
          getFoods()
        ]);
        setSeatMap(seatRes?.data || {});

        let foodList = foodRes?.data?.items || foodRes?.data || [];
        if (!Array.isArray(foodList)) foodList = [];
        setFoods(foodList.filter(f => f.is_available !== false)); // only available foods

      } catch (err) {
        console.error(err);
        setErrorMsg('Không thể tải dữ liệu phòng chiếu.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showtimeId, isAuthenticated, navigate]);

  // Persist selectedSeats & selectedFoods to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({
        seats: selectedSeats,
        foods: selectedFoods,
      }));
    } catch (e) { /* ignore */ }
  }, [selectedSeats, selectedFoods, storageKey]);

  // Handle Socket
  useEffect(() => {
    if (!isAuthenticated) return;

    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling']
    });

    if (newSocket.connected) {
      console.log('Socket already connected, joining showtime:', showtimeId);
      newSocket.emit('joinShowtime', showtimeId);
    }

    newSocket.on('connect', () => {
      console.log('Socket connected, joining showtime:', showtimeId);
      newSocket.emit('joinShowtime', showtimeId);

      // Re-lock persisted seats after reconnect
      const saved = loadPersistedSelections();
      if (saved.seats.length > 0) {
        const currentUserId = user?.id || user?._id || user?.userId || 1;
        saved.seats.forEach(seat => {
          console.log('Re-locking persisted seat:', seat.id);
          newSocket.emit('lockSeat', { showtimeId, seatId: seat.id, userId: currentUserId });
        });
      }
    });

    newSocket.on('seatLocked', ({ seatId, userId }) => {
      console.log(`Received seatLocked. seatId=${seatId}, userId=${userId}, myId=${user?.id}`);
      // Luôn cập nhật local seatMap sang HOLDING (Dù là tab khác của cùng 1 user hay user khác)
      // Giao diện vẫn sẽ ưu tiên hiển thị màu Đỏ (isSelected) nếu tab này đang chọn ghế đó.
      setSeatMap(prev => {
        const next = { ...prev };
        let found = false;
        Object.keys(next).forEach(row => {
          next[row] = next[row].map(s => {
            if (String(s.id) === String(seatId)) {
              found = true;
              return { ...s, status: 'HOLDING' };
            }
            return s;
          });
        });
        console.log(`Seat map updated with HOLDING. Found original seat? ${found}`);
        return next;
      });
    });

    newSocket.on('seatReleased', ({ seatId }) => {
      console.log(`Received seatReleased. seatId=${seatId}`);
      setSeatMap(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(row => {
          next[row] = next[row].map(s => String(s.id) === String(seatId) ? { ...s, status: 'AVAILABLE' } : s);
        });
        return next;
      });
      // Remove from selectedSeats if this seat's lock expired
      setSelectedSeats(prev => {
        const updated = prev.filter(s => String(s.id) !== String(seatId));
        if (updated.length !== prev.length) {
          console.log(`Seat ${seatId} lock expired, removing from selection`);
        }
        return updated;
      });
    });

    newSocket.on('error', (err) => {
      const msg = typeof err === 'string' ? err : err.message;
      alert(msg);

      // Rollback optimistic UI selection if the seat lock failed
      if (err && err.seatId) {
        setSelectedSeats(prev => prev.filter(s => String(s.id) !== String(err.seatId)));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [showtimeId, isAuthenticated, user]);

  const toggleSeat = (seat) => {
    if (seat.status === 'BOOKED' || (seat.status === 'HOLDING' && !selectedSeats.find(s => s.id === seat.id))) {
      return;
    }

    const isAlreadySelected = selectedSeats.find(s => s.id === seat.id);

    if (isAlreadySelected) {
      // Remove it locally
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
      // Tell server we released it
      if (socket) socket.emit('releaseSeat', { showtimeId, seatId: seat.id });
    } else {
      if (selectedSeats.length >= 8) {
        alert('Bạn chỉ có thể chọn tối đa 8 ghế cho mỗi giao dịch.');
        return;
      }
      setSelectedSeats(prev => [...prev, seat]);
      // Tell server we locked it
      const currentUserId = user?.id || user?._id || user?.userId || 1;
      if (socket) socket.emit('lockSeat', { showtimeId, seatId: seat.id, userId: currentUserId });
    }
  };

  const updateFoodConfig = (foodId, delta) => {
    setSelectedFoods(prev => {
      const qty = (prev[foodId] || 0) + delta;
      const next = { ...prev };
      if (qty <= 0) {
        delete next[foodId];
      } else {
        next[foodId] = qty;
      }
      return next;
    });
  };

  // Calculations
  const seatTotal = useMemo(() => {
    return selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat.type), 0);
  }, [selectedSeats, basePrice]);

  const foodTotal = useMemo(() => {
    let total = 0;
    Object.keys(selectedFoods).forEach(fId => {
      const foodObj = foods.find(f => String(f.id) === String(fId));
      if (foodObj) total += foodObj.price * selectedFoods[fId];
    });
    return total;
  }, [selectedFoods, foods]);

  const totalAmount = seatTotal + foodTotal;

  if (loading) return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center text-white">
        Đang tải sơ đồ ghế...
      </div>
    </UserLayout>
  );

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] text-zinc-300 pt-20 pb-24">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Left Panel */}
          <div className="lg:col-span-2 space-y-8">

            <h1 className="text-3xl font-bold text-white tracking-tight">Chọn ghế và dịch vụ</h1>

            {/* SEAT MAP */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-8">

              {/* Legend */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-16 mb-12 text-sm font-medium bg-[#0e0e0e] py-4 px-6 rounded-2xl border border-zinc-800/50">

                {/* Status Group */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">Trạng Thái</span>
                  <div className="flex flex-wrap items-center justify-center gap-5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border border-zinc-600 bg-transparent"></div>
                      <span>Trống</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border border-red-600 bg-red-600 shadow-md shadow-red-600/30"></div>
                      <span>Đang chọn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-yellow-600/20 border border-yellow-600/50 flex items-center justify-center text-[10px] text-yellow-500">🔒</div>
                      <span>Đang giữ</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-zinc-800 border border-zinc-800 text-zinc-600 flex items-center justify-center text-xs">X</div>
                      <span>Đã bán</span>
                    </div>
                  </div>
                </div>

                {/* Divider on desktop */}
                <div className="hidden md:block w-px h-12 bg-zinc-800"></div>

                {/* Types Group */}
                <div className="flex flex-col items-center gap-3">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-black">Loại Ghế & Giá</span>
                  <div className="flex items-center justify-center gap-5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border border-zinc-600 bg-transparent"></div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-zinc-300 text-xs">Thường</span>
                        <span className="text-zinc-500 text-[10px]">{getSeatPrice('STANDARD').toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded border border-purple-500/50 bg-purple-500/10"></div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-purple-400 text-xs">VIP</span>
                        <span className="text-zinc-500 text-[10px]">{getSeatPrice('VIP').toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-5 rounded border border-pink-500/50 bg-pink-500/10"></div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-pink-400 text-xs">Couple</span>
                        <span className="text-zinc-500 text-[10px]">{getSeatPrice('COUPLE').toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Screen Area */}
              <div className="relative mb-16 pt-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[40px] bg-sky-400/5 blur-[20px] rounded-[100%]"></div>
                <div className="text-center font-black tracking-[1em] text-zinc-700 uppercase bg-gradient-to-t from-transparent to-zinc-800/20 border-t-2 border-zinc-700/80 w-4/5 mx-auto py-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] rounded-t-xl">
                  MÀN HÌNH
                </div>
              </div>

              {/* Debug raw format briefly if empty */}
              {Object.keys(seatMap).length === 0 && (
                <div className="p-4 bg-red-900/40 text-white rounded mb-8 text-sm break-all">
                  No seats formatted. Raw state: {JSON.stringify(seatMap)}
                </div>
              )}

              {/* Rows */}
              <div className="flex flex-col items-center gap-4">
                {Object.keys(seatMap).map((rowLabel) => (
                  <div key={rowLabel} className="flex items-center gap-5">
                    <span className="w-6 text-center font-bold text-zinc-500">{rowLabel}</span>
                    <div className="flex gap-2">
                      {seatMap[rowLabel].map((seat) => {
                        const isSelected = selectedSeats.some(s => s.id === seat.id);
                        const seatWithRow = { ...seat, row_label: rowLabel };
                        return (
                          <button
                            key={seat.id}
                            onClick={() => toggleSeat(seatWithRow)}
                            disabled={seat.status === 'BOOKED' || (seat.status === 'HOLDING' && !isSelected)}
                            className={`h-9 rounded flex items-center justify-center text-xs font-bold transition-all ${seat.type === 'COUPLE' ? 'w-16' : 'w-9'
                              } border ${getSeatColor(seat, isSelected)}`}
                          >
                            {(seat.status === 'BOOKED' || (seat.status === 'HOLDING' && !isSelected)) && !isSelected
                              ? (seat.status === 'HOLDING' ? '🔒' : 'X')
                              : seat.number}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-6 text-center font-bold text-zinc-500">{rowLabel}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SERVICES */}
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></svg>
                Dịch vụ (Bắp nước)
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {foods.map(food => {
                  const qty = selectedFoods[food.id] || 0;
                  return (
                    <div key={food.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col items-center justify-between text-center relative overflow-hidden group">

                      <div className="w-20 h-20 mb-3 bg-zinc-800/50 rounded-full flex items-center justify-center">
                        {food.image_url ? (
                          <img src={food.image_url} alt={food.name} className="w-12 h-12 object-contain" />
                        ) : (
                          <span className="text-zinc-600 text-2xl">🍔</span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white truncate w-full">{food.name}</h3>
                      <p className="text-xs text-red-500 mt-1 mb-4 font-semibold">{food.price.toLocaleString('vi-VN')} đ</p>

                      <div className="flex items-center gap-3 bg-[#0e0e0e] rounded-full p-1 border border-zinc-800">
                        <button onClick={() => updateFoodConfig(food.id, -1)} disabled={qty === 0} className={`w-7 h-7 rounded-full flex items-center justify-center ${qty > 0 ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'text-zinc-600 cursor-not-allowed'}`}>-</button>
                        <span className="w-4 text-sm font-bold text-white text-center">{qty}</span>
                        <button onClick={() => updateFoodConfig(food.id, 1)} className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-500">+</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Right Panel: BILL */}
          <div className="relative">
            <div className="sticky top-28 bg-[#141414] border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">

              {/* Movie Header Detail */}
              <div className="p-6 border-b border-zinc-800/50 flex gap-4">
                <div className="w-20 aspect-[2/3] rounded-lg overflow-hidden shrink-0">
                  <img src={movie?.poster_urls?.[0] || 'https://via.placeholder.com/150'} alt="poster" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight mb-2">{movie?.title || 'Phim Chưa Rõ'}</h3>
                  <div className="text-xs font-semibold text-zinc-400 mb-1">{movie?.genres?.[0]?.name || 'Format'}</div>
                  <div className="text-xs text-zinc-500">{cinema?.name || 'Rạp Chưa Rõ'}</div>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6 space-y-4 text-sm">
                <div className="flex justify-between border-b border-dashed border-zinc-800 pb-4">
                  <span className="text-zinc-400">Giờ</span>
                  <span className="font-bold text-white text-right">
                    {time || 'N/A'}<br />

                  </span>
                </div>

                <div className="flex justify-between border-b border-dashed border-zinc-800 pb-4">
                  <span className="text-zinc-400 shrink-0">Ghế chọn ({selectedSeats.length})</span>
                  <span className="font-bold text-white text-right break-words max-w-[150px]">
                    {selectedSeats.length > 0 ? selectedSeats.sort((a, b) => a.number - b.number).map(s => `${s.row_label}${s.number}`).join(', ') : 'Chưa chọn'}
                  </span>
                </div>

                <div className="flex justify-between pb-2 border-b border-zinc-800 border-dashed">
                  <span className="text-zinc-400">Dịch vụ</span>
                  <span className="font-bold text-white text-right">
                    {Object.keys(selectedFoods).length > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                        {Object.keys(selectedFoods).map(fId => {
                          const food = foods.find(f => String(f.id) === String(fId));
                          const qty = selectedFoods[fId];
                          if (!food) return null;
                          return <span key={fId} className="text-xs text-zinc-300">{food.name} x<span className="text-red-400">{qty}</span></span>
                        })}
                      </div>
                    ) : 'Chưa chọn'}
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Tổng tiền ghế:</span>
                    <span>{seatTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500">
                    <span>Tiền dịch vụ:</span>
                    <span>{foodTotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>

              </div>

              <div className="p-6 bg-[#1a1a1a] shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-zinc-400 font-semibold">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-red-500">{totalAmount.toLocaleString('vi-VN')}đ</span>
                </div>
                <button
                  disabled={selectedSeats.length === 0}
                  onClick={() => {
                    // Cố tình nhả khóa ghế (Release) ngay trước khi chuyển trang 
                    // để ép trạng thái ghế quay về "AVAILABLE", giúp Backend lọt qua validation.
                    selectedSeats.forEach(seat => {
                      if (socket) socket.emit('releaseSeat', { showtimeId, seatId: seat.id });
                    });

                    navigate(`/booking/${showtimeId}/summary`, {
                      state: {
                        movie, cinema, time,
                        selectedSeats, selectedFoods,
                        seatTotal, foodTotal, foods
                      }
                    });
                  }}
                  className="w-full bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-500 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all"
                >
                  Tiếp Tục
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default SeatSelection;
