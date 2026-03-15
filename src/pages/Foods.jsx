import React, { useState, useEffect } from 'react';
import {
    Search,
    Plus,
    Filter,
    Download,
    Package,
    CheckCircle2,
    AlertCircle,
    Pencil,
    Trash2,
} from 'lucide-react';
import { Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Badge } from '../components/ui';
import FoodModals from '../components/features/food/FoodModals';
import { getFoodsAdmin } from '../api/foodApi';

const Foods = () => {
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageNo, setPageNo] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [modalState, setModalState] = useState({
        type: null, // 'add', 'edit', 'delete', 'view'
        data: null,
    });

    const fetchFoods = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getFoodsAdmin({ pageNo: page, pageSize: 10 });

            // Axios interceptor already unwraps response.data, so response here IS the payload body
            if (response?.success) {
                const data = response.data;
                setFoods(data?.items || []);
                setPageNo(data?.pageNo || 1);
                setTotalPages(data?.totalPages || 1);
                setTotalItems(data?.totalItems || 0);
            }
        } catch (error) {
            console.error('Error fetching foods:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFoods(pageNo);
    }, [pageNo]);

    const closeModal = (shouldRefresh = false) => {
        setModalState({ type: null, data: null });
        if (shouldRefresh) {
            fetchFoods(pageNo);
        }
    };

    const displayStats = [
        {
            title: 'Tổng sản phẩm',
            value: totalItems.toString(),
            icon: Package,
        },
        {
            title: 'Sản phẩm đang bán',
            value: (foods || []).filter(f => !f.is_deleted).length.toString(), // Approximated from current page or backend could provide
            icon: CheckCircle2,
        },
        {
            title: 'Ngừng kinh doanh',
            value: (foods || []).filter(f => f.is_deleted).length.toString(), // Approximated from current page
            icon: AlertCircle,
        },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        Quản lý Đồ ăn / Thức uống
                    </h2>
                    <p className="text-zinc-400 text-sm mt-1">Quản lý kho đồ ăn, thức uống và các gói combo ưu đãi</p>
                </div>
                <Button onClick={() => setModalState({ type: 'add', data: null })} className="gap-2 rounded-full px-5 hover:scale-105 transition-transform duration-200 hover:shadow-[0_0_15px_rgba(229,9,20,0.3)]">
                    <Plus className="h-4 w-4" />
                    Thêm đồ ăn mới
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                {displayStats.map((stat) => (
                    <div
                        key={stat.title}
                        className="rounded-xl border border-border bg-surface/50 p-6 flex flex-col justify-between transition-all duration-300 hover:bg-surface/80 hover:border-zinc-700 hover:shadow-lg group relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between z-10">
                            <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">{stat.title}</span>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/80 ring-1 ring-white/5 group-hover:ring-white/10 transition-all shadow-inner">
                                <stat.icon className={`h-5 w-5 ${stat.title === 'Tổng sản phẩm' ? 'text-primary' : stat.title === 'Sản phẩm đang bán' ? 'text-emerald-500' : 'text-red-500'}`} />
                            </div>
                        </div>
                        <div className="mt-4 z-10">
                            <span className="text-3xl font-bold tracking-tight text-white group-hover:text-primary transition-colors">{stat.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls & Table Background Container */}
            <div className="rounded-xl border border-border bg-surface/30 p-1 flex flex-col gap-1 overflow-hidden shadow-sm">
                {/* <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between border-b border-border/50 bg-surface/50 rounded-t-lg">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        <div className="flex bg-zinc-900/80 p-1 rounded-full border border-zinc-800/60 shadow-inner">
                            {['Tất cả', 'Đồ ăn', 'Thức uống', 'Combo'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${activeTab === tab
                                        ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="secondary" className="gap-2 rounded-full border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600 transition-all bg-zinc-900/50">
                            <Filter className="h-4 w-4 text-zinc-400" />
                            <span>Bộ lọc</span>
                        </Button>
                        <Button variant="secondary" className="gap-2 rounded-full border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600 transition-all bg-zinc-900/50">
                            <Download className="h-4 w-4 text-zinc-400" />
                            <span>Xuất Excel</span>
                        </Button>
                    </div>
                </div> */}

                <div className="p-0 bg-transparent border-t border-border/50">
                    <Table className="border-0 rounded-none bg-transparent">
                        <TableHeader className="bg-transparent border-b border-border/40">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pl-6">Thông tin sản phẩm</TableHead>
                                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Giá bán</TableHead>
                                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider min-w-[150px]">Tồn kho</TableHead>
                                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Trạng thái</TableHead>
                                <TableHead className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider pr-6 text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">Đang tải dữ liệu...</TableCell>
                                </TableRow>
                            ) : !foods || foods.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-zinc-500">Không tìm thấy đồ ăn nào</TableCell>
                                </TableRow>
                            ) : foods.map((item) => (
                                <TableRow key={item.id} className="border-b border-border/20 hover:bg-white/5 transition-colors group">
                                    {/* Info */}
                                    <TableCell className="pl-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-zinc-800 border border-zinc-700/50 shadow-sm shrink-0">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Package className="h-6 w-6 m-auto mt-3 text-zinc-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-200 cursor-pointer hover:text-primary transition-colors inline-block"
                                                    onClick={() => setModalState({ type: 'view', data: item })}
                                                >
                                                    {item.name}
                                                </p>
                                                <p className="text-[11px] text-zinc-500 font-medium mt-0.5 tracking-wide">Mã: {item.id}</p>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* Price */}
                                    <TableCell className="py-4">
                                        <span className="font-bold text-zinc-100">{item.price?.toLocaleString('vi-VN')} VNĐ</span>
                                    </TableCell>

                                    {/* Stock */}
                                    <TableCell className="py-4">
                                        {(() => {
                                            const stock = item.stock_quantity || 0;
                                            const maxStock = 200; // arbitrary max for progress bar
                                            const percentage = Math.min(100, Math.round((stock / maxStock) * 100));
                                            let colorClass = 'bg-emerald-500';
                                            if (stock === 0) colorClass = 'bg-zinc-600';
                                            else if (percentage < 20) colorClass = 'bg-red-500';
                                            else if (percentage < 50) colorClass = 'bg-amber-500';

                                            return (
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-1.5 rounded-full bg-zinc-800/80 overflow-hidden shadow-inner w-full max-w-[80px]">
                                                        <div className={`h-full rounded-full ${colorClass} transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }} />
                                                    </div>
                                                    <span className="w-8 text-right font-medium text-xs text-zinc-300">{stock}</span>
                                                </div>
                                            );
                                        })()}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell className="py-4">
                                        {(() => {
                                            const isDeleted = item.is_deleted;
                                            const isAvailable = item.is_available;
                                            
                                            let statusText = 'Ngừng kinh doanh';
                                            let dotColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
                                            let textColor = 'text-red-500';

                                            if (!isDeleted) {
                                                if (isAvailable === false || isAvailable === 0) {
                                                    statusText = 'Đang bán (hết hàng)';
                                                    dotColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]';
                                                    textColor = 'text-amber-500';
                                                } else {
                                                    statusText = 'Đang bán';
                                                    dotColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]';
                                                    textColor = 'text-emerald-500';
                                                }
                                            }

                                            return (
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                                                    <span className={`text-xs font-medium ${textColor}`}>{statusText}</span>
                                                </div>
                                            );
                                        })()}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="pr-6 py-4 text-right">
                                        {!item.is_deleted && (
                                            <div className="flex items-center justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                                <button onClick={() => setModalState({ type: 'edit', data: item })} className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => setModalState({ type: 'delete', data: item })} className="p-2 rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-800 transition-all">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-surface/50 rounded-b-lg">
                    <span className="text-sm text-zinc-500">
                        Hiển thị trang <span className="font-semibold text-zinc-300">{pageNo}</span> / <span className="font-semibold text-zinc-300">{totalPages}</span> của <span className="font-semibold text-zinc-300">{totalItems}</span> sản phẩm
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={pageNo <= 1}
                            onClick={() => setPageNo(p => p - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            &lt;
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPageNo(i + 1)}
                                className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${pageNo === i + 1 ? 'bg-primary text-white shadow-md shadow-primary/20' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={pageNo >= totalPages}
                            onClick={() => setPageNo(p => p + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            <FoodModals state={modalState} onClose={closeModal} />
        </div >
    );
};

export default Foods;
