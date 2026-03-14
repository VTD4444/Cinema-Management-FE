import React from 'react';
import { Search, Eye, Trash2, Reply } from 'lucide-react';
import { Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';

const mockFeedbacks = [
    {
        id: 'FB-001',
        senderName: 'Nguyen Van A',
        email: 'user@gmail.com',
        subject: 'Lỗi thanh toán',
        message: 'Tôi không thể thanh toán vé qua cổng VNPAY, hệ thống báo lỗi kết nối.',
        date: '14/03/2026',
        status: 'Chưa xử lý'
    },
    {
        id: 'FB-002',
        senderName: 'Trần Thị B',
        email: 'tranthib_99@hotmail.com',
        subject: 'Góp ý về rạp chiếu',
        message: 'Máy lạnh ở Rạp số 2 chi nhánh Landmark quá lạnh. Vui lòng điều chỉnh lại cho phù hợp.',
        date: '13/03/2026',
        status: 'Đã xử lý'
    },
    {
        id: 'FB-003',
        senderName: 'Le Minh C',
        email: 'leminh.c@company.vn',
        subject: 'Không nhận được mã vé',
        message: 'Tôi đã thanh toán thành công lúc 14:00 nhưng đến giờ vẫn chưa nhận được SMS hay Email xuất vé.',
        date: '13/03/2026',
        status: 'Chưa xử lý'
    },
    {
        id: 'FB-004',
        senderName: 'Hoang Van D',
        email: 'hoang_vd_test@example.com',
        subject: 'Hỏi về quy định mang thức ăn',
        message: 'Tôi có thể mang nước uống mua từ bên ngoài vào rạp không? Xin cảm ơn.',
        date: '12/03/2026',
        status: 'Đã xử lý'
    }
];

const Feedbacks = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        Quản lý Phản hồi
                    </h2>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Input
                        placeholder="Tìm kiếm người gửi, email hoặc chủ đề..."
                        className="pl-10 bg-zinc-900/50 border-zinc-800 rounded-full h-11"
                    />
                    <Search className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" />
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-border bg-surface/30 flex flex-col overflow-hidden shadow-sm">
                <div className="p-0 bg-transparent">
                    <Table className="border-0 rounded-none bg-transparent">
                        <TableHeader className="bg-transparent border-b border-border/40">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pl-6 h-12 w-[20%]">Người gửi</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12 w-[20%]">Chủ đề</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12 w-[35%]">Nội dung</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center h-12 w-[10%]">Trạng thái</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pr-6 text-right h-12 w-[15%]">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockFeedbacks.map((item) => (
                                <TableRow key={item.id} className="border-b border-border/20 hover:bg-white/5 transition-colors group">
                                    <TableCell className="pl-6 py-5">
                                        <div>
                                            <p className="font-medium text-sm text-gray-200">{item.senderName}</p>
                                            <p className="text-xs text-zinc-500 mt-0.5">{item.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className="text-sm font-medium text-zinc-300">{item.subject}</span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <p className="text-sm text-zinc-400 line-clamp-2 max-w-md" title={item.message}>{item.message}</p>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center justify-center">
                                            {item.status === 'Đã xử lý' ? (
                                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full w-min whitespace-nowrap">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] leading-none" />
                                                    <span className="text-[11px] font-medium text-emerald-500 leading-none pb-[1px]">{item.status}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-full w-min whitespace-nowrap text-center mx-auto">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] leading-none" />
                                                    <span className="text-[11px] font-medium text-amber-500 leading-none pb-[1px]">{item.status}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="pr-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 text-zinc-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                            <button 
                                                className="p-1.5 hover:text-white transition-colors border border-transparent hover:bg-zinc-800 rounded-md"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button 
                                                className="p-1.5 hover:text-white transition-colors border border-transparent hover:bg-zinc-800 rounded-md"
                                                title="Phản hồi qua Email"
                                            >
                                                <Reply className="h-4 w-4" />
                                            </button>
                                            <button 
                                                className="p-1.5 hover:text-red-500 transition-colors border border-transparent hover:bg-zinc-800 rounded-md"
                                                title="Xóa phản hồi"
                                            >
                                                <Trash2 className="h-4 w-4" />
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
                        Hiển thị 1-4 trong 12 phản hồi
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
                        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors">
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Feedbacks;
