import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, Select } from '../../ui';
import { Plus, X, Clock } from 'lucide-react';
import { getMoviesPublic } from '../../../api/movieApi';
import { getCities } from '../../../api/cityApi';
import { getCinemas } from '../../../api/cinemaApi';
import { getRooms } from '../../../api/roomApi';
import { createShowtime, updateShowtime, deleteShowtime } from '../../../api/showtimeApi';

const ShowtimeModal = ({ state, onClose, onSuccess }) => {
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState('');

  const [formData, setFormData] = useState({
    movie_id: '',
    room_id: '',
    base_price: '',
    start_times: [''],
  });

  const isDelete = state?.type === 'delete';
  const isAddOrEdit = state?.type === 'add' || state?.type === 'edit';
  const data = state?.data;

  // Load cities, cinemas, movies when modal opens
  useEffect(() => {
    if (isAddOrEdit) {
      getCities()
        .then((res) => {
          const items = res?.data?.items || res?.data || [];
          setCities(Array.isArray(items) ? items : []);
        })
        .catch(() => setCities([]));

      getCinemas()
        .then((res) => {
          const items = res?.data?.items || res?.data || [];
          setCinemas(Array.isArray(items) ? items : []);
        })
        .catch(() => setCinemas([]));

      getMoviesPublic({ pageSize: 100 })
        .then((res) => {
          const items = res?.data?.items || res?.data || [];
          setMovies(Array.isArray(items) ? items : []);
        })
        .catch(() => setMovies([]));
    }
  }, [isAddOrEdit]);

  // Filter cinemas by selected city
  const cinemaOptions = selectedCityId
    ? cinemas.filter((c) => String(c.province_id || c.city_id) === String(selectedCityId))
    : [];

  // Load rooms when cinema changes
  useEffect(() => {
    if (selectedCinemaId) {
      getRooms({ cinema_id: selectedCinemaId })
        .then((res) => {
          const items = res?.data?.items || res?.data || [];
          setRooms(Array.isArray(items) ? items : []);
        })
        .catch(() => setRooms([]));
    } else {
      setRooms([]);
    }
  }, [selectedCinemaId]);

  // Reset cinema when city changes
  useEffect(() => {
    setSelectedCinemaId('');
    setRooms([]);
    setFormData(prev => ({ ...prev, room_id: '' }));
  }, [selectedCityId]);

  // Reset room when cinema changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, room_id: '' }));
  }, [selectedCinemaId]);

  // Populate form on edit
  useEffect(() => {
    if (state?.type === 'edit' && data) {
      setFormData({
        movie_id: data.movie_id || data.movie?.id || '',
        room_id: data.room_id || data.room?.id || '',
        base_price: data.base_price ?? '',
        start_times: [data.start_time ? data.start_time.slice(0, 16) : ''],
      });
      // Try to pre-select city and cinema from room data
      if (data.room?.cinema_id || state?.cinemaId) {
        const cId = data.room?.cinema_id || state?.cinemaId;
        setSelectedCinemaId(String(cId));
        // Find the cinema to get its province_id
        getCinemas().then((res) => {
          const items = res?.data?.items || res?.data || [];
          const cinema = (Array.isArray(items) ? items : []).find(c => String(c.id) === String(cId));
          if (cinema) {
            setSelectedCityId(String(cinema.province_id || cinema.city_id || ''));
          }
        }).catch(() => { });
      }
    } else if (state?.type === 'add') {
      setFormData({
        movie_id: '',
        room_id: '',
        base_price: '',
        start_times: [state?.defaultDate ? `${state.defaultDate}T08:00` : ''],
      });
      // Pre-select from parent page state
      if (state?.cityId) setSelectedCityId(String(state.cityId));
      if (state?.cinemaId) setSelectedCinemaId(String(state.cinemaId));
    }
    setError('');
  }, [state?.type, data]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleStartTimeChange = (index, value) => {
    setFormData(prev => {
      const newTimes = [...prev.start_times];
      newTimes[index] = value;
      return { ...prev, start_times: newTimes };
    });
    setError('');
  };

  const addStartTime = () => {
    setFormData(prev => ({
      ...prev,
      start_times: [...prev.start_times, ''],
    }));
  };

  const removeStartTime = (index) => {
    if (formData.start_times.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      start_times: prev.start_times.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validTimes = formData.start_times.filter(t => t.trim() !== '');
    if (validTimes.length === 0) {
      setError('Vui lòng nhập ít nhất 1 giờ chiếu.');
      setLoading(false);
      return;
    }

    try {
      if (state.type === 'add') {
        const payload = {
          movie_id: Number(formData.movie_id),
          room_id: Number(formData.room_id),
          base_price: Number(formData.base_price),
          start_times: validTimes.map(t => t.includes('T') ? t + ':00' : t),
        };
        const res = await createShowtime(payload);
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Có lỗi xảy ra');
        }
      } else if (state.type === 'edit') {
        const payload = {
          movie_id: Number(formData.movie_id),
          room_id: Number(formData.room_id),
          base_price: Number(formData.base_price),
          start_time: validTimes[0].includes('T') ? validTimes[0] + ':00' : validTimes[0],
        };
        const res = await updateShowtime(data.id, payload);
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Có lỗi xảy ra');
        }
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await deleteShowtime(data.id);
      if (res?.success !== false) {
        onSuccess?.();
        onClose();
      } else {
        setError(res?.message || 'Không thể xóa suất chiếu.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Lỗi khi xóa');
    } finally {
      setLoading(false);
    }
  };

  if (!state?.type) return null;

  // Delete confirmation modal
  if (isDelete) {
    return (
      <Modal isOpen onClose={onClose} className="max-w-md bg-[#161616] border-border/50 relative">
        <div className="p-2 space-y-6 flex flex-col items-center justify-center text-center mt-2">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <span className="text-red-500 font-semibold text-sm tracking-widest lowercase">warning</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Xác nhận xóa suất chiếu?</h2>
            <p className="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa suất chiếu này?
            </p>
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          </div>
          <div className="flex w-full gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1 rounded-full bg-zinc-800/80 border-zinc-700/50 hover:bg-zinc-700 text-gray-300">
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={loading} className="flex-1 rounded-full shadow-lg shadow-red-500/20 hover:shadow-red-500/40 transition-shadow disabled:opacity-50">
              {loading ? 'Đang xóa...' : 'Xác nhận xóa'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Add/Edit modal
  if (isAddOrEdit) {
    const isEdit = state.type === 'edit';
    return (
      <Modal
        isOpen
        onClose={onClose}
        title={isEdit ? 'Chỉnh sửa suất chiếu' : 'Thêm suất chiếu mới'}
        className="max-w-2xl bg-[#161616] border-border/50"
      >
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <p className="text-sm text-zinc-500 -mt-2 mb-4">
            Vui lòng điền thông tin suất chiếu
          </p>
          {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          {/* Movie select */}
          <Select
            label="Chọn phim"
            value={formData.movie_id}
            onChange={(e) => handleChange('movie_id', e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
            required
          >
            <option value="">-- Chọn phim --</option>
            {movies.map((m) => (
              <option key={m.id} value={m.id}>{m.title}</option>
            ))}
          </Select>

          {/* City → Cinema → Room cascade */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* City select */}
            <Select
              label="Tỉnh / Thành phố"
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
              required
            >
              <option value="">-- Chọn tỉnh/TP --</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>

            {/* Cinema select */}
            <Select
              label="Rạp chiếu"
              value={selectedCinemaId}
              onChange={(e) => setSelectedCinemaId(e.target.value)}
              disabled={!selectedCityId}
              className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11 disabled:opacity-50"
              required
            >
              <option value="">-- Chọn rạp --</option>
              {cinemaOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>

            {/* Room select */}
            <Select
              label="Phòng chiếu"
              value={formData.room_id}
              onChange={(e) => handleChange('room_id', e.target.value)}
              disabled={!selectedCinemaId}
              className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11 disabled:opacity-50"
              required
            >
              <option value="">-- Chọn phòng --</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          </div>

          {/* Base price */}
          <Input
            label="Giá vé cơ bản (VND)"
            type="number"
            min="0"
            placeholder="VD: 90000"
            value={formData.base_price}
            onChange={(e) => handleChange('base_price', e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
            required
          />

          {/* Start times */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-500" />
              {isEdit ? 'Giờ chiếu' : 'Danh sách giờ chiếu'}
            </label>
            {formData.start_times.map((time, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="datetime-local"
                  value={time}
                  onChange={(e) => handleStartTimeChange(index, e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  required
                />
                {!isEdit && formData.start_times.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStartTime(index)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {!isEdit && (
              <button
                type="button"
                onClick={addStartTime}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover transition-colors mt-1"
              >
                <Plus className="h-4 w-4" />
                Thêm giờ chiếu
              </button>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="rounded-full px-6 h-10 bg-transparent hover:bg-white/5 text-gray-400">
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="rounded-full px-6 h-10 gap-2 shadow-lg shadow-primary/20 disabled:opacity-50">
              {loading ? 'Đang lưu...' : 'Lưu suất chiếu'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default ShowtimeModal;
