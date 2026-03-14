import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select } from '../../ui';

const VoucherModals = ({ state, onClose, onSave }) => {
    if (!state.type) return null;

    const isDelete = state.type === 'delete';
    const isAddOrEdit = state.type === 'add' || state.type === 'edit';
    const data = state.data;

    const [formData, setFormData] = useState({
        code: '',
        value: '',
        type: 'PERCENT',
        start_date: '',
        end_date: '',
        usage_limit: '',
        is_active: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAddOrEdit) {
            if (data) {
                setFormData({
                    code: data.code || '',
                    value: data.value ? data.value.toString() : '',
                    type: data.type || 'PERCENT',
                    start_date: data.start_date || '',
                    end_date: data.end_date || '',
                    usage_limit: data.usage_limit ? data.usage_limit.toString() : '',
                    is_active: data.is_active !== undefined ? data.is_active : true
                });
            } else {
                setFormData({
                    code: '',
                    value: '',
                    type: 'PERCENT',
                    start_date: '',
                    end_date: '',
                    usage_limit: '',
                    is_active: true
                });
            }
        }
    }, [data, isAddOrEdit, state.type]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            code: formData.code,
            value: Number(formData.value),
            type: formData.type,
            start_date: formData.start_date,
            end_date: formData.end_date,
            usage_limit: Number(formData.usage_limit),
            is_active: formData.is_active
        };

        if (onSave) {
            await onSave(payload, state.type, data?.id);
        } else {
            console.log('Sending payload:', payload);
            onClose(true);
        }
        setLoading(false);
    };

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
                        <h2 className="text-xl font-bold text-white tracking-tight">Xác nhận xóa Voucher?</h2>
                        <p className="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                            Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa mã "
                            <span className="text-zinc-200 font-medium">{data?.code}</span>" khỏi hệ thống?
                        </p>
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
                            onClick={async () => {
                                setLoading(true);
                                if (onSave) await onSave(null, 'delete', data?.id);
                                else onClose(true);
                                setLoading(false);
                            }}
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

    if (isAddOrEdit) {
        return (
            <Modal isOpen={true} onClose={onClose} title={state.type === 'add' ? 'Thêm Voucher mới' : 'Chỉnh sửa Voucher'} className="max-w-2xl bg-[#161616] border-border/50">
                <form className="space-y-6 animate-in fade-in zoom-in-95 duration-200" onSubmit={handleSubmit}>
                    <p className="text-sm text-zinc-500 -mt-2 mb-6">Vui lòng điền thông tin chương trình khuyến mãi dưới đây</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Mã Code"
                            placeholder="vd: SALE50, SUMMER24..."
                            required
                            value={formData.code}
                            onChange={(e) => handleInputChange('code', e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />

                        <Select
                            label="Trạng thái"
                            value={formData.is_active ? 'true' : 'false'}
                            onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        >
                            <option value="true">Đang kích hoạt</option>
                            <option value="false">Tạm dừng</option>
                        </Select>

                        <Select
                            label="Loại giảm giá"
                            value={formData.type}
                            onChange={(e) => handleInputChange('type', e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        >
                            <option value="PERCENT">Theo phần trăm (%)</option>
                            <option value="FIXED_AMOUNT">Theo số tiền (VNĐ)</option>
                        </Select>

                        <div className="relative">
                            <Input
                                label="Giá trị giảm"
                                type="number"
                                required
                                min="0"
                                placeholder={`Nhập giá trị ${formData.type === 'PERCENT' ? '(1-100)' : '(ví dụ: 50000)'}`}
                                value={formData.value}
                                onChange={(e) => handleInputChange('value', e.target.value)}
                                className="bg-zinc-900/50 border-zinc-800 rounded-xl pr-12 h-11"
                            />
                            <span className="absolute right-4 top-[34px] text-sm text-zinc-500 pointer-events-none">
                                {formData.type === 'PERCENT' ? '%' : 'VNĐ'}
                            </span>
                        </div>

                        <Input
                            label="Giới hạn sử dụng"
                            type="number"
                            min="1"
                            placeholder="Nhập số lượt có thể dùng"
                            required
                            value={formData.usage_limit}
                            onChange={(e) => handleInputChange('usage_limit', e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />

                        <div className="hidden md:block"></div> {/* Spacer */}

                        <Input
                            label="Thời gian bắt đầu"
                            type="date"
                            required
                            value={formData.start_date}
                            onChange={(e) => handleInputChange('start_date', e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />
                        <Input
                            label="Thời gian kết thúc"
                            type="date"
                            required
                            value={formData.end_date}
                            onChange={(e) => handleInputChange('end_date', e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border/50">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="rounded-full px-6 bg-transparent hover:bg-white/5 text-gray-400 h-10">
                            Hủy
                        </Button>
                        <Button type="submit" variant="primary" disabled={loading} className="rounded-full px-6 h-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary-hover gap-2 disabled:opacity-50">
                            <span className="font-semibold text-lg pb-[2px]"></span> {loading ? 'Đang lưu...' : 'Lưu voucher'}
                        </Button>
                    </div>
                </form>
            </Modal>
        );
    }
    
    return null;
};

export default VoucherModals;
