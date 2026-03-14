import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select, Textarea } from '../../ui';
import { ImagePlus, Package, Pencil } from 'lucide-react';
import { createFood, updateFood, deleteFood } from '../../../api/foodApi';

const FoodModals = ({ state, onClose }) => {
    if (!state.type) return null;

    const isDelete = state.type === 'delete';
    const isView = state.type === 'view';
    const isAddOrEdit = state.type === 'add' || state.type === 'edit';
    const data = state.data;

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80',
        description: '',
        price: '',
        stock_quantity: '',
        is_available: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAddOrEdit) {
            if (data) {
                setFormData({
                    name: data.name || '',
                    image_url: data.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80',
                    description: data.description || '',
                    price: data.price ? data.price.toString() : '',
                    stock_quantity: data.stock_quantity ? data.stock_quantity.toString() : '',
                    is_available: data.status !== 'Ngừng kinh doanh'
                });
            } else {
                setFormData({
                    name: '',
                    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80',
                    description: '',
                    price: '',
                    stock_quantity: '',
                    is_available: true
                });
            }
            setError(null);
        }
    }, [data, isAddOrEdit, state.type]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            ...(state.type === 'edit' && { id: data.id }),
            name: formData.name,
            image_url: formData.image_url,
            description: formData.description,
            price: Number(formData.price),
            stock_quantity: Number(formData.stock_quantity),
            is_available: formData.is_available
        };

        try {
            if (state.type === 'add') {
                const response = await createFood(payload);
                if (response?.success) {
                    onClose(true);
                } else {
                    throw new Error(response?.message || 'Thêm món thất bại');
                }
            } else if (state.type === 'edit') {
                const response = await updateFood(data.id, payload);
                console.log(response);
                if (response?.success) {
                    onClose(true);
                } else {
                    throw new Error(response?.message || 'Cập nhật món thất bại');
                }
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await deleteFood(data.id);
            if (response?.success) {
                onClose(true);
            } else {
                throw new Error(response?.message || 'Xóa món thất bại');
            }
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi xóa');
        } finally {
            setLoading(false);
        }
    };

    // Render Delete Validation/Confirmation Modal
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
                        <h2 className="text-xl font-bold text-white tracking-tight">Xác nhận xóa món?</h2>
                        <p className="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                            Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa "
                            <span className="text-zinc-200 font-medium">{data?.name}</span>" khỏi hệ thống?
                        </p>
                        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
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
                            onClick={handleDelete}
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

    // Render Add/Edit Modal
    if (isAddOrEdit) {
        return (
            <Modal
                isOpen={true}
                onClose={onClose}
                title={state.type === 'add' ? 'Thêm Món mới' : 'Thêm / Chỉnh sửa Món'}
                className="max-w-3xl bg-[#161616] border-border/50"
            >
                <form
                    className="space-y-6 animate-in fade-in zoom-in-95 duration-200"
                    onSubmit={handleSubmit}
                >
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-zinc-500 mb-0">
                            Vui lòng điền đầy đủ thông tin chi tiết dưới đây
                        </p>
                        {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left: Image Upload */}
                        <div className="col-span-1 space-y-3">
                            <label className="text-sm font-medium text-gray-300">Hình ảnh</label>
                            <div className="aspect-square w-full rounded-2xl border-2 border-dashed border-zinc-700/60 bg-zinc-900/50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-zinc-800/50 hover:border-zinc-500/50 transition-all group overflow-hidden relative">
                                {formData.image_url ? (
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                    />
                                ) : null}
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
                                    <div className="h-12 w-12 rounded-full bg-zinc-800/80 group-hover:bg-zinc-700 flex items-center justify-center transition-colors shadow-lg backdrop-blur-sm">
                                        <ImagePlus className="h-6 w-6 text-zinc-300 group-hover:text-white" />
                                    </div>
                                    <div className="text-center mt-3 drop-shadow-md">
                                        <p className="text-sm font-medium text-white shadow-black">Upload ảnh</p>
                                        <p className="text-[10px] text-zinc-300 mt-1">PNG, JPG tối đa 5MB</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl mt-4">
                                <p className="text-xs text-red-400/80 leading-relaxed italic">
                                    * Lưu ý: Hình ảnh nên có tỉ lệ 1:1 và độ phân giải tối thiểu 500x500px để hiển thị
                                    tốt nhất.
                                </p>
                            </div>
                        </div>

                        {/* Right: Form Fields */}
                        <div className="col-span-2 space-y-5">
                            <Input
                                label="Tên món"
                                placeholder="Nhập tên món ăn hoặc combo..."
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                                className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 rounded-xl transition-colors h-11"
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Số lượng tồn kho"
                                    type="number"
                                    min="0"
                                    required
                                    value={formData.stock_quantity}
                                    onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                                    className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                                />
                                <Select
                                    label="Trạng thái"
                                    value={formData.is_available ? 'Đang bán' : 'Ngừng kinh doanh'}
                                    onChange={(e) => handleInputChange('is_available', e.target.value === 'Đang bán')}
                                    className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                                >
                                    <option value="Đang bán">Đang bán</option>
                                    <option value="Ngừng kinh doanh">Ngừng kinh doanh</option>
                                </Select>
                            </div>

                            <div className="relative">
                                <Input
                                    label="Giá bán"
                                    type="number"
                                    min="0"
                                    required
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    className="bg-zinc-900/50 border-zinc-800 rounded-xl pr-12 h-11"
                                />
                                <span className="absolute right-4 top-[34px] text-sm text-zinc-500 pointer-events-none">
                                    VNĐ
                                </span>
                            </div>

                            <Textarea
                                label="Mô tả"
                                placeholder="Nhập mô tả chi tiết về sản phẩm hoặc thành phần combo..."
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 min-h-[100px] rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border/50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onClose()}
                            disabled={loading}
                            className="rounded-full px-6 bg-transparent hover:bg-white/5 text-gray-400 h-10"
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className="rounded-full px-6 h-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary-hover gap-2 disabled:opacity-50"
                        >
                            <span className="font-semibold text-lg pb-[2px]"></span>
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                    </div>
                </form>
            </Modal>
        );
    }

    // Render View Details Modal
    if (isView) {
        return (
            <Modal
                isOpen={true}
                onClose={onClose}
                className="max-w-4xl p-0 bg-[#161616] border-border/50 overflow-hidden shadow-2xl"
            >
                <div className="flex flex-col md:flex-row h-full">
                    {/* Left Image Area (Large) */}
                    <div className="w-full md:w-[45%] bg-zinc-900 relative">
                        {data?.image ? (
                            <img
                                src={data.image}
                                alt={data.name}
                                className="w-full h-full object-cover min-h-[400px]"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center min-h-[400px]">
                                <Package className="h-16 w-16 text-zinc-700" />
                            </div>
                        )}
                    </div>

                    {/* Right Details Area */}
                    <div className="w-full md:w-[55%] p-8 flex flex-col relative h-[500px]">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {data?.type}
                            </span>
                            <span className="text-xs text-zinc-500">Mã: {data?.id}</span>
                        </div>

                        <h2 className="text-3xl font-bold tracking-tight text-white mb-8">{data?.name}</h2>

                        <div className="flex items-center gap-12 border-b border-border/40 pb-6 mb-6">
                            <div>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">
                                    GIÁ NIÊM YẾT
                                </p>
                                <p className="text-2xl font-bold text-red-500">
                                    {data?.price?.toLocaleString('vi-VN')} VNĐ
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-1">
                                    SỐ LƯỢNG TỒN KHO
                                </p>
                                <div className="flex items-center gap-2">
                                    <p className="text-xl font-bold text-white">{data?.stock}</p>
                                    <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">
                                        Ổn định
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <p className="text-xs text-zinc-400 font-medium mb-3">Mô tả sản phẩm</p>
                            <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800/50">
                                <ul className="text-sm text-zinc-300 space-y-2">
                                    {data?.description?.split('\n').map((line, i) => (
                                        <li key={i} className="flex items-start">
                                            {line.startsWith('- ') ? (
                                                <>
                                                    <span className="text-red-500 mr-2 opacity-80 mt-1">•</span>
                                                    <span className="leading-relaxed opacity-90">{line.substring(2)}</span>
                                                </>
                                            ) : (
                                                <span className="leading-relaxed opacity-90">{line}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Action Bar inside View Modal */}
                        <div className="pt-6 mt-4 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-500 uppercase font-medium">
                                    Trạng thái kinh doanh
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-sm font-medium text-emerald-500">{data?.status}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="secondary"
                                    className="rounded-full px-5 bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700/50 gap-2 h-10 shadow-sm"
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Chỉnh sửa
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={onClose}
                                    className="rounded-full px-6 shadow-lg shadow-red-500/20 hover:shadow-red-500/40 h-10 gap-2"
                                >
                                    Đóng chi tiết
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        );
    }

    return null;
};

export default FoodModals;
