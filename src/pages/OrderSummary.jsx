import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import UserLayout from '../components/layout/UserLayout';
import { getMyVouchers } from '../api/voucherApi';
import { createOrder } from '../api/orderApi';
import useAuthStore from '../store/useAuthStore';

const OrderSummary = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const {
    movie,
    cinema,
    time,
    selectedSeats = [],
    selectedFoods = {},
    seatTotal = 0,
    foodTotal = 0,
    foods = [],
  } = location.state || {};

  const [errorState, setErrorState] = useState(null);

  // Validate state
  useEffect(() => {
    if (!isAuthenticated) {
      setErrorState('AUTH_FAILED');
      return;
    }
    if (selectedSeats.length === 0) {
      setErrorState('NO_SEATS');
      return;
    }
  }, [isAuthenticated, selectedSeats]);

  // Countdown logic (10 minutes = 600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  
  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Hết thời gian giữ vé, vui lòng thực hiện lại.");
      navigate(`/booking/${showtimeId}`);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, navigate, showtimeId]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeDisplay = `${String(minutes).padStart(2, '0')} : ${String(seconds).padStart(2, '0')}`;

  // Vouchers
  const [myVouchers, setMyVouchers] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [hasFetchedVouchers, setHasFetchedVouchers] = useState(false);

  const handleOpenVouchers = async () => {
    setShowVoucherModal(true);
    if (!hasFetchedVouchers && isAuthenticated) {
      try {
        const res = await getMyVouchers();
        let list = res?.data?.items || res?.data || [];
        if (!Array.isArray(list)) list = [];
        setMyVouchers(list);
        setHasFetchedVouchers(true);
      } catch (err) {
        console.error("Lỗi lấy vouchers", err);
      }
    }
  };

  // Maths
  const subTotal = seatTotal + foodTotal;
  
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.type === 'PERCENTAGE' || appliedVoucher.type === 'percentage') {
       discountAmount = subTotal * parseFloat(appliedVoucher.value) / 100;
       // if voucher has max_discount limit, we could enforce it here if available in API payload
    } else {
       // Assuming FIXED amount
       discountAmount = parseFloat(appliedVoucher.value);
    }
    if (discountAmount > subTotal) discountAmount = subTotal; // Math clamping
  }

  const finalTotal = subTotal - discountAmount;
  const [isProcessing, setIsProcessing] = useState(false);

  if (errorState === 'AUTH_FAILED') {
    return <div className="text-white text-3xl p-10 bg-red-900 w-full h-screen">LỖI: Bạn chưa đăng nhập (isAuthenticated = false trong OrderSummary).</div>;
  }
  if (errorState === 'NO_SEATS') {
    return <div className="text-white text-3xl p-10 bg-yellow-900 w-full h-screen">LỖI: Không nhận được thông tin ghế. Do giỏ hàng tụt mất lúc chuyển trang.</div>;
  }

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const foodItems = Object.keys(selectedFoods)
        .filter(fId => selectedFoods[fId] > 0)
        .map(fId => ({
          foodId: parseInt(fId, 10),
          quantity: selectedFoods[fId]
        }));

      const payload = {
        showtimeId: parseInt(showtimeId, 10),
        seatIds: selectedSeats.map(s => parseInt(s.id, 10)),
        foodItems,
      };

      if (appliedVoucher) {
        payload.voucher_code = appliedVoucher.code;
      }

      const res = await createOrder(payload);
      
      const resPayload = res?.data || res;
      if (resPayload?.payment_url) {
        window.location.href = resPayload.payment_url;
      } else {
        alert('Chưa nhận được URL thanh toán từ máy chủ. ' + JSON.stringify(res));
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Lỗi gọi API tạo đơn';
      alert(`Đã xảy ra lỗi: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const runtimeH = Math.floor((movie?.duration || 120) / 60);
  const runtimeM = (movie?.duration || 120) % 60;

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] text-white pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Tóm Tắt Đơn Hàng</h1>
            <p className="text-zinc-400 text-sm">Vui lòng kiểm tra lại thông tin đơn hàng trước khi thanh toán.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Ticket Info Card */}
              <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-8">
                 <div className="w-32 md:w-40 shrink-0 mx-auto md:mx-0">
                    <img src={movie?.poster_urls?.[0] || 'https://via.placeholder.com/200'} alt="poster" className="w-full aspect-[2/3] object-cover rounded-xl shadow-lg" />
                 </div>
                 
                 <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-3">{movie?.title || 'Tên Phim'}</h2>
                    
                    <div className="flex items-center gap-3 mb-8 text-xs font-semibold">
                       <span className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded text-zinc-300">
                         {movie?.genres?.[0]?.name || 'Format'}
                       </span>
                       <span className="bg-red-600 px-2 py-1 rounded text-white shadow-sm shadow-red-600/20">
                         T18
                       </span>
                       <span className="text-zinc-400 flex items-center gap-1">
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                         {runtimeH}h {runtimeM}m
                       </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                       <div>
                         <p className="text-zinc-500 font-semibold mb-1 text-[10px] uppercase tracking-wider">Rạp Chiếu</p>
                         <p className="font-bold text-zinc-200">{cinema?.name || 'Rạp Chưa Rõ'}</p>
                       </div>
                       <div>
                         <p className="text-zinc-500 font-semibold mb-1 text-[10px] uppercase tracking-wider">Phòng Chiếu</p>
                         <p className="font-bold text-zinc-200">Room 05</p>
                       </div>
                       <div>
                         <p className="text-zinc-500 font-semibold mb-1 text-[10px] uppercase tracking-wider">Suất Chiếu</p>
                         <p className="font-bold text-zinc-200 text-base">{time || 'N/A'}</p>
                         <p className="text-xs text-zinc-400 mt-0.5">Hôm nay</p>
                       </div>
                       <div>
                         <p className="text-zinc-500 font-semibold mb-1 text-[10px] uppercase tracking-wider">Ghế Đã Chọn</p>
                         <div className="flex flex-wrap gap-1.5 mt-1">
                           {selectedSeats.sort((a,b) => a.number - b.number).map(s => (
                             <span key={s.id} className="bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs px-2 py-0.5 rounded font-bold">
                               {s.row_label}{s.number}
                             </span>
                           ))}
                         </div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Transaction Breakdowns */}
              <div className="bg-[#141414] border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-zinc-800 bg-zinc-900/50 flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  <h3 className="font-bold text-zinc-200">Chi tiết giao dịch</h3>
                </div>

                <div className="p-6 divide-y divide-zinc-800/50">
                   {/* Seats Layer */}
                   <div className="py-4 flex flex-col md:flex-row justify-between gap-4 md:items-center">
                     <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                          <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div>
                           <h4 className="font-bold text-white mb-1">Ghế Chọn</h4>
                           <p className="text-xs text-zinc-400">Số lượng: {String(selectedSeats.length).padStart(2,'0')} • Vị trí: {selectedSeats.map(s => `${s.row_label}${s.number}`).join(', ')}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-black text-white text-lg">{seatTotal.toLocaleString('vi-VN')} đ</p>
                     </div>
                   </div>

                   {/* Food Layer */}
                   {Object.keys(selectedFoods).length > 0 && Object.keys(selectedFoods).map(fId => {
                     const food = foods.find(f => String(f.id) === String(fId));
                     if (!food) return null;
                     const qty = selectedFoods[fId];
                     return (
                      <div key={fId} className="py-4 flex flex-col md:flex-row justify-between gap-4 md:items-center">
                        <div className="flex items-start gap-4">
                           <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                             <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"></path></svg>
                           </div>
                           <div>
                              <h4 className="font-bold text-white mb-1">{food.name}</h4>
                              <p className="text-xs text-zinc-400">Số lượng: {String(qty).padStart(2,'0')} • {food.price.toLocaleString('vi-VN')} đ / sp</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="font-black text-white text-lg">{(food.price * qty).toLocaleString('vi-VN')} đ</p>
                        </div>
                      </div>
                     )
                   })}
                </div>
              </div>

            </div>

            {/* Right Column / Sticky Tools */}
            <div className="space-y-6">
              
               {/* Countdown */}
               <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6 text-center">
                  <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase mb-2">Thời gian giữ vé</p>
                  <p className="text-4xl font-black text-red-600 tracking-wider shadow-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.3)]">{timeDisplay}</p>
               </div>

               {/* Voucher Selection */}
               <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-6">
                  <h3 className="font-bold flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-red-500 tracking-tighter" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                    Mã giảm giá
                  </h3>
                  
                  <button 
                    onClick={handleOpenVouchers}
                    className="w-full bg-zinc-900 border border-zinc-800 border-dashed hover:border-red-500/50 hover:bg-zinc-800/80 transition-all rounded-xl p-4 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-red-600/10 text-red-500 flex items-center justify-center">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                       </div>
                       <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                         {appliedVoucher ? `Đã áp dụng: ${appliedVoucher.code}` : 'Bấm để chọn mã ưu đãi'}
                       </span>
                    </div>
                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
               </div>

               {/* Final Total */}
               <div className="bg-[#141414] border border-zinc-800 rounded-2xl flex flex-col">
                  <div className="p-6 border-b border-zinc-800/50 flex flex-col gap-3">
                    <h3 className="font-bold mb-2 flex items-center gap-2">
                       <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                       Tổng kết
                    </h3>
                    
                    <div className="flex justify-between text-sm">
                       <span className="text-zinc-400">Tạm tính</span>
                       <span className="font-bold">{subTotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-zinc-400">Giảm giá</span>
                       <span className="font-bold text-red-400">- {discountAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-zinc-400">Phí dịch vụ</span>
                       <span className="font-bold text-green-400">Miễn phí</span>
                    </div>
                  </div>

                  <div className="p-6 bg-zinc-900/50">
                     <div className="flex justify-between items-end mb-6">
                        <span className="text-base font-bold text-white">Tổng cộng</span>
                        <div className="text-right">
                           <span className="text-3xl font-black text-red-500">{finalTotal.toLocaleString('vi-VN')} đ</span>
                           <p className="text-[10px] text-zinc-500 font-medium">(Đã bao gồm VAT)</p>
                        </div>
                     </div>
                     
                     <button 
                       onClick={handleCheckout}
                       disabled={isProcessing}
                       className="w-full bg-red-600 disabled:opacity-50 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 mb-3 flex items-center justify-center gap-2"
                     >
                       {isProcessing ? 'Đang tạo đơn...' : 'Thanh toán ngay →'}
                     </button>
                     <button 
                       onClick={() => navigate(-1)}
                       className="w-full border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 font-semibold py-3.5 rounded-xl transition-all"
                     >
                       Quay lại
                     </button>
                  </div>
               </div>

            </div>
          </div>
        </div>
      </div>

      {/* Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-[#141414] border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center p-5 border-b border-zinc-800">
                 <h3 className="font-bold text-lg text-white">Chọn Mã Khuyến Mãi</h3>
                 <button onClick={() => setShowVoucherModal(false)} className="text-zinc-400 hover:text-white">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
              </div>
              <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
                 {myVouchers.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">
                       <svg className="w-12 h-12 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20a8 8 0 100-16 8 8 0 000 16z"></path></svg>
                       <p>Bạn chưa có mã giảm giá nào.</p>
                    </div>
                 ) : (
                    myVouchers.map(v => (
                       <div key={v.id} className="border border-zinc-700 hover:border-red-500 bg-zinc-900 rounded-xl p-4 flex justify-between items-center cursor-pointer group transition-all"
                            onClick={() => { setAppliedVoucher(v); setShowVoucherModal(false); }}>
                          <div>
                             <p className="font-bold text-white text-base group-hover:text-red-400 transition-colors uppercase">{v.code}</p>
                             <p className="text-xs text-zinc-400 mt-1">Giảm {v.type === 'PERCENTAGE' ? `${v.value}%` : `${v.value.toLocaleString('vi-VN')}đ`}</p>
                          </div>
                          <button className="text-xs font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg">Áp dụng</button>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      )}
    </UserLayout>
  );
};

export default OrderSummary;
