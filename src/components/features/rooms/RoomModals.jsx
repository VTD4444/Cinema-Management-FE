import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select } from '../../ui';
import { createRoom, updateRoom, deleteRoom } from '../../../api/roomApi';
import { handleApiError } from '../../../utils/errorHandling';

const ROOM_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'gold_class', label: 'Gold Class' },
  { value: 'couple', label: 'Couple' },
];

const FORMATS = [
  { value: 'imax', label: 'IMAX' },
  { value: '2d', label: '2D' },
  { value: '3d', label: '3D' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'pending', label: 'Chờ duyệt' },
];

const RoomModals = ({ state, onClose, onSuccess, cinemaId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    room_type: 'standard',
    seat_count: '',
    format: '2d',
    status: 'active',
  });

  const isDelete = state.type === 'delete';
  const isAddOrEdit = state.type === 'add' || state.type === 'edit';
  const data = state.data;

  useEffect(() => {
    if (state.type === 'edit' && data) {
      setFormData({
        name: data.name ?? '',
        room_type: data.room_type ?? 'standard',
        seat_count: data.seat_count != null ? String(data.seat_count) : '',
        format: data.format ?? '2d',
        status: data.status ?? 'active',
      });
    } else if (state.type === 'add') {
      setFormData({
        name: '',
        room_type: 'standard',
        seat_count: '',
        format: '2d',
        status: 'active',
      });
    }
    setError('');
  }, [state.type, state.data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      name: formData.name.trim(),
      room_type: formData.room_type,
      seat_count: formData.seat_count ? parseInt(formData.seat_count, 10) : 0,
      format: formData.format,
      status: formData.status,
      ...(state.type === 'add' && cinemaId && { cinema_id: cinemaId }),
    };
    const request = state.type === 'add' ? createRoom(payload) : updateRoom(data.id, payload);
    request
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Có lỗi xảy ra');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể lưu phòng chiếu.')))
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    setError('');
    setLoading(true);
    deleteRoom(data.id)
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Không thể xóa.');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể xóa phòng.')))
      .finally(() => setLoading(false));
  };

  if (!state.type) return null;

  if (isDelete) {
    return (
      <Modal isOpen title="Xác nhận xóa" onClose={onClose} className="max-w-md bg-[#161616] border-border/50">
        <div className="space-y-6">
          <p className="text-sm text-zinc-400">Bạn có chắc chắn muốn xóa &quot;{data?.name}&quot;?</p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1 rounded-full" disabled={loading}>Hủy</Button>
            <Button variant="danger" className="flex-1 rounded-full" onClick={handleDelete} disabled={loading} isLoading={loading}>Xác nhận xóa</Button>
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
        title={state.type === 'add' ? 'Thêm phòng chiếu' : 'Chỉnh sửa phòng chiếu'}
        className="max-w-md bg-[#161616] border-border/50"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <Input
            label="Tên phòng"
            placeholder="VD: Phòng 01"
            value={formData.name}
            onChange={(e) => { setFormData((p) => ({ ...p, name: e.target.value })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
            required
          />
          <Select
            label="Loại phòng"
            value={formData.room_type}
            onChange={(e) => setFormData((p) => ({ ...p, room_type: e.target.value }))}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
          >
            {ROOM_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
          <Input
            label="Số ghế"
            type="number"
            min="1"
            placeholder="VD: 80"
            value={formData.seat_count}
            onChange={(e) => { setFormData((p) => ({ ...p, seat_count: e.target.value })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
            required
          />
          <Select
            label="Định dạng"
            value={formData.format}
            onChange={(e) => setFormData((p) => ({ ...p, format: e.target.value }))}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </Select>
          <Select
            label="Trạng thái"
            value={formData.status}
            onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
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

export default RoomModals;
