import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Reply, CheckCircle, X, Send, MessageSquare } from 'lucide-react';
import { Input, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Modal, Textarea } from '../components/ui';
import { getContacts, deleteContact, replyContact, resolveContact, getContactById } from '../api/contactApi';

const STATUS_MAP = {
    PENDING: { label: 'Chưa xử lý', dotClass: 'bg-amber-500', bgClass: 'bg-amber-500/10 border-amber-500/20', textClass: 'text-amber-500' },
    PROCESSING: { label: 'Đang xử lý', dotClass: 'bg-blue-500', bgClass: 'bg-blue-500/10 border-blue-500/20', textClass: 'text-blue-500' },
    RESOLVED: { label: 'Đã giải quyết', dotClass: 'bg-emerald-500', bgClass: 'bg-emerald-500/10 border-emerald-500/20', textClass: 'text-emerald-500' },
};

const getStatusBadge = (status) => {
    const normalized = status?.toUpperCase();
    const config = STATUS_MAP[normalized] || STATUS_MAP.PENDING;
    return (
        <div className={`flex items-center gap-1.5 ${config.bgClass} border px-2 py-1 rounded-full w-min whitespace-nowrap`}>
            <div className={`h-1.5 w-1.5 rounded-full ${config.dotClass} shadow-[0_0_8px_rgba(0,0,0,0.3)] leading-none`} />
            <span className={`text-[11px] font-medium ${config.textClass} leading-none pb-[1px]`}>{config.label}</span>
        </div>
    );
};

