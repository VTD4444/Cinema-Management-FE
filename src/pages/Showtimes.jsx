import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar, Search } from 'lucide-react';
import { Button, Select } from '../components/ui';
import ShowtimeModal from '../components/features/showtime/ShowtimeModal';
import { getShowtimesByFilter } from '../api/showtimeApi';
import { getMoviesPublic } from '../api/movieApi';
import { getCinemas } from '../api/cinemaApi';
import { getCities } from '../api/cityApi';
import { getRooms } from '../api/roomApi';

// Timeline constants
const HOUR_START = 0;   // 0:00
const HOUR_END = 24;    // 24:00
const TOTAL_HOURS = HOUR_END - HOUR_START;
const HOUR_WIDTH = 140; // px per hour
const TIMELINE_WIDTH = TOTAL_HOURS * HOUR_WIDTH;
const ROOM_LABEL_WIDTH = 180;

// Color palette for showtimes by movie
const SHOWTIME_COLORS = [
  { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.5)', text: '#fca5a5', timeBg: 'rgba(239, 68, 68, 0.6)' },
  { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.5)', text: '#86efac', timeBg: 'rgba(34, 197, 94, 0.6)' },
  { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.5)', text: '#93c5fd', timeBg: 'rgba(59, 130, 246, 0.6)' },
  { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.5)', text: '#fde047', timeBg: 'rgba(234, 179, 8, 0.6)' },
  { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.5)', text: '#c4b5fd', timeBg: 'rgba(168, 85, 247, 0.6)' },
  { bg: 'rgba(236, 72, 153, 0.15)', border: 'rgba(236, 72, 153, 0.5)', text: '#f9a8d4', timeBg: 'rgba(236, 72, 153, 0.6)' },
  { bg: 'rgba(20, 184, 166, 0.15)', border: 'rgba(20, 184, 166, 0.5)', text: '#5eead4', timeBg: 'rgba(20, 184, 166, 0.6)' },
  { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.5)', text: '#fdba74', timeBg: 'rgba(249, 115, 22, 0.6)' },
];

// Strip trailing 'Z' so JS treats the datetime as local, not UTC
const parseLocalTime = (dateStr) => new Date(String(dateStr).replace('Z', '').replace('.000', ''));

const formatTime = (dateStr) => {
  const d = parseLocalTime(dateStr);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
};

const getEndTime = (startStr, durationMin) => {
  const d = parseLocalTime(startStr);
  d.setMinutes(d.getMinutes() + (durationMin || 120));
  return d;
};

const getPositionAndWidth = (startStr, durationMin) => {
  const start = parseLocalTime(startStr);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const timelineStartMinutes = HOUR_START * 60;
  const offsetMinutes = startMinutes - timelineStartMinutes;
  const left = (offsetMinutes / 60) * HOUR_WIDTH;
  const width = ((durationMin || 120) / 60) * HOUR_WIDTH;
  return { left: Math.max(0, left), width: Math.max(width, 60) };
};

