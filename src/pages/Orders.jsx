import React from 'react';
import { Search, Filter, MoreHorizontal } from 'lucide-react';
import { Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';

const mockOrders = [
    {
        id: 'ORD-0001',
        phone: '0901234567',
        info: 'Dune 2 - Rạp 1 - Ghế G8, G9',
        combo: '2x Combo 1 Bắp 1 Nước',
        payment: 'Momo - TXN123',
        status: 'Thành công',
    },
    {
        id: 'ORD-0002',
        phone: '0912345678',
        info: 'Mai - Rạp 2 - G1, G2',
        combo: '1 Bắp ngọt, 2 Nước',
        payment: 'VNPAY - VN002',
        status: 'Đã hủy',
    },
    {
        id: 'ORD-0003',
        phone: '0987654321',
        info: 'Exhuma - Rạp 3 - A1, A2',
        combo: 'Không có',
        payment: 'Quầy - Q003',
        status: 'Thành công',
    },
    {
        id: 'ORD-0004',
        phone: '0909998888',
        info: 'Dune 2 - Rạp 1 - F5',
        combo: '1 Bắp phô mai',
        payment: 'Thẻ ATM - T004',
        status: 'Thành công',
    },
];

const Orders = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        Danh sách đơn hàng
                    </h2>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative w-full md:w-80">
                    <Input
                        placeholder="Tìm kiếm phim..."
                        className="pl-10 bg-zinc-900/50 border-zinc-800 rounded-full h-11"
                    />
                    <Search className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" />
                </div>

                <div className="relative w-full md:w-48">
                    <select className="flex h-11 w-full appearance-none rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors">
                        <option>Tất cả trạng thái</option>
                        <option>Thành công</option>
                        <option>Đã hủy</option>
                        <option>Đang chờ xử lý</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                        <Filter className="h-4 w-4 text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-border bg-surface/30 flex flex-col overflow-hidden shadow-sm">
                <div className="p-0 bg-transparent">
                    <Table className="border-0 rounded-none bg-transparent">
                        <TableHeader className="bg-transparent border-b border-border/40">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pl-6 h-12">Mã đơn</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12">SĐT khách</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12">Thông tin phim, rạp, ghế</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12">Bắp nước</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12">Thanh toán</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12 text-center">Trạng thái</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pr-6 text-right h-12">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockOrders.map((item) => (
                                <TableRow key={item.id} className="border-b border-border/20 hover:bg-white/5 transition-colors group">
                                    <TableCell className="pl-6 py-5">
                                        <p className="font-medium text-sm text-gray-300">{item.id}</p>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className="text-sm font-medium text-zinc-400">{item.phone}</span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className="text-sm text-zinc-400">{item.info}</span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className="text-sm text-zinc-400">{item.combo}</span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className="text-sm text-zinc-400">{item.payment}</span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center justify-center">
                                            {item.status === 'Thành công' ? (
                                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full w-min whitespace-nowrap">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] leading-none" />
                                                    <span className="text-[11px] font-medium text-emerald-500 leading-none pb-[1px]">{item.status}</span>
                                                </div>
                                            ) : item.status === 'Đã hủy' ? (
                                                <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full w-min whitespace-nowrap text-center mx-auto">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] leading-none" />
                                                    <span className="text-[11px] font-medium text-red-500 leading-none pb-[1px]">{item.status}</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-zinc-400">{item.status}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="pr-6 py-5 text-right">
                                        <div className="flex items-center justify-end text-zinc-500">
                                            <button className="p-1 hover:text-white transition-colors">
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 bg-surface/50 border-t border-border/40">
                    <span className="text-xs font-medium text-zinc-500">
                        Hiển thị 1-4 trong 24 phim
                    </span>
                    <div className="flex items-center gap-1">
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors">
                            &lt;
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/20 font-medium text-sm">
                            1
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors text-sm">
                            2
                        </button>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors text-sm">
                            3
                        </button>
                        <span className="px-1 text-zinc-500">...</span>
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors">
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Orders;
