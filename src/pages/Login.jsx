import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '../components/ui';
import { login } from '../api/authApi';
import { Package } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const Login = () => {
  const navigate = useNavigate();
  const authLogin = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(formData);

      // response format từ backend qua axiosClient:
      // { success, message, data: { accessToken, role } }
      const token = response?.data?.accessToken;
      const role = response?.data?.role;

      if (token) {
        // Lưu vào store (và localStorage thông qua store)
        authLogin({ role }, token);

        // Điều hướng vào dashboard admin
        navigate('/dashboard');
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
      } else {
          setError('Có lỗi xảy ra kết nối API. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-surface/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-10 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20 shadow-inner">
             <Package className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Cinema Admin</h1>
          <p className="text-zinc-400 text-sm mt-1">Đăng nhập để vào hệ thống quản lý</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-sm text-red-400 font-medium text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="admin@gmail.com"
            required
            className="bg-zinc-900/50 border-zinc-800 h-12"
          />
          <Input
            label="Mật khẩu"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="••••••••"
            required
            className="bg-zinc-900/50 border-zinc-800 h-12"
          />
          
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full h-12 rounded-xl mt-2 text-base font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