const Showtimes = () => {
  const [cities, setCities] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });

  const [modalState, setModalState] = useState({ type: null, data: null });
  const timelineRef = useRef(null);

  // Movie color map
  const movieColorMap = useRef({});
  let colorIndex = 0;
  const getMovieColor = (movieId) => {
    if (!movieColorMap.current[movieId]) {
      movieColorMap.current[movieId] = SHOWTIME_COLORS[colorIndex % SHOWTIME_COLORS.length];
      colorIndex++;
    }
    return movieColorMap.current[movieId];
  };

  // Fetch cities and cinemas on mount
  useEffect(() => {
    getCities()
      .then((res) => {
        const raw = res?.data ?? res;
        setCities(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setCities([]));

    getCinemas()
      .then((res) => {
        const items = res?.data?.items || res?.data || [];
        setCinemas(Array.isArray(items) ? items : []);
      })
      .catch(() => setCinemas([]));

    getMoviesPublic({ pageSize: 200 })
      .then((res) => {
        const items = res?.data?.items || res?.data || [];
        setMovies(Array.isArray(items) ? items : []);
      })
      .catch(() => setMovies([]));
  }, []);

  // Filter cinemas by selected city
  const cinemaOptions = selectedCityId
    ? cinemas.filter((c) => String(c.province_id || c.city_id) === String(selectedCityId))
    : cinemas;

  // Reset cinema when city changes
  useEffect(() => {
    setSelectedCinemaId('');
    setRooms([]);
    setShowtimes([]);
  }, [selectedCityId]);

  // Fetch rooms when cinema changes
  useEffect(() => {
    if (selectedCinemaId) {
      getRooms({ cinema_id: selectedCinemaId })
        .then((res) => {
          const items = res?.data?.items || res?.data || [];
          setRooms(Array.isArray(items) ? items : []);
        })
        .catch(() => setRooms([]));
    }
  }, [selectedCinemaId]);

  // Fetch showtimes when filters change
  const fetchShowtimes = useCallback(() => {
    if (!selectedMovieId || !selectedCinemaId || !selectedDate) {
      setShowtimes([]);
      return;
    }
    setLoading(true);
    getShowtimesByFilter({
      movie_id: selectedMovieId,
      cinema_id: selectedCinemaId,
      date: selectedDate,
    })
      .then((res) => {
        const items = res?.data?.showtimes || res?.data || [];
        setShowtimes(Array.isArray(items) ? items : []);
      })
      .catch(() => setShowtimes([]))
      .finally(() => setLoading(false));
  }, [selectedMovieId, selectedCinemaId, selectedDate]);

  useEffect(() => {
    fetchShowtimes();
  }, [fetchShowtimes]);

  // Group showtimes by room
  const showtimesByRoom = {};
  showtimes.forEach((st) => {
    const roomId = String(st.room?.id || st.room_id);
    if (!showtimesByRoom[roomId]) showtimesByRoom[roomId] = [];
    showtimesByRoom[roomId].push(st);
  });

  // Date navigation
  const changeDate = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const displayDate = new Date(selectedDate).toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const closeModal = () => setModalState({ type: null, data: null });
  const onModalSuccess = () => fetchShowtimes();

  // Generate hour labels
  const hourLabels = [];
  for (let h = HOUR_START; h <= HOUR_END; h++) {
    hourLabels.push(`${h.toString().padStart(2, '0')}:00`);
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-white">Lịch chiếu</h2>
        <Button
          onClick={() => setModalState({ type: 'add', data: null, cityId: selectedCityId, cinemaId: selectedCinemaId, defaultDate: selectedDate })}
          className="gap-2 rounded-full px-5 hover:scale-105 transition-transform duration-200 hover:shadow-[0_0_15px_rgba(229,9,20,0.3)]"
        >
          <Plus className="h-4 w-4" />
          Thêm suất chiếu
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-border bg-surface/30 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
          {/* City/Province filter */}
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Khu vực</label>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="flex h-10 w-full rounded-full border border-border bg-zinc-900/80 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="">-- Chọn tỉnh/TP --</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Cinema filter */}
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Rạp chiếu</label>
            <select
              value={selectedCinemaId}
              onChange={(e) => setSelectedCinemaId(e.target.value)}
              disabled={!selectedCityId}
              className="flex h-10 w-full rounded-full border border-border bg-zinc-900/80 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none disabled:opacity-50"
            >
              <option value="">-- Chọn rạp --</option>
              {cinemaOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Movie filter */}
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Phim</label>
            <select
              value={selectedMovieId}
              onChange={(e) => setSelectedMovieId(e.target.value)}
              className="flex h-10 w-full rounded-full border border-border bg-zinc-900/80 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="">-- Chọn phim --</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
          </div>

          {/* Date picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Ngày chiếu</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDate(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex h-10 rounded-full border border-border bg-zinc-900/80 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                onClick={() => changeDate(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1" />
          <p className="text-sm text-zinc-400 flex items-center gap-2 pb-2">
            <Calendar className="h-4 w-4" />
            {displayDate}
          </p>
        </div>
      </div>

      {/* Timeline view */}
      <div className="rounded-xl border border-border bg-surface/30 shadow-sm overflow-hidden">
        {!selectedMovieId || !selectedCinemaId ? (
          <div className="p-12 text-center text-zinc-500">
            <Search className="h-8 w-8 mx-auto mb-3 text-zinc-600" />
            <p className="text-sm">Vui lòng chọn <strong className="text-zinc-300">Rạp chiếu</strong> và <strong className="text-zinc-300">Phim</strong> để xem lịch chiếu.</p>
          </div>
        ) : loading ? (
          <div className="p-12 text-center text-zinc-500">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Đang tải lịch chiếu...</p>
          </div>
        ) : (
          <div ref={timelineRef} className="overflow-x-auto">
            {/* Timeline header + body container */}
            <div style={{ minWidth: ROOM_LABEL_WIDTH + TIMELINE_WIDTH + 20 }}>
              {/* Header with hour labels */}
              <div className="flex border-b border-border/50 bg-surface/50 sticky top-0 z-10">
                {/* Room label header */}
                <div className="shrink-0 flex items-center px-4 border-r border-border/40"
                  style={{ width: ROOM_LABEL_WIDTH, minWidth: ROOM_LABEL_WIDTH }}
                >
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Phòng chiếu
                  </span>
                </div>
                {/* Hour labels */}
                <div className="relative flex-1" style={{ width: TIMELINE_WIDTH }}>
                  <div className="flex">
                    {hourLabels.map((label, i) => (
                      <div
                        key={label}
                        className="text-[10px] font-medium text-zinc-500 py-3 border-l border-border/30 pl-2"
                        style={{ width: HOUR_WIDTH, minWidth: HOUR_WIDTH }}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Room rows */}
              {rooms.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  Không có phòng chiếu nào cho rạp này.
                </div>
              ) : (
                rooms.map((room) => {
                  const roomShowtimes = showtimesByRoom[String(room.id)] || [];
                  return (
                    <div key={room.id} className="flex border-b border-border/20 hover:bg-white/[0.02] transition-colors group/row min-h-[80px]">
                      {/* Room label */}
                      <div
                        className="shrink-0 flex flex-col justify-center px-4 py-4 border-r border-border/40 bg-surface/30"
                        style={{ width: ROOM_LABEL_WIDTH, minWidth: ROOM_LABEL_WIDTH }}
                      >
                        <p className="text-sm font-semibold text-white">{room.name}</p>
                        {room.room_type && (
                          <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${room.room_type === 'IMAX' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              room.room_type === 'Gold Class' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                'bg-zinc-700/30 text-zinc-400 border border-zinc-600/20'
                            }`}>
                            {room.room_type}
                          </span>
                        )}
                      </div>

                      {/* Timeline area */}
                      <div className="relative flex-1" style={{ width: TIMELINE_WIDTH, minHeight: 80 }}>
                        {/* Hour grid lines */}
                        {hourLabels.map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-0 bottom-0 border-l border-border/15"
                            style={{ left: i * HOUR_WIDTH }}
                          />
                        ))}

                        {/* Showtime blocks */}
                        {roomShowtimes.map((st) => {
                          const movieId = st.movie.id || st.movie?.id;
                          const movieTitle = st.movie?.title || movies.find(m => m.id === movieId)?.title || `Phim #${movieId}`;
                          const duration = st.movie?.duration || movies.find(m => m.id === movieId)?.duration || 120;
                          const color = getMovieColor(movieId);
                          const { left, width } = getPositionAndWidth(st.start_time, duration);
                          const startTime = formatTime(st.start_time);
                          const endTime = formatTime(getEndTime(st.start_time, duration));
                          const price = st.base_price ? `${Number(st.base_price).toLocaleString('vi-VN')}đ` : '';

                          return (
                            <div
                              key={st.id}
                              className="absolute top-2 bottom-2 rounded-lg cursor-pointer hover:scale-[1.02] transition-transform duration-150 overflow-hidden group/block"
                              style={{
                                left,
                                width,
                                backgroundColor: color.bg,
                                borderLeft: `3px solid ${color.border}`,
                              }}
                              onClick={() => setModalState({ type: 'edit', data: st, cinemaId: selectedCinemaId })}
                              title={`${movieTitle} — ${startTime}–${endTime}`}
                            >
                              <div className="px-2.5 py-1.5 h-full flex flex-col justify-between">
                                {/* Time badge */}
                                <div className="flex items-center gap-1.5">
                                  <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                                    style={{ backgroundColor: color.timeBg }}
                                  >
                                    {startTime}
                                  </span>
                                  <span className="text-[10px] text-zinc-500">—</span>
                                  <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                                    style={{ backgroundColor: color.timeBg }}
                                  >
                                    {endTime}
                                  </span>
                                </div>

                                {/* Movie name */}
                                <p
                                  className="text-xs font-semibold truncate mt-0.5"
                                  style={{ color: color.text }}
                                >
                                  {movieTitle}
                                </p>

                                {/* Duration + Price */}
                                <div className="flex items-center gap-2 mt-auto">
                                  <span className="text-[10px] text-zinc-400">{duration}p</span>
                                  {price && (
                                    <>
                                      <span className="text-[10px] text-zinc-600">·</span>
                                      <span className="text-[10px] text-zinc-400">{price}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Delete button on hover */}
                              <button
                                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/block:opacity-100 transition-opacity text-[10px] font-bold hover:bg-red-500"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModalState({ type: 'delete', data: st });
                                }}
                                title="Xóa suất chiếu"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Summary bar */}
        {selectedMovieId && selectedCinemaId && !loading && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border/40 bg-surface/50">
            <span className="text-xs text-zinc-500">
              Tổng cộng <span className="font-semibold text-zinc-300">{showtimes.length}</span> suất chiếu
            </span>
            <span className="text-xs text-zinc-500">
              {rooms.length} phòng · {displayDate}
            </span>
          </div>
        )}
      </div>

      {/* Modal */}
      <ShowtimeModal
        state={modalState}
        onClose={closeModal}
        onSuccess={onModalSuccess}
      />
    </div>
  );
};

export default Showtimes;
