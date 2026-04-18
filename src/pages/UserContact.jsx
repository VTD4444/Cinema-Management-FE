import React, { useState } from 'react';
import UserLayout from '../components/layout/UserLayout';
import { Search, Ticket, User, Tag, MoreHorizontal, Headset, MessageSquare, Send, Mail, MessageCircle } from 'lucide-react';
import { createContact } from '../api/contactApi';
import useAuthStore from '../store/useAuthStore';

const UserContact = () => {
  const { user } = useAuthStore();

  const [subject, setSubject] = useState('Vấn đề về đặt vé');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Vui lòng nhập nội dung chi tiết.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        senderName: user?.full_name || user?.fullName || user?.name || 'Khách hàng',
        email: user?.email || 'unknown@example.com',
        subject,
        message,
      };

      const res = await createContact(payload);
      if (res?.success || res?.data) {
        setSuccessMsg('Gửi yêu cầu thành công. Chúng tôi sẽ phản hồi sớm nhất có thể!');
        setMessage('');
        setSubject('Vấn đề về đặt vé');
      } else {
        setErrorMsg('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error(error);
      setErrorMsg('Hệ thống đang bận. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickSupports = [
    { icon: <Ticket className="w-5 h-5" />, label: 'Vé & Thanh toán' },
    { icon: <User className="w-5 h-5" />, label: 'Tài khoản' },
    { icon: <Tag className="w-5 h-5" />, label: 'Ưu đãi' },
    { icon: <MoreHorizontal className="w-5 h-5" />, label: 'Khác' },
  ];

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] text-white pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-6">

          {/* Header Title */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-8">Trung tâm hỗ trợ</h1>
          </div>

          {/* Quick Support */}
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-6">Hỗ trợ nhanh</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {quickSupports.map((item, idx) => (
                <div key={idx} className="bg-[#1a1212] hover:bg-[#1f1515] transition-colors cursor-pointer border border-red-900/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 group">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
                    {item.icon}
                  </div>
                  <span className="font-bold text-sm text-zinc-200">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Main Grid: Left Banner & Right Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

            {/* Left Box: Chat Banner */}
            <div className="bg-red-600 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl shadow-red-600/20">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                <Headset className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Cần hỗ trợ ngay?</h3>
              <p className="text-red-100 font-medium leading-relaxed mb-8 max-w-sm">
                Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng 24/7 để giải đáp mọi thắc mắc của bạn.
              </p>
              <button className="bg-white text-red-600 font-bold px-8 py-4 rounded-full flex items-center gap-2 hover:bg-zinc-100 transition-colors shadow-xl">
                Chat trực tuyến <MessageCircle className="w-5 h-5 ml-1" />
              </button>
            </div>

            {/* Right Box: Form */}
            <div className="bg-[#1a1212] border border-red-900/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <Mail className="w-6 h-6 text-red-500" />
                <h3 className="text-2xl font-bold">Gửi tin nhắn</h3>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Subject Select */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    Chủ đề
                  </label>
                  <div className="relative">
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full h-14 bg-[#140c0c] border border-red-900/20 text-white px-5 rounded-2xl appearance-none focus:outline-none focus:border-red-500/50 transition-colors font-medium cursor-pointer"
                    >
                      <option value="Vấn đề về đặt vé">Vấn đề về đặt vé</option>
                      <option value="Tài khoản">Tài khoản</option>
                      <option value="Ưu đãi">Ưu đãi</option>
                      <option value="Khác">Khác</option>
                    </select>
                    {/* Custom Dropdown Arrow */}
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Message Textarea */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    Nội dung
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mô tả chi tiết vấn đề của bạn..."
                    className="w-full h-36 bg-[#140c0c] border border-red-900/20 text-white p-5 rounded-2xl focus:outline-none focus:border-red-500/50 transition-colors placeholder:text-zinc-600 font-medium resize-none"
                  ></textarea>
                </div>

                {/* Feedback Messages */}
                {successMsg && <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-medium">{successMsg}</div>}
                {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium">{errorMsg}</div>}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 mt-2 bg-white disabled:bg-zinc-300 disabled:cursor-not-allowed hover:bg-zinc-100 text-black font-bold rounded-full transition-colors flex items-center justify-center gap-2 shadow-xl"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                  {!isSubmitting && <Send className="w-4 h-4 ml-1" />}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserContact;
