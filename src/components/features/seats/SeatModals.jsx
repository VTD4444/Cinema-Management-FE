import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select } from '../../ui';
import { createSeat, updateSeat, deleteSeat } from '../../../api/seatApi';
import { handleApiError } from '../../../utils/errorHandling';

const TYPE_OPTIONS = [
  { value: 'standard', label: 'Thường' },
  { value: 'vip', label: 'VIP' },
  { value: 'couple', label: 'Sweetbox' },
];

const SeatModals = ({ state, onClose, onSuccess, roomId, rooms = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    room_id: '',
    row_label: '',
    number: '',
    type: 'standard',
  });

  const isDelete = state.type === 'delete';
  const isAddOrEdit = state.type === 'add' || state.type === 'edit';
  const data = state.data;

  useEffect(() => {
    if (state.type === 'edit' && data) {
      setFormData({
        room_id: String(data.room_id ?? ''),
        row_label: data.row_label ?? '',
        number: data.number != null ? String(data.number) : '',
        type: data.type ?? 'standard',
      });
    } else if (state.type === 'add') {
      setFormData({
        room_id: roomId ? String(roomId) : '',
        row_label: '',
        number: '',
        type: 'standard',
      });
    }
    setError('');
  }, [state.type, state.data, roomId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload =
      state.type === 'add'
        ? {
            room_id: parseInt(formData.room_id, 10),
            row_label: formData.row_label.trim().toUpperCase().slice(0, 5),
            number: parseInt(formData.number, 10) || 0,
            type: formData.type,
          }
        : {
            row_label: formData.row_label.trim().toUpperCase().slice(0, 5),
            number: parseInt(formData.number, 10) || 0,
            type: formData.type,
          };
    const request = state.type === 'add' ? createSeat(payload) : updateSeat(data.id, payload);
    request
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Có lỗi xảy ra');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể lưu ghế.')))
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    setError('');
    setLoading(true);
    deleteSeat(data.id)
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Không thể xóa.');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể xóa ghế.')))
      .finally(() => setLoading(false));
  };

  if (!state.type) return null;

  if (isDelete) {
    return (
      <Modal isOpen title="Xác nhận xóa" onClose={onClose} className="max-w-md bg-[#161616] border-border/50">
        <div className="space-y-6">
          <p className="text-sm text-zinc-400">Bạn có chắc chắn muốn xóa ghế này?</p>
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
        title={state.type === 'add' ? 'Thêm ghế mới' : 'Chỉnh sửa ghế'}
        className="max-w-md bg-[#161616] border-border/50"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          {state.type === 'add' && rooms.length > 0 && (
            <Select
              label="Phòng chiếu"
              value={formData.room_id}
              onChange={(e) => setFormData((p) => ({ ...p, room_id: e.target.value }))}
              className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
              required
            >
              <option value="">Chọn phòng</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          )}
          <Input
            label="Dãy (A-Z)"
            placeholder="VD: A"
            value={formData.row_label}
            onChange={(e) => { setFormData((p) => ({ ...p, row_label: e.target.value.toUpperCase().slice(0, 5) })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11 uppercase"
            maxLength={5}
            required
          />
          <Input
            label="Thứ tự (số ghế trong dãy)"
            type="number"
            min="1"
            placeholder="VD: 1"
            value={formData.number}
            onChange={(e) => { setFormData((p) => ({ ...p, number: e.target.value })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
            required
          />
          <Select
            label="Loại ghế"
            value={formData.type}
            onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
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

export default SeatModals;
