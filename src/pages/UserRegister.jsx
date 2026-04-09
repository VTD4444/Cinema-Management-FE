import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/ui';
import { register } from '../api/authApi';
import useAuthStore from '../store/useAuthStore';

const UserRegister = () => {
  const navigate = useNavigate();
  const authLogin = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirm_password) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    try {
      const res = await register(formData);
      const token = res?.data?.accessToken;
      const user = res?.data?.user;

      if (token) {
        localStorage.setItem('accessToken', token);
        authLogin(user, token); // Update global state
        navigate('/home');
      } else {
        navigate('/login');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 text-sm text-zinc-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="font-semibold">CinemaPlus</span>
        </div>
        <nav className="flex items-center gap-6">
          <button className="text-zinc-300 hover:text-white transition-colors">Phim</button>
          <button className="text-zinc-300 hover:text-white transition-colors">Rạp</button>
          <button className="text-zinc-300 hover:text-white transition-colors">Giới thiệu</button>
        </nav>
        <button className="text-zinc-300 hover:text-white text-xs">Trợ giúp</button>
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-2xl px-8 py-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white">Đăng ký</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Tạo tài khoản để trải nghiệm các bộ phim hay nhất cùng CinemaPlus
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Họ và tên"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              required
              className="bg-zinc-900 border-zinc-700 h-11"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              className="bg-zinc-900 border-zinc-700 h-11"
            />
            <Input
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0912345678"
              required
              className="bg-zinc-900 border-zinc-700 h-11"
            />
            <Input
              label="Mật khẩu"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="bg-zinc-900 border-zinc-700 h-11"
            />
            <Input
              label="Xác nhận mật khẩu"
              type="password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
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
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>

            <p className="text-xs text-zinc-400 text-center mt-4">
              Bạn đã có tài khoản?{' '}
              <Link to="/login" className="text-white font-medium hover:underline">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserRegister;

