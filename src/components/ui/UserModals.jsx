import React, { useState } from 'react';
import { Modal, Input, Button, Select } from './index';
import { UserPlus } from 'lucide-react';

const UserModals = ({ state, onClose }) => {
    if (!state.type) return null;

    const isAddOrEdit = state.type === 'add' || state.type === 'edit';
    const data = state.data;

    // Render Add/Edit Modal
    if (isAddOrEdit) {
        return (
            <Modal isOpen={true} onClose={onClose} title={state.type === 'add' ? 'Thêm Tài Khoản mới' : 'Chỉnh sửa Tài Khoản'} className="max-w-2xl bg-[#161616] border-border/50">
                <form className="space-y-6 animate-in fade-in zoom-in-95 duration-200" onSubmit={(e) => e.preventDefault()}>
                    <p className="text-sm text-zinc-500 -mt-2 mb-6">Vui lòng điền thông tin tài khoản dưới đây</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Tên tài khoản (Username)"
                            placeholder="Nhập tên đăng nhập..."
                            defaultValue={data?.username}
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />
                        <Input
                            label="Họ và Tên người dùng"
                            placeholder="Nhập họ và tên..."
                            defaultValue={data?.fullName}
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />
                        <Input
                            label="Email"
                            type="email"
                            placeholder="vd: email@example.com"
                            defaultValue={data?.email}
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />
                        <Input
                            label="Số điện thoại"
                            type="tel"
                            placeholder="Nhập số điện thoại..."
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />

                        <div className="col-span-1">
                            <Input
                                label="Mật khẩu"
                                type="password"
                                placeholder={state.type === 'edit' ? 'Để trống nếu không đổi...' : 'Nhập mật khẩu...'}
                                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                            />
                        </div>
                        <div className="col-span-1">
                            <Select label="Trạng thái" defaultValue={data?.status || "Hoạt động"} className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11 text-sm text-gray-300">
                                <option value="Hoạt động">Hoạt động</option>
                                <option value="Đã khóa">Đã khóa</option>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border/50">
                        <Button variant="ghost" onClick={onClose} className="rounded-full px-6 bg-transparent hover:bg-white/5 text-gray-400 h-10">
                            Hủy
                        </Button>
                        <Button variant="primary" className="rounded-full px-6 h-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary-hover gap-2">
                            <UserPlus className="h-4 w-4" /> Lưu tài khoản
                        </Button>
                    </div>
                </form>
            </Modal>
        );
    }

    return null;
};

export default UserModals;
