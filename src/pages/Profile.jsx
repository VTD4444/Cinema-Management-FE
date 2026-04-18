import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Ticket, User, UserCircle2 } from 'lucide-react';
import UserLayout from '../components/layout/UserLayout';
import useAuthStore from '../store/useAuthStore';
import { updateMyProfile } from '../api/userApi';
import { changePassword, getMyProfile } from '../api/authApi';

const Profile = () => {
  const authUser = useAuthStore((state) => state.user);
  const setAuthState = useAuthStore.setState;
  const [activeTab, setActiveTab] = useState('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState('');

  const displayName = useMemo(() => {
    if (authUser?.full_name) return authUser.full_name;
    const first = authUser?.first_name || '';
    const last = authUser?.last_name || '';
    return `${first} ${last}`.trim() || authUser?.name || 'Người dùng';
  }, [authUser]);

  const [profileForm, setProfileForm] = useState({
    first_name: authUser?.first_name || (displayName.split(' ').slice(0, -1).join(' ') || ''),
    last_name: authUser?.last_name || (displayName.split(' ').slice(-1).join(' ') || ''),
    gender: authUser?.gender === 'FEMALE' ? 'Nữ' : 'Nam',
    birth_date: authUser?.dob || authUser?.birth_date || '',
    phone: authUser?.phone || '',
    email: authUser?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const onProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const onPasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await getMyProfile();
        const user = res?.data?.user || res?.user || null;
        if (user) {
          const nameParts = String(user.full_name || '').trim().split(' ').filter(Boolean);
          const lastName = nameParts.length > 0 ? nameParts[nameParts.length - 1] : '';
          const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';

          setAuthState({ user: { ...authUser, ...user } });
          setProfileForm({
            first_name: user.first_name || firstName,
            last_name: user.last_name || lastName,
            gender: user.gender === 'FEMALE' ? 'Nữ' : 'Nam',
            birth_date: user.dob || '',
            phone: user.phone || '',
            email: user.email || '',
          });
        }
      } catch {
        setMessage('Không thể tải thông tin tài khoản.');
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!profileForm.first_name.trim() || !profileForm.last_name.trim()) {
      setMessage('Vui lòng nhập đầy đủ họ và tên.');
      return;
    }

    const currentUserId = authUser?.id;
    if (!currentUserId) {
      setMessage('Không xác định được người dùng hiện tại.');
      return;
    }

    setSavingProfile(true);
    try {
      const full_name = `${profileForm.first_name} ${profileForm.last_name}`.trim();
      const payload = {
        full_name,
        gender: profileForm.gender === 'Nữ' ? 'FEMALE' : 'MALE',
        dob: profileForm.birth_date || null,
        phone: profileForm.phone.trim(),
      };
      const res = await updateMyProfile(currentUserId, payload);
      const updatedUser = res?.data?.user || res?.user || null;
      setAuthState({
        user: {
          ...authUser,
          ...(updatedUser || payload),
          full_name,
          email: profileForm.email,
        },
      });
      setMessage('Lưu thay đổi thành công.');
    } catch {
      setMessage('Không thể lưu thông tin. Vui lòng thử lại.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setMessage('Vui lòng nhập đầy đủ thông tin mật khẩu.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage('Mật khẩu mới cần tối thiểu 6 ký tự.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage('Xác nhận mật khẩu chưa khớp.');
      return;
    }
    setSavingPassword(true);
    changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    })
      .then(() => {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setMessage('Đổi mật khẩu thành công.');
      })
      .catch((err) => {
        setMessage(err?.response?.data?.message || 'Không thể đổi mật khẩu.');
      })
      .finally(() => setSavingPassword(false));
  };

  return (
    <UserLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 text-white sm:px-8">
        <div className="mb-7">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Cài đặt tài khoản</h1>
          <p className="mt-1 text-sm text-zinc-400">Quản lý thông tin cá nhân và bảo mật</p>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 text-sm text-zinc-300">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'border-l-2 border-primary bg-zinc-900 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <User className="h-4 w-4" />
                Thông tin tài khoản
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition-colors ${
                activeTab === 'password'
                  ? 'border-l-2 border-primary bg-zinc-900 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Đổi mật khẩu
              </span>
            </button>
            <Link
              to="/my-vouchers"
              className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-zinc-400 transition-colors hover:bg-zinc-900/60 hover:text-zinc-200"
            >
              <span className="inline-flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Voucher của tôi
              </span>
            </Link>
          </aside>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 md:p-8">
            {loadingProfile ? (
              <div className="py-16 text-center text-sm text-zinc-400">Đang tải thông tin tài khoản...</div>
            ) : (
              <>
            {activeTab === 'profile' ? (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <h2 className="text-3xl font-semibold text-zinc-100">Thông tin chung</h2>
                <div className="grid gap-6 md:grid-cols-[160px_1fr]">
                  <div className="space-y-3">
                    <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-zinc-700 bg-zinc-800">
                      <div className="flex h-full w-full items-center justify-center">
                        <UserCircle2 className="h-20 w-20 text-zinc-500" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-xs text-zinc-400">Họ</span>
                      <input
                        value={profileForm.first_name}
                        onChange={(e) => onProfileChange('first_name', e.target.value)}
                        className="h-11 w-full rounded-lg border border-zinc-800 bg-black px-3 text-sm outline-none focus:border-zinc-600"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-zinc-400">Tên</span>
                      <input
                        value={profileForm.last_name}
                        onChange={(e) => onProfileChange('last_name', e.target.value)}
                        className="h-11 w-full rounded-lg border border-zinc-800 bg-black px-3 text-sm outline-none focus:border-zinc-600"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-zinc-400">Giới tính</span>
                      <select
                        value={profileForm.gender}
                        onChange={(e) => onProfileChange('gender', e.target.value)}
                        className="h-11 w-full rounded-lg border border-zinc-800 bg-black px-3 text-sm outline-none focus:border-zinc-600"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-zinc-400">Ngày sinh</span>
                      <input
                        type="date"
                        value={profileForm.birth_date}
                        onChange={(e) => onProfileChange('birth_date', e.target.value)}
                        className="h-11 w-full rounded-lg border border-zinc-800 bg-black px-3 text-sm outline-none focus:border-zinc-600"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-zinc-400">SĐT</span>
                      <input
                        value={profileForm.phone}
                        onChange={(e) => onProfileChange('phone', e.target.value)}
                        className="h-11 w-full rounded-lg border border-zinc-800 bg-black px-3 text-sm outline-none focus:border-zinc-600"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-zinc-400">Email</span>
                      <input
                        value={profileForm.email}
                        disabled
                        className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-500 outline-none"
                      />
                    </label>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="h-11 rounded-lg bg-primary px-8 text-sm font-semibold text-white shadow-[0_0_20px_rgba(229,9,20,0.35)] disabled:opacity-70"
                  >
                    {savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h2 className="text-3xl font-semibold text-zinc-100">Đổi mật khẩu</h2>
                <div className="space-y-4">
                  <label className="block space-y-1">
                    <span className="text-xs text-zinc-400">Mật khẩu cũ</span>
                    <div className="relative">
                      <input
                        type={showPassword.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => onPasswordChange('currentPassword', e.target.value)}
                        placeholder="Nhập mật khẩu hiện tại"
                        className="h-12 w-full rounded-lg border border-zinc-800 bg-black px-4 pr-10 text-sm outline-none focus:border-zinc-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => ({ ...s, current: !s.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                      >
                        {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs text-zinc-400">Mật khẩu mới</span>
                    <div className="relative">
                      <input
                        type={showPassword.next ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => onPasswordChange('newPassword', e.target.value)}
                        placeholder="Nhập mật khẩu mới"
                        className="h-12 w-full rounded-lg border border-zinc-800 bg-black px-4 pr-10 text-sm outline-none focus:border-zinc-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => ({ ...s, next: !s.next }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                      >
                        {showPassword.next ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs text-zinc-400">Xác nhận mật khẩu mới</span>
                    <div className="relative">
                      <input
                        type={showPassword.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => onPasswordChange('confirmPassword', e.target.value)}
                        placeholder="Nhập lại mật khẩu mới"
                        className="h-12 w-full rounded-lg border border-zinc-800 bg-black px-4 pr-10 text-sm outline-none focus:border-zinc-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => ({ ...s, confirm: !s.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                      >
                        {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </label>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="h-11 rounded-lg bg-primary px-8 text-sm font-semibold text-white shadow-[0_0_20px_rgba(229,9,20,0.35)] disabled:opacity-70"
                  >
                    {savingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
              </form>
            )}
              </>
            )}
          </section>
        </div>
      </div>
    </UserLayout>
  );
};

export default Profile;
