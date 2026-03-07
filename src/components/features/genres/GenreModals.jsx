import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../ui';
import { X } from 'lucide-react';
import { createGenre, updateGenre, deleteGenre } from '../../../api/genreApi';
import { handleApiError } from '../../../utils/errorHandling';

const GenreModals = ({ state, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');

  const isDelete = state.type === 'delete';
  const isView = state.type === 'view';
  const isAddOrEdit = state.type === 'add' || state.type === 'edit';
  const data = state.data;

  useEffect(() => {
    if (state.type === 'edit' && data) {
      setName(data.name ?? '');
    } else if (state.type === 'add') {
      setName('');
    }
    setError('');
  }, [state.type, state.data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = { name: name.trim() };
    const request = state.type === 'add' ? createGenre(payload) : updateGenre(data.id, payload);
    request
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Có lỗi xảy ra');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể lưu thể loại.')))
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    setError('');
    setLoading(true);
    deleteGenre(data.id)
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Không thể xóa thể loại.');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể xóa thể loại.')))
      .finally(() => setLoading(false));
  };

  if (!state.type) return null;

  if (isDelete) {
    return (
      <Modal isOpen title="Xác nhận xóa thể loại" onClose={onClose} className="max-w-md bg-[#161616] border-border/50 relative">
        <div className="p-2 space-y-6 flex flex-col items-center text-center mt-2">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <span className="text-red-500 font-semibold text-sm tracking-widest lowercase">warning</span>
          </div>
          <p className="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
            Bạn có chắc chắn muốn xóa &quot;{data?.name}&quot;?
          </p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex w-full gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1 rounded-full" disabled={loading}>Hủy</Button>
            <Button variant="danger" className="flex-1 rounded-full" onClick={handleDelete} disabled={loading} isLoading={loading}>Xác nhận xóa</Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (isView) {
    return (
      <Modal isOpen title="Chi tiết thể loại" onClose={onClose} className="max-w-md bg-[#161616] border-border/50">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Mã</p>
          <p className="font-mono text-zinc-200">G-{String(data?.id ?? '').padStart(3, '0')}</p>
          <p className="text-sm text-zinc-400">Tên thể loại</p>
          <p className="text-white font-medium">{data?.name}</p>
          <div className="pt-4">
            <Button variant="secondary" onClick={onClose} className="rounded-full">Đóng</Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (isAddOrEdit) {
    return (
      <Modal
        isOpen
        onClose={onClose}
        title={state.type === 'add' ? 'Thêm thể loại mới' : 'Chỉnh sửa thể loại'}
        className="max-w-md bg-[#161616] border-border/50"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <Input
            label="Tên thể loại"
            placeholder="Nhập tên thể loại"
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full px-6 h-10">Hủy</Button>
            <Button type="submit" className="rounded-full px-6 h-10" isLoading={loading}>Lưu</Button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default GenreModals;