const Feedbacks = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageNo, setPageNo] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Modal states
    const [viewContact, setViewContact] = useState(null); // For detail view
    const [replyModalContact, setReplyModalContact] = useState(null); // For reply
    const [deleteModalContact, setDeleteModalContact] = useState(null); // For delete confirm
    const [replyMessage, setReplyMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState('');

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await getContacts({ pageNo, pageSize: 10 });
            if (res?.success) {
                setContacts(res.data?.items || res.data || []);
                setTotalPages(res.data?.totalPages || 1);
                setTotalItems(res.data?.totalItems || res.data?.total || 0);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [pageNo]);

    // View detail
    const handleView = async (item) => {
        try {
            const res = await getContactById(item.id);
            if (res?.success && res.data) {
                setViewContact(res.data);
            } else {
                setViewContact(item);
            }
        } catch {
            setViewContact(item);
        }
    };

    // Reply
    const handleReplySubmit = async () => {
        if (!replyMessage.trim()) {
            setActionError('Vui lòng nhập nội dung phản hồi.');
            return;
        }
        setActionLoading(true);
        setActionError('');
        try {
            const res = await replyContact(replyModalContact.id, { replyMessage: replyMessage.trim() });
            if (res?.success !== false) {
                setReplyModalContact(null);
                setReplyMessage('');
                fetchContacts();
            } else {
                setActionError(res?.message || 'Không thể gửi phản hồi.');
            }
        } catch (err) {
            setActionError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    // Resolve
    const handleResolve = async (id) => {
        setActionLoading(true);
        try {
            const res = await resolveContact(id);
            if (res?.success !== false) {
                fetchContacts();
                if (viewContact?.id === id) setViewContact(null);
            }
        } catch (err) {
            console.error('Resolve error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    // Delete
    const handleDeleteConfirm = async () => {
        setActionLoading(true);
        setActionError('');
        try {
            const res = await deleteContact(deleteModalContact.id);
            if (res?.success !== false) {
                setDeleteModalContact(null);
                fetchContacts();
            } else {
                setActionError(res?.message || 'Xóa thất bại');
            }
        } catch (err) {
            setActionError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    Quản lý Phản hồi
                </h2>
            </div>



            {/* Data Table */}
            <div className="rounded-xl border border-border bg-surface/30 flex flex-col overflow-hidden shadow-sm">
                <div className="p-0 bg-transparent">
                    <Table className="border-0 rounded-none bg-transparent">
                        <TableHeader className="bg-transparent border-b border-border/40">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pl-6 h-12 w-[20%]">Người gửi</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12 w-[15%]">Chủ đề</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12 w-[30%]">Nội dung</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12 w-[10%]">Ngày</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider text-center h-12 w-[10%]">Trạng thái</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pr-6 text-right h-12 w-[15%]">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                                        Đang tải dữ liệu...
                                    </TableCell>
                                </TableRow>
                            ) : contacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                                        Không có phản hồi nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                contacts.map((item) => {
                                    const status = item.status?.toUpperCase();
                                    return (
                                        <TableRow key={item.id} className="border-b border-border/20 hover:bg-white/5 transition-colors group">
                                            <TableCell className="pl-6 py-5">
                                                <div>
                                                    <p className="font-medium text-sm text-gray-200">{item.full_name || item.senderName || '—'}</p>
                                                    <p className="text-xs text-zinc-500 mt-0.5">{item.email || '—'}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <span className="text-sm font-medium text-zinc-300">{item.subject || '—'}</span>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <p className="text-sm text-zinc-400 line-clamp-2 max-w-md" title={item.message}>{item.message || '—'}</p>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <span className="text-xs text-zinc-500">{formatDate(item.created_at || item.date)}</span>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center justify-center">
                                                    {getStatusBadge(item.status)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-6 py-5 text-right">
                                                {!item.is_deleted && (
                                                    <div className="flex items-center justify-end gap-1.5 text-zinc-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                                        <button
                                                            onClick={() => handleView(item)}
                                                            className="p-1.5 hover:text-white transition-colors border border-transparent hover:bg-zinc-800 rounded-md"
                                                            title="Xem chi tiết"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        {status !== 'RESOLVED' && (
                                                            <button
                                                                onClick={() => { setReplyModalContact(item); setReplyMessage(''); setActionError(''); }}
                                                                className="p-1.5 hover:text-blue-400 transition-colors border border-transparent hover:bg-zinc-800 rounded-md"
                                                                title="Phản hồi"
                                                            >
                                                                <Reply className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {status !== 'RESOLVED' && (
                                                            <button
                                                                onClick={() => handleResolve(item.id)}
                                                                className="p-1.5 hover:text-emerald-400 transition-colors border border-transparent hover:bg-zinc-800 rounded-md"
                                                                title="Đánh dấu đã giải quyết"
                                                            >
                                                                <CheckCircle className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => { setDeleteModalContact(item); setActionError(''); }}
                                                            className="p-1.5 hover:text-red-500 transition-colors border border-transparent hover:bg-zinc-800 rounded-md"
                                                            title="Xóa phản hồi"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {!loading && contacts.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-surface/50 border-t border-border/40">
                        <span className="text-xs font-medium text-zinc-500">
                            Hiển thị {(pageNo - 1) * 10 + 1}-{Math.min(pageNo * 10, totalItems)} trong {totalItems} phản hồi
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
                                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors text-sm ${pageNo === i + 1
                                        ? "bg-primary text-white shadow-md shadow-primary/20 font-medium"
                                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
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

            {/* ===== VIEW DETAIL MODAL ===== */}
            {viewContact && (
                <Modal isOpen onClose={() => setViewContact(null)} title="Chi tiết phản hồi" className="max-w-xl bg-[#161616] border-border/50">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Người gửi</span>
                                <p className="text-sm text-white font-medium mt-1">{viewContact.full_name || viewContact.senderName || '—'}</p>
                            </div>
                            <div>
                                <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Email</span>
                                <p className="text-sm text-zinc-300 mt-1">{viewContact.email || '—'}</p>
                            </div>
                            <div>
                                <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Số điện thoại</span>
                                <p className="text-sm text-zinc-300 mt-1">{viewContact.phone || '—'}</p>
                            </div>
                            <div>
                                <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Trạng thái</span>
                                <div className="mt-1">{getStatusBadge(viewContact.status)}</div>
                            </div>
                        </div>
                        <div>
                            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Chủ đề</span>
                            <p className="text-sm text-zinc-200 font-medium mt-1">{viewContact.subject || '—'}</p>
                        </div>
                        <div>
                            <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Nội dung</span>
                            <p className="text-sm text-zinc-300 mt-1 whitespace-pre-wrap bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">{viewContact.message || '—'}</p>
                        </div>
                        {viewContact.reply_message && (
                            <div>
                                <span className="text-[11px] text-blue-400 uppercase tracking-wider font-bold">Phản hồi của Admin</span>
                                <p className="text-sm text-blue-300 mt-1 whitespace-pre-wrap bg-blue-500/5 rounded-lg p-3 border border-blue-500/20">{viewContact.reply_message}</p>
                            </div>
                        )}
                        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                            {viewContact.status?.toUpperCase() !== 'RESOLVED' && (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setReplyModalContact(viewContact);
                                            setReplyMessage('');
                                            setActionError('');
                                            setViewContact(null);
                                        }}
                                        className="rounded-full px-5 h-9 gap-2 text-blue-400 hover:text-blue-300"
                                    >
                                        <Reply className="h-4 w-4" /> Phản hồi
                                    </Button>
                                    {viewContact.status?.toUpperCase() !== 'RESOLVED' && (
                                        <Button
                                            onClick={() => { handleResolve(viewContact.id); setViewContact(null); }}
                                            className="rounded-full px-5 h-9 gap-2 bg-emerald-600 hover:bg-emerald-500"
                                        >
                                            <CheckCircle className="h-4 w-4" /> Đánh dấu giải quyết
                                        </Button>
                                    )}
                                </>
                            )}
                            <Button variant="ghost" onClick={() => setViewContact(null)} className="rounded-full px-5 h-9 text-gray-400">
                                Đóng
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ===== REPLY MODAL ===== */}
            {replyModalContact && (
                <Modal isOpen onClose={() => setReplyModalContact(null)} title="Phản hồi liên hệ" className="max-w-xl bg-[#161616] border-border/50">
                    <div className="space-y-4">
                        <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800">
                            <p className="text-xs text-zinc-500 mb-1">Gửi từ: <span className="text-zinc-300">{replyModalContact.full_name || replyModalContact.senderName}</span> ({replyModalContact.email})</p>
                            <p className="text-xs text-zinc-500 mb-1">Chủ đề: <span className="text-zinc-300">{replyModalContact.subject}</span></p>
                            <p className="text-sm text-zinc-400 mt-2">{replyModalContact.message}</p>
                        </div>

                        <Textarea
                            label="Nội dung phản hồi"
                            placeholder="Nhập nội dung phản hồi..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800 min-h-[120px] rounded-xl"
                            required
                        />

                        {actionError && <p className="text-sm text-red-500">{actionError}</p>}

                        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
                            <Button type="button" variant="ghost" onClick={() => setReplyModalContact(null)} disabled={actionLoading} className="rounded-full px-5 h-9 text-gray-400">
                                Hủy
                            </Button>
                            <Button onClick={handleReplySubmit} disabled={actionLoading} className="rounded-full px-5 h-9 gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
                                <Send className="h-4 w-4" /> {actionLoading ? 'Đang gửi...' : 'Gửi phản hồi'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ===== DELETE CONFIRM MODAL ===== */}
            {deleteModalContact && (
                <Modal isOpen onClose={() => setDeleteModalContact(null)} className="max-w-md bg-[#161616] border-border/50 relative">
                    <div className="p-2 space-y-6 flex flex-col items-center justify-center text-center mt-2">
                        <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                            <span className="text-red-500 font-semibold text-sm tracking-widest lowercase">warning</span>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold text-white tracking-tight">Xác nhận xóa phản hồi?</h2>
                            <p className="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                                Bạn có chắc chắn muốn xóa phản hồi từ "<span className="text-zinc-200 font-medium">{deleteModalContact.full_name || deleteModalContact.senderName || deleteModalContact.email}</span>" không?
                            </p>
                            {actionError && <p className="text-sm font-medium text-red-500">{actionError}</p>}
                        </div>
                        <div className="flex w-full gap-3 pt-2">
                            <Button variant="secondary" onClick={() => setDeleteModalContact(null)} disabled={actionLoading} className="flex-1 rounded-full bg-zinc-800/80 border-zinc-700/50 hover:bg-zinc-700 text-gray-300">
                                Hủy
                            </Button>
                            <Button variant="danger" onClick={handleDeleteConfirm} disabled={actionLoading} className="flex-1 rounded-full shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-shadow disabled:opacity-50">
                                {actionLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Feedbacks;
