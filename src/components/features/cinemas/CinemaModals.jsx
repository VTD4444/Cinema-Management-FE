import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select } from '../../ui';
import { createCinema, updateCinema, deleteCinema } from '../../../api/cinemaApi';
import { handleApiError } from '../../../utils/errorHandling';
import { getCities } from '../../../api/cityApi';
import { withoutSoftDeleted } from '../../../utils/withoutSoftDeleted';

const CinemaModals = ({ state, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    province_id: '',
    room_count: '',
  });
  const [provinces, setProvinces] = useState([]);

  const isDelete = state.type === 'delete';
  const isAddOrEdit = state.type === 'add' || state.type === 'edit';
  const data = state.data;

  useEffect(() => {
    // Load danh sách tỉnh/thành phố cho select
    getCities({ pageNo: 1, pageSize: 500 })
      .then((res) => {
        const raw = res?.data ?? res;
        const list = Array.isArray(raw?.items) ? raw.items : Array.isArray(raw) ? raw : [];
        setProvinces(withoutSoftDeleted(list));
      })
      .catch(() => setProvinces([]));

    if (state.type === 'edit' && data) {
      setFormData({
        name: data.name ?? '',
        address: data.address ?? '',
        province_id: data.province_id != null ? String(data.province_id) : '',
        room_count: data.room_count != null ? String(data.room_count) : '',
      });
    } else if (state.type === 'add') {
      setFormData({ name: '', address: '', province_id: '', room_count: '' });
    }
    setError('');
  }, [state.type, data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      province_id: formData.province_id ? Number(formData.province_id) : undefined,
      room_count: formData.room_count ? parseInt(formData.room_count, 10) : undefined,
    };
    const request = state.type === 'add' ? createCinema(payload) : updateCinema(data.id, payload);
    request
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Có lỗi xảy ra');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể lưu rạp.')))
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    setError('');
    setLoading(true);
    deleteCinema(data.id)
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Không thể xóa.');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể xóa rạp.')))
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
        title={state.type === 'add' ? 'Thêm Rạp' : 'Chỉnh sửa Rạp'}
        className="max-w-md bg-[#161616] border-border/50"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <Input
            label="Tên rạp"
            placeholder="VD: CineGo Aeon Hà Đông"
            value={formData.name}
            onChange={(e) => { setFormData((p) => ({ ...p, name: e.target.value })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
            required
          />
          <Input
            label="Địa chỉ"
            placeholder="Địa chỉ đầy đủ"
            value={formData.address}
            onChange={(e) => { setFormData((p) => ({ ...p, address: e.target.value })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
            required
          />
          <Select
            label="Tỉnh/Thành phố"
            value={formData.province_id}
            onChange={(e) => { setFormData((p) => ({ ...p, province_id: e.target.value })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
            required
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Input
            label="Số phòng chiếu"
            type="number"
            min="1"
            placeholder="VD: 9"
            value={formData.room_count}
            onChange={(e) => { setFormData((p) => ({ ...p, room_count: e.target.value })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
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

export default CinemaModals;
