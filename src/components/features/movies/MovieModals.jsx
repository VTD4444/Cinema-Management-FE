import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button, Select, Textarea } from '../../ui';
import { ChevronDown, ImagePlus, X, Film } from 'lucide-react';
import { getGenres, createMovie, updateMovie, deleteMovie } from '../../../api/movieApi';
import { withoutSoftDeleted } from '../../../utils/withoutSoftDeleted';
import { handleApiError } from '../../../utils/errorHandling';

const STATUS_OPTIONS = [
  { value: 'SHOWING', label: 'Đang chiếu' },
  { value: 'COMING_SOON', label: 'Sắp chiếu' },
  { value: 'PASSED', label: 'Đã dừng' },
];

const GenreMultiSelect = ({ genres, value = [], onChange, className = '' }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selectedNames = genres
    .filter((g) => value.includes(Number(g.id)))
    .map((g) => g.name);

  const toggleGenre = (id) => {
    const numId = Number(id);
    if (value.includes(numId)) {
      onChange(value.filter((x) => x !== numId));
    } else {
      onChange([...value, numId]);
    }
  };

  return (
    <div ref={rootRef} className={`relative w-full flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-gray-300">Thể loại</label>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 text-left text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <span className={selectedNames.length ? 'text-white' : 'text-zinc-500'}>
          {selectedNames.length ? selectedNames.join(', ') : 'Chọn thể loại'}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 shadow-xl">
          {genres.length === 0 ? (
            <p className="px-3 py-2 text-sm text-zinc-500">Chưa có thể loại</p>
          ) : (
            genres.map((g) => {
              const checked = value.includes(Number(g.id));
              return (
                <label
                  key={g.id}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-900"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleGenre(g.id)}
                    className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-primary focus:ring-primary"
                  />
                  {g.name}
                </label>
              );
            })
          )}
        </div>
      )}
      {selectedNames.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {genres
            .filter((g) => value.includes(Number(g.id)))
            .map((g) => (
              <span
                key={g.id}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-xs text-zinc-300"
              >
                {g.name}
                <button
                  type="button"
                  onClick={() => toggleGenre(g.id)}
                  className="text-zinc-500 hover:text-white"
                  aria-label={`Bỏ ${g.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

const MovieModals = ({ state, onClose, onSuccess }) => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    directors_name: '',
    release_date: '',
    description: '',
    poster_url: '',
    trailer_url: '',
    status: 'SHOWING',
    genre_ids: [],
  });

  const isDelete = state.type === 'delete';
  const isAddOrEdit = state.type === 'add' || state.type === 'edit';
  const data = state.data;

  useEffect(() => {
    if (isAddOrEdit) {
      getGenres()
        .then((res) => {
          const d = res?.data;
          const list = Array.isArray(d?.items) ? d.items : Array.isArray(d) ? d : [];
          setGenres(withoutSoftDeleted(list));
        })
        .catch(() => setGenres([]));
    }
  }, [isAddOrEdit]);

  useEffect(() => {
    if (state.type === 'edit' && data) {
      const releaseDate = data.release_date
        ? new Date(data.release_date).toISOString().slice(0, 10)
        : '';
      const posterUrl = (Array.isArray(data.poster_urls) && data.poster_urls[0])
        ? data.poster_urls[0]
        : typeof data.poster_urls === 'string'
          ? data.poster_urls
          : '';
      setFormData({
        title: data.title ?? '',
        duration: data.duration ?? '',
        directors_name: data.directors_name ?? '',
        release_date: releaseDate,
        description: data.description ?? '',
        poster_url: posterUrl,
        trailer_url: data.trailer_url ?? '',
        status: data.status ?? 'SHOWING',
        genre_ids: (data.genres || []).map((g) => (typeof g === 'object' && g != null && 'id' in g) ? g.id : g).filter(Boolean),
      });
    } else if (state.type === 'add') {
      setFormData({
        title: '',
        duration: '',
        directors_name: '',
        release_date: '',
        description: '',
        poster_url: '',
        trailer_url: '',
        status: 'SHOWING',
        genre_ids: [],
      });
    }
    setError('');
  }, [state.type, data]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      title: formData.title.trim(),
      duration: Number(formData.duration) || 0,
      directors_name: formData.directors_name.trim() || null,
      release_date: formData.release_date || null,
      description: formData.description.trim() || null,
      poster_urls: formData.poster_url ? [formData.poster_url.trim()] : [],
      trailer_url: formData.trailer_url.trim() || null,
      status: formData.status,
      genre_ids: formData.genre_ids,
    };

    const request = state.type === 'add'
      ? createMovie(payload)
      : updateMovie(data.id, payload);

    request
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Có lỗi xảy ra');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể lưu phim.')))
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    setError('');
    setLoading(true);
    deleteMovie(data.id)
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Không thể xóa phim.');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể xóa phim.')))
      .finally(() => setLoading(false));
  };

  if (!state.type) return null;

  if (isDelete) {
    return (
      <Modal isOpen title="Xác nhận xóa phim" onClose={onClose} className="max-w-md bg-[#161616] border-border/50 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
        <div className="p-2 space-y-6 flex flex-col items-center justify-center text-center mt-2">
          <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
            <span className="text-red-500 font-semibold text-sm tracking-widest lowercase">warning</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Xác nhận xóa phim?</h2>
            <p className="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa &quot;{data?.title}&quot; khỏi hệ thống?
            </p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex w-full gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1 rounded-full bg-zinc-800/80 border-zinc-700/50" disabled={loading}>
              Hủy
            </Button>
            <Button variant="danger" className="flex-1 rounded-full" onClick={handleDelete} disabled={loading} isLoading={loading}>
              Xác nhận xóa
            </Button>
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
        title={state.type === 'add' ? 'Thêm phim mới' : 'Chỉnh sửa phim'}
        className="max-w-3xl bg-[#161616] border-border/50"
        footerClassName="flex justify-end gap-3 bg-[#161616]"
        footer={(
          <>
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full px-6 h-10" disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" form="movie-form" className="rounded-full px-6 h-10 gap-2" isLoading={loading} disabled={loading}>
              {state.type === 'add' ? 'Thêm phim' : 'Lưu thay đổi'}
            </Button>
          </>
        )}
      >
        <form id="movie-form" onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 space-y-3">
              <label className="text-sm font-medium text-gray-300">Poster (URL)</label>
              <div className="aspect-[2/3] w-full rounded-2xl border-2 border-dashed border-zinc-700/60 bg-zinc-900/50 flex flex-col items-center justify-center gap-3 overflow-hidden">
                {formData.poster_url ? (
                  <img src={formData.poster_url} alt="Poster" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <>
                    <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center">
                      <ImagePlus className="h-6 w-6 text-zinc-400" />
                    </div>
                    <p className="text-sm text-zinc-400">Nhập URL bên cạnh</p>
                  </>
                )}
              </div>
            </div>

            <div className="col-span-2 space-y-5">
              <Input
                label="Tên phim"
                placeholder="Nhập tên phim"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Thời lượng (phút)"
                  type="number"
                  min="1"
                  placeholder="VD: 120"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                  required
                />
                <Input
                  label="Ngày phát hành"
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => handleChange('release_date', e.target.value)}
                  className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                />
              </div>
              <Input
                label="Đạo diễn"
                placeholder="Tên đạo diễn"
                value={formData.directors_name}
                onChange={(e) => handleChange('directors_name', e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
              />
              <Select
                label="Trạng thái"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
              <Input
                label="URL Poster"
                placeholder="https://..."
                value={formData.poster_url}
                onChange={(e) => handleChange('poster_url', e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
              />
              <Input
                label="URL Trailer"
                placeholder="https://..."
                value={formData.trailer_url}
                onChange={(e) => handleChange('trailer_url', e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
              />
              {genres.length > 0 && (
                <GenreMultiSelect
                  genres={genres}
                  value={formData.genre_ids}
                  onChange={(ids) => handleChange('genre_ids', ids)}
                />
              )}
              <Textarea
                label="Mô tả"
                placeholder="Mô tả phim..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="bg-zinc-900/50 border-zinc-800 min-h-[80px] rounded-xl"
              />
            </div>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default MovieModals;
