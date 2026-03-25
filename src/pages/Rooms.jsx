import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, BookOpen, AlertCircle } from 'lucide-react';
import { Button, Badge } from '../components/ui';
import RoomModals from '../components/features/rooms/RoomModals';
import { getCities } from '../api/cityApi';
import { getCinemas } from '../api/cinemaApi';
import { getRooms } from '../api/roomApi';

const ROOM_TYPE_LABELS = { standard: 'Standard', gold_class: 'Gold Class', couple: 'Couple' };
const FORMAT_LABELS = { imax: 'IMAX', '2d': '2D', '3d': '3D' };
const STATUS_LABELS = {
  active: { text: 'ĐANG HOẠT ĐỘNG', variant: 'danger' },
  maintenance: { text: 'BẢO TRÌ', variant: 'warning' },
  pending: { text: 'CHỜ DUYỆT', variant: 'warning' },
};

const Rooms = () => {
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [cityId, setCityId] = useState('');
  const [cinemaId, setCinemaId] = useState('');
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [modalState, setModalState] = useState({ type: null, data: null });

  const loadCities = useCallback(() => {
    getCities()
      .then((res) => {
        const raw = res?.data ?? res;
        setCities(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setCities([]));
  }, []);

  const loadCinemas = useCallback(() => {
    getCinemas()
      .then((res) => {
        const raw = res?.data ?? res;
        setCinemas(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setCinemas([]));
  }, []);

  useEffect(() => {
    loadCities();
    loadCinemas();
  }, [loadCities, loadCinemas]);

  const filteredCinemas = cinemaId
    ? cinemas.filter((c) => String(c.id) === String(cinemaId))
    : cityId
      ? cinemas.filter((c) => String(c.province_id || c.city_id) === String(cityId))
      : cinemas;

  useEffect(() => {
    if (!cityId) {
      setCinemaId('');
      setSelectedCinema(null);
      setRooms([]);
      return;
    }
    const byCity = cinemas.filter((c) => String(c.province_id || c.city_id) === String(cityId));
    if (byCity.length > 0) {
      setCinemaId((prev) => {
        const stillInCity = byCity.some((c) => String(c.id) === String(prev));
        return stillInCity ? prev : String(byCity[0].id);
      });
    } else {
      setCinemaId('');
    }
  }, [cityId, cinemas]);

  useEffect(() => {
    if (cinemaId && cinemas.length) {
      const cinema = cinemas.find((c) => String(c.id) === String(cinemaId));
      setSelectedCinema(cinema || null);
    } else {
      setSelectedCinema(null);
    }
  }, [cinemaId, cinemas]);

  const fetchRooms = useCallback(() => {
    if (!cinemaId) {
      setRooms([]);
      return;
    }
    setLoadingRooms(true);
    getRooms({ cinema_id: cinemaId })
      .then((res) => {
        const raw = res?.data ?? res;
        if (Array.isArray(raw)) {
          const byCinema = raw.filter((r) => String(r.cinema_id) === String(cinemaId));
          setRooms(byCinema);
        } else {
          setRooms([]);
        }
      })
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
  }, [cinemaId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const closeModal = () => setModalState({ type: null, data: null });
  const onModalSuccess = () => fetchRooms();

  const cinemaOptions = cityId
    ? cinemas.filter((c) => String(c.province_id || c.city_id) === String(cityId))
    : cinemas;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold tracking-tight text-white">Phòng chiếu & Ghế</h2>

      <div className="rounded-xl border border-border bg-surface/30 p-4 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Tỉnh / Thành phố</label>
            <select
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                setCinemaId('');
              }}
              className="flex h-10 w-full rounded-lg border border-border bg-zinc-900/80 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Chọn tỉnh/thành phố</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Rạp chiếu phim *</label>
            <select
              value={cinemaId}
              onChange={(e) => setCinemaId(e.target.value)}
              disabled={!cityId}
              className="flex h-10 w-full rounded-lg border border-border bg-zinc-900/80 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="">Chọn rạp</option>
              {cinemaOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedCinema && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-primary/5 px-4 py-3 text-sm text-primary">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Đang hiển thị dữ liệu của {selectedCinema.name}</span>
          </div>
        )}

        <div className="border-t border-border/50 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <BookOpen className="h-5 w-5 text-zinc-400" />
              Danh sách Phòng
            </h3>
            <Button
              onClick={() => setModalState({ type: 'add', data: null })}
              disabled={!cinemaId}
              className="gap-2 rounded-full px-4 h-9 text-sm"
            >
              <Plus className="h-4 w-4" />
              Thêm phòng
            </Button>
          </div>

          {!cinemaId ? (
            <p className="py-8 text-center text-zinc-500 text-sm">Chọn tỉnh/thành phố và rạp để xem danh sách phòng.</p>
          ) : loadingRooms ? (
            <p className="py-8 text-center text-zinc-500">Đang tải...</p>
          ) : rooms.length === 0 ? (
            <p className="py-8 text-center text-zinc-500 text-sm">Chưa có phòng nào. Nhấn &quot;Thêm phòng&quot; để thêm.</p>
          ) : (
            <ul className="space-y-3">
              {rooms.map((room) => {
                const statusConf = STATUS_LABELS[room.status] || { text: room.status, variant: 'default' };
                const typeLabel = ROOM_TYPE_LABELS[room.room_type] || room.room_type;
                const formatLabel = FORMAT_LABELS[room.format] || room.format;
                return (
                  <li
                    key={room.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-zinc-900/30 px-4 py-3 hover:bg-zinc-900/50 transition-colors group"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-white">{room.name}</span>
                      <Badge variant={statusConf.variant} className="text-[10px] uppercase font-bold">
                        {statusConf.text}
                      </Badge>
                      <span className="text-sm text-zinc-400">
                        {typeLabel} - {room.seat_count ?? 0} ghế
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">
                        {formatLabel}
                      </Badge>
                      <button
                        onClick={() => setModalState({ type: 'edit', data: room })}
                        className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Sửa"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setModalState({ type: 'delete', data: room })}
                        className="p-2 rounded-full text-zinc-400 hover:text-red-500 hover:bg-zinc-800 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <RoomModals
        state={modalState}
        onClose={closeModal}
        onSuccess={onModalSuccess}
        cinemaId={cinemaId ? parseInt(cinemaId, 10) : null}
      />
    </div>
  );
};

export default Rooms;
