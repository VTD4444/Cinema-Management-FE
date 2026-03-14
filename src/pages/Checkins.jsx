import React, { useState } from 'react';
import { Search, ScanLine, Ticket, User, CheckCircle2, AlertTriangle, Coffee, RotateCcw } from 'lucide-react';
import { Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '../components/ui';

const mockHistory = [
    {
        id: 'TK-882312',
        customer: { name: 'Lê Hoàng Nam', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80' },
        movie: 'Dune: Part Two',
        showtime: '19:30 - Cinema 05',
        time: '19:28:45',
        status: 'Thành công'
    },
    {
        id: 'TK-882311',
        customer: { name: 'Trần Minh', avatar: null, initials: 'TM' },
        movie: 'Kung Fu Panda 4',
        showtime: '19:15 - Cinema 02',
        time: '19:12:10',
        status: 'Thành công'
    },
    {
        id: 'TK-882310',
        customer: { name: 'Hoàng Anh', avatar: null, initials: 'HA' },
        movie: 'Mai',
        showtime: '19:00 - Cinema 01',
        time: '19:05:33',
        status: 'Thành công'
    },
    {
        id: 'TK-882309',
        customer: { name: 'Nguyễn Lan', avatar: null, initials: 'NL' },
        movie: 'Godzilla x Kong',
        showtime: '18:45 - Cinema 03',
        time: '18:50:12',
        status: 'Thất bại'
    },
    {
        id: 'TK-882308',
        customer: { name: 'Võ Thanh', avatar: null, initials: 'VT' },
        movie: 'Exhuma: Quật Mộ Trùng Ma',
        showtime: '18:30 - Cinema 04',
        time: '18:35:55',
        status: 'Thành công'
    }
];

const Checkins = () => {
    const [bookingCode, setBookingCode] = useState('TK - 882312');
    const [isSearched, setIsSearched] = useState(true);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        Check-in Vé
                    </h2>
                </div>
            </div>

            {/* Search Box */}
            <div className="rounded-xl border border-border bg-surface/50 p-6 flex flex-col gap-4 shadow-sm">
                <label className="text-sm font-medium text-zinc-400">Nhập mã Booking</label>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <Input
                            value={bookingCode}
                            onChange={(e) => setBookingCode(e.target.value)}
                            className="pl-12 bg-zinc-900/80 border-zinc-800 text-lg h-12 rounded-lg font-mono tracking-wider focus:ring-primary focus:border-primary transition-all"
                            placeholder="Nhập mã booking..."
                        />
                    </div>
                    <Button 
                        className="h-12 px-8 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(229,9,20,0.3)] hover:scale-105 transition-all gap-2"
                        onClick={() => setIsSearched(true)}
                    >
                        <ScanLine className="h-5 w-5" />
                        Tìm kiếm
                    </Button>
                </div>
            </div>

            {isSearched && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Ticket Info Card */}
                    <div className="lg:col-span-2 rounded-xl border border-border bg-surface/50 p-6 flex flex-col gap-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-border/50 pb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Ticket className="h-5 w-5 text-primary" />
                                Thông tin vé
                            </h3>
                            <div className="px-3 py-1 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider">
                                Chưa Check-in
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Poster */}
                            <div className="w-full md:w-48 h-72 shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-lg relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80" 
                                    alt="Movie Poster" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                                    2D Phụ đề
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 flex flex-col justify-center">
                                <h1 className="text-3xl font-black text-white mb-2 leading-tight">Dune: Part Two</h1>
                                <p className="text-sm text-zinc-400 mb-6 flex items-center gap-2">
                                    <span className="flex items-center gap-1"><span className="text-zinc-500">🕒</span> 166 phút</span>
                                    <span>•</span>
                                    <span>Sci-Fi, Hành động</span>
                                </p>

                                <div className="grid grid-cols-2 gap-y-6 gap-x-4 p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Rạp chiếu</p>
                                        <p className="font-bold text-white">CGV Vincom Center</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Phòng chiếu</p>
                                        <p className="font-bold text-white">Cinema 05</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Suất chiếu</p>
                                        <p className="font-bold text-primary text-lg leading-none">19:30</p>
                                        <p className="text-xs text-zinc-400 mt-1">Hôm nay, 15/05/2024</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-2">Ghế ngồi</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-primary/20 text-primary rounded font-bold text-sm border border-primary/30">F12</span>
                                            <span className="px-2 py-1 bg-primary/20 text-primary rounded font-bold text-sm border border-primary/30">F13</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Combos */}
                                <div className="mt-4 flex items-center gap-2 text-sm text-zinc-300 bg-white/5 border border-white/10 px-4 py-3 rounded-lg w-max">
                                    <Coffee className="h-4 w-4 text-zinc-400" />
                                    <span>2 Combo Bắp Nước Lớn</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Card */}
                    <div className="rounded-xl border border-border bg-surface/50 p-6 flex flex-col shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-2 border-b border-border/50 pb-4 mb-6">
                            <User className="h-5 w-5 text-gray-400" />
                            <h3 className="text-lg font-bold text-white">Khách hàng</h3>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <div className="relative">
                                <img 
                                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" 
                                    alt="Avatar" 
                                    className="h-20 w-20 rounded-full object-cover border-[3px] border-surface shadow-lg z-10 relative"
                                />
                                <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-md scale-125 z-0"></div>
                            </div>
                            <h2 className="text-xl font-bold text-white mt-4">Lê Hoàng Nam</h2>
                            <span className="text-xs font-medium text-amber-400 mt-1 uppercase tracking-wider">Thành viên Vàng</span>
                        </div>

                        <div className="space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-zinc-500 uppercase tracking-wider font-medium text-[10px]">SĐT:</span>
                                <span className="text-sm font-semibold text-zinc-200">098 *** 8888</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-zinc-500 uppercase tracking-wider font-medium text-[10px]">Email:</span>
                                <span className="text-sm font-semibold text-zinc-200">nam***@gmail.com</span>
                            </div>
                        </div>

                        <div className="mt-auto space-y-4 pt-6 border-t border-border/50">
                            <div className="flex justify-between items-end">
                                <span className="text-sm text-zinc-400">Tổng tiền vé:</span>
                                <span className="text-xl font-bold text-white">240.000đ</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-zinc-400">Trạng thái thanh toán:</span>
                                <span className="text-sm font-bold text-emerald-500 flex items-center gap-1">
                                    Đã thanh toán
                                </span>
                            </div>
                            
                            <Button className="w-full h-14 text-base font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2 mt-2">
                                <CheckCircle2 className="h-5 w-5" />
                                XÁC NHẬN CHECK-IN
                            </Button>
                            <Button variant="ghost" className="w-full h-11 text-sm font-medium text-zinc-400 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2 mt-2">
                                <AlertTriangle className="h-4 w-4" />
                                Báo lỗi vé
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* History Table */}
            <div className="rounded-xl border border-border bg-surface/50 flex flex-col overflow-hidden shadow-sm mt-8">
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <RotateCcw className="h-5 w-5 text-zinc-400" />
                        Lịch sử Check-in vừa thực hiện
                    </h3>
                    <button className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                        Xem tất cả &rarr;
                    </button>
                </div>
                <div className="p-0 bg-transparent">
                    <Table className="border-0 rounded-none bg-transparent">
                        <TableHeader className="bg-transparent border-b border-border/40">
                            <TableRow className="hover:bg-transparent border-0 bg-zinc-900/50">
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pl-6 h-12 w-[15%]">Mã Đơn</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12 w-[20%]">Khách hàng</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12 w-[20%]">Phim</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12 w-[20%]">Suất chiếu</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12 w-[10%]">Thời gian</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pr-6 text-right h-12 w-[15%]">Trạng thái</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockHistory.map((item) => (
                                <TableRow key={item.id} className="border-b border-border/20 hover:bg-white/2 transition-colors">
                                    <TableCell className="pl-6 py-4">
                                        <span className="font-mono text-xs font-semibold text-zinc-300">{item.id}</span>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-3">
                                            {item.customer.avatar ? (
                                                <img src={item.customer.avatar} alt={item.customer.name} className="h-8 w-8 rounded-full object-cover border border-zinc-700" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-400 shrink-0">
                                                    {item.customer.initials}
                                                </div>
                                            )}
                                            <span className="text-sm font-semibold text-zinc-200">{item.customer.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="text-sm text-zinc-400">{item.movie}</span>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="text-sm text-zinc-400">{item.showtime}</span>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="text-sm font-mono text-zinc-500">{item.time}</span>
                                    </TableCell>
                                    <TableCell className="pr-6 py-4 text-right">
                                        <div className="flex justify-end">
                                            {item.status === 'Thành công' ? (
                                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full w-min whitespace-nowrap">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] leading-none" />
                                                    <span className="text-[10px] font-medium text-emerald-500 leading-none pb-[1px]">Thành công</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full w-min whitespace-nowrap">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] leading-none" />
                                                    <span className="text-[10px] font-medium text-red-500 leading-none pb-[1px]">Thất bại</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
};

export default Checkins;
