import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/ui';
import UserLayout from '../components/layout/UserLayout';
import { forgotPassword, verifyOtp, resetPassword } from '../api/authApi';

const UserForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      await forgotPassword({ email });
      setSuccessMessage('Đã gửi mã xác nhận đến email của bạn.');
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể gửi mã. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const res = await verifyOtp({ email, otp });
      const token = res?.data?.resetToken;
      if (token) {
        setResetToken(token);
        setSuccessMessage('Xác thực mã thành công. Vui lòng nhập mật khẩu mới.');
        setStep(3);
      } else {
        setError('Không lấy được token đặt lại mật khẩu.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Mã xác nhận không hợp lệ hoặc đã hết hạn.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    try {
      await resetPassword({ resetToken, newPassword, confirmPassword });
      setSuccessMessage('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập lại.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderStepForm = () => {
    if (step === 1) {
      return (
        <form onSubmit={handleSendEmail} className="space-y-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="bg-zinc-900 border-zinc-700 h-11"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full h-11 rounded-lg mt-2 text-sm font-semibold bg-red-600 hover:bg-red-500"
          >
            {loading ? 'Đang xử lý...' : 'Gửi mã xác nhận'}
          </Button>
        </form>
      );
    }

    if (step === 2) {
      return (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
            className="bg-zinc-900 border-zinc-700 h-11"
          />
          <Input
            label="Mã xác nhận (OTP)"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Nhập mã 6 số"
            required
            className="bg-zinc-900 border-zinc-700 h-11 tracking-[0.3em]"
          />
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full h-11 rounded-lg mt-2 text-sm font-semibold bg-red-600 hover:bg-red-500"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận mã'}
          </Button>
        </form>
      );
    }

    return (
      <form onSubmit={handleResetPassword} className="space-y-5">
        <Input
          label="Mật khẩu mới"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="bg-zinc-900 border-zinc-700 h-11"
        />
        <Input
          label="Xác nhận mật khẩu mới"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="bg-zinc-900 border-zinc-700 h-11"
        />
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-full h-11 rounded-lg mt-2 text-sm font-semibold bg-red-600 hover:bg-red-500"
        >
          {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </Button>
      </form>
    );
  };

  return (
    <UserLayout>
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-black via-zinc-900/50 to-[#0e0e0e] px-4 py-10 sm:py-12">
        <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-2xl px-8 py-10">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">Quên mật khẩu</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Nhập email để nhận mã xác nhận, sau đó đặt lại mật khẩu mới.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {successMessage}
            </div>
          )}

          {renderStepForm()}

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-6 text-xs text-zinc-400 hover:text-white flex items-center gap-1"
          >
            <span>←</span>
            <span>Quay lại đăng nhập</span>
          </button>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserForgotPassword;

