import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select } from '../../ui';
import { UserPlus } from 'lucide-react';
import { createUser, updateUser, deleteUser } from '../../../api/userApi';

const UserModals = ({ state, onClose, onRefresh }) => {
    if (!state.type) return null;

    const isAddOrEdit = state.type === 'add' || state.type === 'edit';
    const isDelete = state.type === 'delete';
    const data = state.data;

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role: 'USER'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (state.type === 'edit' && data) {
            setFormData({
                full_name: data.full_name || '',
                email: data.email || '',
                phone: data.phone || '',
                password: '', // Leave password empty on edit unless user wants to change
                role: data.role || 'USER'
            });
        } else if (state.type === 'add') {
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                password: '',
                role: 'USER'
            });
        }
        setError(null);
    }, [state.type, data]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role
        };

        // Only include password if we are adding, or if we are editing and user typed a new one
        if (state.type === 'add' || (state.type === 'edit' && formData.password)) {
            payload.password = formData.password;
        }

        try {
            if (state.type === 'add') {
                const response = await createUser(payload);
                if (response?.success) {
                    onRefresh && onRefresh();
                    onClose();
                } else {
                    throw new Error(response?.message || 'Thêm tài khoản thất bại');
                }
            } else if (state.type === 'edit') {
                const response = await updateUser(data.id, payload);
                if (response?.success) {
                    onRefresh && onRefresh();
                    onClose();
                } else {
                    throw new Error(response?.message || 'Cập nhật tài khoản thất bại');
                }
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await deleteUser(data.id);
            if (response?.success) {
                onRefresh && onRefresh();
                onClose();
            } else {
                throw new Error(response?.message || 'Xóa tài khoản thất bại');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi xóa');
        } finally {
            setLoading(false);
        }
    };

    // Render Delete Validation/Confirmation Modal
    if (isDelete) {
        return (
            <Modal
                isOpen={true}
                onClose={onClose}
                className="max-w-md bg-[#161616] border-border/50 relative"
            >
                <div className="p-2 space-y-6 flex flex-col items-center justify-center text-center mt-2">
                    <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                        <span className="text-red-500 font-semibold text-sm tracking-widest lowercase">
                            warning
                        </span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white tracking-tight">Xác nhận xóa tài khoản?</h2>
                        <p className="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                            Hành động này có thể không hoàn tác được. Bạn có chắc chắn muốn xóa tài khoản "
                            <span className="text-zinc-200 font-medium">{data?.full_name || data?.email}</span>" khỏi hệ thống?
                        </p>
                        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                    </div>

                    <div className="flex w-full gap-3 pt-2">
                        <Button
                            variant="secondary"
                            onClick={() => onClose()}
                            disabled={loading}
                            className="flex-1 rounded-full bg-zinc-800/80 border-zinc-700/50 hover:bg-zinc-700 text-gray-300"
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 rounded-full shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-shadow disabled:opacity-50"
                        >
                            {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }

    // Render Add/Edit Modal
    if (isAddOrEdit) {
        return (
            <Modal isOpen={true} onClose={onClose} title={state.type === 'add' ? 'Thêm Tài Khoản mới' : 'Chỉnh sửa Tài Khoản'} className="max-w-2xl bg-[#161616] border-border/50">
                <form className="space-y-6 animate-in fade-in zoom-in-95 duration-200" onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between -mt-2 mb-6">
                        <p className="text-sm text-zinc-500 mb-0">Vui lòng điền thông tin tài khoản dưới đây</p>
                        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-1 md:col-span-2">
                            <Input
                                label="Họ và Tên"
                                placeholder="Nhập họ và tên..."
                                value={formData.full_name}
                                onChange={(e) => handleInputChange('full_name', e.target.value)}
                                required
                                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                            />
                        </div>
                        <Input
                            label="Email"
                            type="email"
                            placeholder="vd: email@example.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />
                        <Input
                            label="Số điện thoại"
                            type="tel"
                            placeholder="Nhập số điện thoại..."
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            required
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />

                        <div className="col-span-1">
                            <Input
                                label="Mật khẩu"
                                type="password"
                                placeholder={state.type === 'edit' ? 'Để trống nếu không đổi...' : 'Nhập mật khẩu...'}
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                required={state.type === 'add'}
                                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                            />
                        </div>
                        <div className="col-span-1">
                            <Select
                                label="Vai trò"
                                value={formData.role}
                                onChange={(e) => handleInputChange('role', e.target.value)}
                                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11 text-sm text-gray-300"
                            >
                                <option value="USER">Người dùng (USER)</option>
                                <option value="ADMIN">Quản trị viên (ADMIN)</option>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border/50">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="rounded-full px-6 bg-transparent hover:bg-white/5 text-gray-400 h-10">
                            Hủy
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading} className="rounded-full px-6 h-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary-hover gap-2 disabled:opacity-50">
                            <UserPlus className="h-4 w-4" /> {loading ? 'Đang lưu...' : 'Lưu tài khoản'}
                        </Button>
                    </div>
                </form>
            </Modal>
        );
    }

    return null;
};

export default UserModals;
