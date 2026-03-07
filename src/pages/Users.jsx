import React, { useState } from 'react';
import { Search, Plus, Filter, Edit, Trash2, Shield, User } from 'lucide-react';
import { Button, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, UserModals } from '../components/ui';

const mockUsers = [
    {
        id: 'USR-001',
        username: 'nguyenvana',
        fullName: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        status: 'Hoạt động',
    },
    {
        id: 'USR-002',
        username: 'tranthib',
        fullName: 'Trần Thị B',
        email: 'tranthib@example.com',
        status: 'Hoạt động',
    },
    {
        id: 'USR-003',
        username: 'leminhc',
        fullName: 'Lê Minh C',
        email: 'leminhc@example.com',
        status: 'Đã khóa',
    },
    {
        id: 'USR-004',
        username: 'hoangvand',
        fullName: 'Hoàng Văn D',
        email: 'hoangvand@example.com',
        status: 'Hoạt động',
    },
];

const Users = () => {
    const [modalState, setModalState] = useState({ type: null, data: null });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        Danh sách tài khoản
                    </h2>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
                <div className="flex flex-col gap-4 md:flex-row md:items-center flex-1">
                    <div className="relative w-full md:w-80">
                        <Input
                            placeholder="Tìm kiếm tài khoản..."
                            className="pl-10 bg-zinc-900/50 border-zinc-800 rounded-full h-11"
                        />
                        <Search className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" />
                    </div>

                    <div className="relative w-full md:w-48">
                        <select className="flex h-11 w-full appearance-none rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors">
                            <option>Tất cả trạng thái</option>
                            <option>Hoạt động</option>
                            <option>Đã khóa</option>
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
                    Thêm Tài Khoản
                </Button>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-border bg-surface/30 flex flex-col overflow-hidden shadow-sm">
                <div className="p-0 bg-transparent">
                    <Table className="border-0 rounded-none bg-transparent">
                        <TableHeader className="bg-transparent border-b border-border/40">
                            <TableRow className="hover:bg-transparent border-0">
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pl-6 h-12">ID</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12">Tên tài khoản</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12">Tên người dùng</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12">Email</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider h-12 text-center">Trạng thái</TableHead>
                                <TableHead className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider pr-6 text-right h-12">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockUsers.map((item) => (
                                <TableRow key={item.id} className="border-b border-border/20 hover:bg-white/5 transition-colors group">
                                    <TableCell className="pl-6 py-5">
                                        <p className="font-medium text-xs text-zinc-400">{item.id}</p>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className="text-sm text-gray-200 font-medium">{item.username}</span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center shrink-0">
                                                <User className="h-3.5 w-3.5 text-zinc-400" />
                                            </div>
                                            <span className="text-sm text-zinc-300">{item.fullName}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <span className="text-sm text-zinc-400">{item.email}</span>
                                    </TableCell>
                                    <TableCell className="py-5">
                                        <div className="flex items-center justify-center">
                                            {item.status === 'Hoạt động' ? (
                                                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full w-min whitespace-nowrap">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] leading-none" />
                                                    <span className="text-[11px] font-medium text-emerald-500 leading-none pb-[1px]">{item.status}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full w-min whitespace-nowrap text-center mx-auto">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] leading-none" />
                                                    <span className="text-[11px] font-medium text-red-500 leading-none pb-[1px]">{item.status}</span>
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="pr-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 text-zinc-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => setModalState({ type: 'edit', data: item })}
                                                className="p-1.5 hover:text-white transition-colors border border-transparent hover:bg-zinc-800 rounded-md"
                                                title="Chỉnh sửa hoặc xem chi tiết"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-1.5 hover:text-red-500 transition-colors border border-transparent hover:bg-zinc-800 rounded-md"
                                                title={item.status === 'Đã khóa' ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                            >
                                                <Shield className="h-4 w-4" />
                                            </button>
                                            <button
                                                className="p-1.5 hover:text-red-500 transition-colors border border-transparent hover:bg-zinc-800 rounded-md"
                                                title="Xóa tài khoản"
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
                        Hiển thị 1-4 trong 24 tài khoản
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

            <UserModals state={modalState} onClose={() => setModalState({ type: null, data: null })} />
        </div>
    );
};

export default Users;
