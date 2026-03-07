import React from 'react';
import { Modal, Input, Button } from './index';

const VoucherModals = ({ state, onClose }) => {
    if (!state.type) return null;

    const data = state.data;

    return (
        <Modal isOpen={true} onClose={onClose} title={state.type === 'add' ? 'Thêm Voucher mới' : 'Chỉnh sửa Voucher'} className="max-w-2xl bg-[#161616] border-border/50">
            <form className="space-y-6 animate-in fade-in zoom-in-95 duration-200" onSubmit={(e) => e.preventDefault()}>
                <p className="text-sm text-zinc-500 -mt-2 mb-6">Vui lòng điền thông tin chương trình khuyến mãi dưới đây</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                        label="Tên chương trình"
                        placeholder="Nhập tên chương trình khuyến mãi..."
                        defaultValue={data?.name}
                        className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                    />
                    <Input
                        label="Mã Code"
                        placeholder="Nhập mã voucher (vd: SUMMER24)"
                        defaultValue={data?.code}
                        className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                    />
                    <Input
                        label="Loại giảm giá"
                        placeholder="vd: Giảm 10% hoặc Giảm 50,000đ"
                        defaultValue={data?.discountType}
                        className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                    />
                    <Input
                        label="Số lượng"
                        type="number"
                        placeholder="Nhập số lượng phát hành"
                        defaultValue={data?.quantity ? parseInt(data.quantity) : ''}
                        className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                    />
                    <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                        <Input
                            label="Thời gian bắt đầu"
                            type="date"
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />
                        <Input
                            label="Thời gian kết thúc"
                            type="date"
                            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border/50">
                    <Button variant="ghost" onClick={onClose} className="rounded-full px-6 bg-transparent hover:bg-white/5 text-gray-400 h-10">
                        Hủy
                    </Button>
                    <Button variant="primary" className="rounded-full px-6 h-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary-hover gap-2">
                        <span className="font-semibold text-lg pb-[2px]"></span> Lưu voucher
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default VoucherModals;
