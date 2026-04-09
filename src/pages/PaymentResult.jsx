import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import UserLayout from '../components/layout/UserLayout';
import { verifyVNPayReturn } from '../api/orderApi';
import { CheckCircle, XCircle } from 'lucide-react';

/**
 * VNPay redirect browser về trang này sau khi thanh toán.
 * Frontend gọi API `GET /orders/vnpay-return` với toàn bộ params từ VNPay
 * để cập nhật trạng thái đơn hàng trên Backend, sau đó hiển thị kết quả.
 */
const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Thông tin hiển thị từ VNPay params
  const txnRef = searchParams.get('vnp_TxnRef');
  const bankCode = searchParams.get('vnp_BankCode');
  const amount = searchParams.get('vnp_Amount');
  const bankTranNo = searchParams.get('vnp_BankTranNo');
  const payDate = searchParams.get('vnp_PayDate'); // YYYYMMDDHHmmss

  const formatPayDate = (raw) => {
    if (!raw || raw.length < 14) return null;
    return `${raw.slice(6, 8)}/${raw.slice(4, 6)}/${raw.slice(0, 4)} ${raw.slice(8, 10)}:${raw.slice(10, 12)}:${raw.slice(12, 14)}`;
  };

  const formatAmount = (raw) => {
    if (!raw) return null;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(parseInt(raw) / 100);
  };

  useEffect(() => {
    const updateOrderStatus = async () => {
      // Gom toàn bộ params VNPay gửi về
      const params = {};
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }

      if (!params.vnp_TxnRef || !params.vnp_ResponseCode) {
        setIsSuccess(false);
        setErrorMsg('Không nhận được thông tin giao dịch từ VNPay.');
        setLoading(false);
        return;
      }

      try {
        // Gọi API để Backend cập nhật trạng thái đơn hàng
        const res = await verifyVNPayReturn(params);
        const data = res?.data;

        if (data?.success) {
          setIsSuccess(true);
          setOrderData(data?.data || null); // { order_id, booking_code, status, payment_time }
        } else {
          setIsSuccess(false);
          setErrorMsg(data?.message || 'Giao dịch bị từ chối hoặc đã hủy.');
        }
      } catch (err) {
        // Fallback: nếu API lỗi thì vẫn dùng vnp_ResponseCode để hiển thị
        const responseCode = searchParams.get('vnp_ResponseCode');
        if (responseCode === '00') {
          setIsSuccess(true);
        } else {
          setIsSuccess(false);
          setErrorMsg('Lỗi xác minh giao dịch. Vui lòng liên hệ CSKH nếu đã bị trừ tiền.');
        }
      } finally {
        setLoading(false);
      }
    };

    updateOrderStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <UserLayout>
        <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center gap-4">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium animate-pulse">Đang xác nhận giao dịch...</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-[#141414] border border-zinc-800 rounded-2xl p-8 text-center shadow-2xl">

          {isSuccess ? (
            <div className="flex flex-col items-center w-full animate-in fade-in zoom-in-95 duration-500">
              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-14 h-14 text-green-500 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]" />
                </div>
                <div className="absolute top-0 right-[-10px] w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="absolute bottom-[10%] left-[-15px] w-2 h-2 bg-green-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>

              <h1 className="text-3xl font-black text-white mb-1 uppercase tracking-wide flex items-center gap-2">
                Thanh toán thành công <span></span>
              </h1>
              <p className="text-green-500 font-medium mb-8 text-sm">Chúc bạn xem phim vui vẻ! Hẹn gặp lại tại rạp.</p>

              {/* Digital Receipt */}
              <div className="w-full bg-[#1a1a1a] rounded-2xl p-6 border border-zinc-800/80 mb-8 relative overflow-hidden">
                {/* Ticket notch decorations */}
                <div className="absolute top-1/2 -left-4 w-8 h-8 bg-[#141414] rounded-full -translate-y-1/2" />
                <div className="absolute top-1/2 -right-4 w-8 h-8 bg-[#141414] rounded-full -translate-y-1/2" />

                <div className="space-y-3 text-sm">
                  {/* Booking code từ API */}
                  {orderData?.booking_code && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Mã đặt vé</span>
                      <span className="text-red-400 font-mono font-black tracking-widest">{orderData.booking_code}</span>
                    </div>
                  )}
                  {txnRef && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Mã đơn hàng</span>
                      <span className="text-white font-mono font-bold">#{txnRef}</span>
                    </div>
                  )}
                  {bankCode && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Ngân hàng</span>
                      <span className="text-white font-bold inline-flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {bankCode}
                      </span>
                    </div>
                  )}
                  {bankTranNo && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Mã GD ngân hàng</span>
                      <span className="text-white font-mono text-xs">{bankTranNo}</span>
                    </div>
                  )}
                  {payDate && (
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Thời gian</span>
                      <span className="text-white text-xs">{formatPayDate(payDate)}</span>
                    </div>
                  )}
                </div>

                <div className="w-full border-t-2 border-dashed border-zinc-700 my-5" />

                <div className="flex justify-between items-center">
                  <span className="text-zinc-400 font-bold">Tổng thanh toán</span>
                  <span className="text-2xl font-black text-red-500">{formatAmount(amount) ?? 'N/A'}</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/my-tickets')}
                  className="col-span-2 sm:col-span-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"
                >
                  Xem vé của tôi
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/home')}
                  className="col-span-2 sm:col-span-1 border border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800 text-zinc-300 font-semibold py-3.5 rounded-xl transition-all"
                >
                  Về trang chủ
                </button>
              </div>
            </div>

          ) : (
            <div className="flex flex-col items-center animate-in fade-in duration-300">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center">
                  <XCircle className="w-14 h-14 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Giao dịch thất bại</h1>
              <p className="text-zinc-400 text-sm mb-2">{errorMsg || 'Thanh toán không thành công.'}</p>
              <p className="text-zinc-600 text-xs mb-8">
                {searchParams.get('vnp_ResponseCode') && `Mã lỗi VNPay: ${searchParams.get('vnp_ResponseCode')}`}
              </p>

              <div className="w-full space-y-3">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl transition-all"
                >
                  Thử lại
                </button>
                <button
                  onClick={() => navigate('/home')}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3.5 rounded-xl transition-all"
                >
                  Về trang chủ
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </UserLayout>
  );
};

export default PaymentResult;
