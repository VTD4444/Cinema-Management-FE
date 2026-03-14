import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit, Trash2 } from 'lucide-react';
import { Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import VoucherModals from '../components/features/voucher/VoucherModals';
import { getVouchersAdmin, createVoucher, updateVoucher, deleteVoucher } from '../api/voucherApi';
// import { toast } from 'react-hot-toast'; // Optional: Use for notifications if needed in the future

const Vouchers = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState({ type: null, data: null });

    // Pagination state
    const [pageNo, setPageNo] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const response = await getVouchersAdmin({ pageNo, pageSize: 10 });

            // Extract items correctly matching the backend response
            const items = response?.data?.items || response?.items || [];
            if (response?.data?.totalPages || response?.totalPages) {
                setTotalPages(response?.data?.totalPages || response?.totalPages);
            }
            if (response?.data?.totalItems || response?.totalItems !== undefined) {
                setTotalItems(response?.data?.totalItems || response?.totalItems);
            }

            setVouchers(items);
        } catch (error) {
            console.error('Lỗi khi tải danh sách voucher:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, [pageNo]);

    const handleSaveVoucher = async (payload, type, id) => {
        try {
            if (type === 'add') {
                const res = await createVoucher(payload);
                if (res?.success) {
                    setModalState({ type: null, data: null });
                    fetchVouchers();
                } else {
                    alert(res?.message || 'Có lỗi xảy ra khi thêm voucher');
                }
            } else if (type === 'edit') {
                const res = await updateVoucher(id, payload);
                if (res?.success) {
                    setModalState({ type: null, data: null });
                    fetchVouchers();
                } else {
                    alert(res?.message || 'Có lỗi xảy ra khi cập nhật voucher');
                }
            } else if (type === 'delete') {
                const res = await deleteVoucher(id);
                if (res?.success) {
                    setModalState({ type: null, data: null });
                    fetchVouchers();
                } else {
                    alert(res?.message || 'Có lỗi xảy ra khi xóa voucher');
                }
            }
        } catch (error) {
            console.error('Lỗi khi thao tác voucher:', error);
            alert('Có lỗi hệ thống, vui lòng thử lại');
        }
    };

    const formatDate = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return d.toLocaleDateString('vi-VN');
    };

    const formatDiscountType = (item) => {
        if (item.type === 'PERCENT') {
            return `Giảm ${item.value}%`;
        }
        return `Giảm ${item.value?.toLocaleString('vi-VN')}đ`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        Danh sách Voucher
                    </h2>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div className="flex flex-col gap-4 md:flex-row md:items-center flex-1">
                    <div className="relative w-full md:w-80">
                        <Input
                            placeholder="Tìm kiếm voucher..."
                            className="pl-10 bg-zinc-900/50 border-zinc-800 rounded-full h-11"
                        />
                        <Search className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="relative w-full md:w-48">
                        <select className="flex h-11 w-full appearance-none rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors">
                            <option>Tất cả trạng thái</option>
                            <option>Đang kích hoạt</option>
                            <option>Tạm dừng</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                            <Filter className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => setModalState({ type: 'add', data: null })}
                    className="gap-2 rounded-full px-5 h-11 bg-primary hover:bg-primary-hover text-white font-medium shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:scale-105 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Thêm voucher
                </Button>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-border bg-surface/30 flex flex-col overflow-hidden shadow-sm">
                <div className="p-0 bg-transparent flex-1 overflow-x-auto">
                    <Table className="border-0 rounded-none bg-transparent min-w-[800px]">
                        <TableHeader className="bg-transparent border-b border-border/40">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pl-6 h-12 w-16">
                                    ID
                                </TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12">
                                    Mã Code
                                </TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center h-12">
                                    Loại giảm giá
                                </TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center h-12">
                                    Thời gian hiệu lực
                                </TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center h-12">
                                    Số lượng
                                </TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center h-12">
                                    Trạng thái
                                </TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pr-6 text-right h-12 w-28">
                                    Hành động
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                                        Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : vouchers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                                        Không tìm thấy voucher nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                vouchers.map((item) => (
                                    <TableRow key={item.id} className="border-b border-border/20 hover:bg-white/5 transition-colors group">
                                        <TableCell className="pl-6 py-4">
                                            <span className="text-xs text-zinc-500 font-mono">#{item.id}</span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span className="text-sm font-bold text-white tracking-wider bg-zinc-800/80 px-2 py-1 rounded border border-zinc-700">
                                                {item.code}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <span className="text-sm font-medium text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                                                {formatDiscountType(item)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[11px] text-zinc-400">{formatDate(item.start_date)}</span>
                                                <span className="text-[10px] text-zinc-600">đến</span>
                                                <span className="text-[11px] text-zinc-400">{formatDate(item.end_date)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <span className="text-sm text-zinc-300 font-medium">{item.usage_limit}</span>
                                            <span className="text-[10px] text-zinc-500 block">lượt dùng</span>
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            {item.is_deleted ? (
                                                <span className="text-[11px] text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full border border-zinc-700">
                                                    Tạm dừng
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                                    Đang áp dụng
                                                </span>

                                            )}
                                        </TableCell>
                                        <TableCell className="pr-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 text-zinc-500 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setModalState({ type: 'edit', data: item })}
                                                    className="p-2 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setModalState({ type: 'delete', data: item })}
                                                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {!loading && vouchers.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-surface/50 border-t border-border/40">
                        <span className="text-xs font-medium text-zinc-500">
                            Hiển thị {(pageNo - 1) * 10 + 1}-{Math.min(pageNo * 10, totalItems)} trong {totalItems} voucher
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPageNo(p => Math.max(1, p - 1))}
                                disabled={pageNo === 1}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                            >
                                &lt;
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setPageNo(i + 1)}
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${pageNo === i + 1
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setPageNo(p => Math.min(totalPages, p + 1))}
                                disabled={pageNo === totalPages}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors disabled:opacity-50"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <VoucherModals
                state={modalState}
                onClose={() => setModalState({ type: null, data: null })}
                onSave={handleSaveVoucher}
            />
        </div>
    );
};

export default Vouchers;
