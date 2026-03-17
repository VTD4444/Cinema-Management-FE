import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/ui';
import { login } from '../api/authApi';

const UserLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
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

    try {
      const res = await login(formData);
      const token = res?.data?.accessToken;
      if (token) {
        localStorage.setItem('userAccessToken', token);
        navigate('/home');
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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
            <h1 className="text-2xl font-bold text-white">Đăng nhập</h1>
            <p className="text-sm text-zinc-400 mt-1">Chào mừng bạn trở lại với CinemaPlus</p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-200 mb-1">Mật khẩu</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-red-400 hover:text-red-300"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="bg-zinc-900 border-zinc-700 h-11"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full h-11 rounded-lg mt-2 text-sm font-semibold bg-red-600 hover:bg-red-500"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>

            <p className="text-xs text-zinc-400 text-center mt-4">
              Bạn chưa có tài khoản?{' '}
              <Link to="/register" className="text-white font-medium hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserLogin;

