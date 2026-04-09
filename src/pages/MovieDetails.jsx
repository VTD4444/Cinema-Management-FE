import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Star, MapPin } from 'lucide-react';
import UserLayout from '../components/layout/UserLayout';
import { getMovieById } from '../api/movieApi';
import { getCitiesPublic } from '../api/cityApi';
import { getCinemasPublic } from '../api/cinemaApi';
import { getShowtimesByFilter } from '../api/showtimeApi';

const STATUS_MAP = {
  SHOWING: { text: 'NOW SHOWING', color: 'bg-red-600 text-white' },
  COMING_SOON: { text: 'COMING SOON', color: 'bg-blue-600 text-white' },
  PASSED: { text: 'ENDED', color: 'bg-zinc-600 text-white' },
};

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');

  const [cinemas, setCinemas] = useState([]);
  const [groupedShowtimes, setGroupedShowtimes] = useState({});
  const [cachedShowtimes, setCachedShowtimes] = useState({});
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  // Manage Dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allDates = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);

  // Fetch Movie and Cities
  useEffect(() => {
    getMovieById(id).then(res => setMovie(res?.data)).catch(console.error);

    getCitiesPublic().then(res => {
      const data = res?.data?.items || res?.data || res?.results || [];
      const list = Array.isArray(data) ? data : [];
      setCities(list);
      if (list.length > 0) setSelectedCity(list[0].id);
    });
  }, [id]);

  // Fetch Cinemas & Showtimes dynamically
  useEffect(() => {
    if (!selectedCity) return;
    let isSubscribed = true;

    const fetchAll = async () => {
      setLoadingShowtimes(true);
      try {
        const r1 = await getCinemasPublic({ province_id: selectedCity });
        let cinemaList = r1?.data?.items || r1?.data || r1?.results || [];
        if (!Array.isArray(cinemaList)) cinemaList = [];

        if (!isSubscribed) return;
        setCinemas(cinemaList);

        if (cinemaList.length === 0) {
          setGroupedShowtimes({});
          return;
        }

        // Fetch for all dates concurrently to identify available ones
        const fetchPromises = [];
        allDates.forEach(d => {
          const dateStr = [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, '0'),
            String(d.getDate()).padStart(2, '0')
          ].join('-');

          cinemaList.forEach(c => {
            fetchPromises.push(
              getShowtimesByFilter({ movie_id: id, cinema_id: c.id, date: dateStr })
                .then(r2 => {
                  const sData = r2?.data?.showtimes || r2?.data?.items || r2?.data || [];
                  return { dateStr, cinemaId: c.id, showtimes: Array.isArray(sData) ? sData : [] };
                })
                .catch(error => {
                  console.error(error);
                  return { dateStr, cinemaId: c.id, showtimes: [] };
                })
            );
          });
        });

        const results = await Promise.all(fetchPromises);
        if (!isSubscribed) return;

        const newCache = {};
        allDates.forEach(d => {
          const dateStr = [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, '0'),
            String(d.getDate()).padStart(2, '0')
          ].join('-');
          newCache[dateStr] = {};
        });

        results.forEach(res => {
          const formatGroups = {};
          res.showtimes.forEach(st => {
            const format = st.format || st.room_type || '2D Phụ đề'; // fallback to standard format
            if (!formatGroups[format]) formatGroups[format] = [];
            formatGroups[format].push(st);
          });

          for (const format in formatGroups) {
            formatGroups[format].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
          }
          newCache[res.dateStr][res.cinemaId] = formatGroups;
        });

        setCachedShowtimes(newCache);

        const validDates = allDates.filter(d => {
          const dateStr = [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, '0'),
            String(d.getDate()).padStart(2, '0')
          ].join('-');

          return Object.values(newCache[dateStr]).some(groups => Object.keys(groups).length > 0);
        });

        setAvailableDates(validDates);

        if (validDates.length > 0) {
          // If current selectedDate is not among valid ones, select the first valid
          const currentValid = validDates.find(vd => vd.getTime() === selectedDate.getTime());
          if (!currentValid) setSelectedDate(validDates[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isSubscribed) setLoadingShowtimes(false);
      }
    };

    fetchAll();
    return () => { isSubscribed = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, id]);

  // Update rendered showtimes when selectedDate changes
  useEffect(() => {
    const dateStr = [
      selectedDate.getFullYear(),
      String(selectedDate.getMonth() + 1).padStart(2, '0'),
      String(selectedDate.getDate()).padStart(2, '0')
    ].join('-');
    setGroupedShowtimes(cachedShowtimes[dateStr] || {});
  }, [selectedDate, cachedShowtimes]);

  const daysOfWeek = ['CN', 'THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7'];

  if (!movie) return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] flex items-center justify-center text-white">
        <p>Đang tải chi tiết phim...</p>
      </div>
    </UserLayout>
  );

  const backdrop = movie.poster_urls?.[1] || movie.poster_urls?.[0]; // Usually backdrop is 2nd image or fallback
  const poster = movie.poster_urls?.[0];
  const statusInfo = STATUS_MAP[movie.status] || STATUS_MAP.SHOWING;

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}?autoplay=1`
      : null;
  };

  const cinemasWithShowtimes = cinemas.filter(c =>
    groupedShowtimes[c.id] && Object.keys(groupedShowtimes[c.id]).length > 0
  );

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#0e0e0e] pb-20 text-zinc-300">
        {/* Movie Info Header */}
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-6 pt-8 sm:px-6 md:flex-row md:gap-10 md:pt-10">
          {/* Poster */}
          {poster && (
            <div className="aspect-[2/3] w-40 shrink-0 overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl sm:w-48 md:w-72">
              <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Info Details */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex gap-2 mb-4">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-sm ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>

            <h1 className="mb-4 line-clamp-2 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm font-medium mb-8">
              <div className="flex items-center gap-1.5">
                <Clock className="w-5 h-5" />
                <span>{Math.floor((movie.duration || 0) / 60)}h {(movie.duration || 0) % 60}m</span>
              </div>
              <div className="flex gap-2 border-l border-zinc-700 pl-6 space-x-2">
                {(movie.genre_names || movie.genres || [{ name: 'Hành động' }]).map((g, i) => (
                  <span key={i} className="text-xs px-2.5 py-0.5 rounded border border-zinc-700 text-zinc-400">
                    {g.name || g}
                  </span>
                ))}
              </div>
            </div>

            {/* Description & metadata moved from bottom */}
            <div className="space-y-6 max-w-3xl border-t border-zinc-800/80 pt-6">
              <div>
                <h3 className="text-zinc-400 text-sm font-medium mb-2 uppercase tracking-wider">Nội dung</h3>
                <p className="text-zinc-200 leading-relaxed text-[15px]">{movie.description || 'Chưa có thông tin.'}</p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:gap-12">
                <div>
                  <h3 className="text-zinc-400 text-sm font-medium mb-1 uppercase tracking-wider">Đạo diễn</h3>
                  <p className="text-white font-medium">{movie.directors_name || 'Đang cập nhật'}</p>
                </div>
                <div>
                  <h3 className="text-zinc-400 text-sm font-medium mb-1 uppercase tracking-wider">Khởi chiếu</h3>
                  <p className="text-white font-medium">{movie.release_date ? new Date(movie.release_date).toLocaleDateString('vi-VN') : 'Đang cập nhật'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Showtimes Section */}
        <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6">

          {/* Header & Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-red-600 rounded-full"></div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Lịch Chiếu</h2>
            </div>

            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full appearance-none cursor-pointer rounded-xl border border-zinc-800 bg-[#141414] px-4 py-3 pr-10 font-medium text-white focus:outline-none focus:ring-1 focus:ring-zinc-600 sm:min-w-[220px] sm:px-6 sm:pr-12"
              >
                <option value="">Chọn khu vực</option>
                {cities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 scrollbar-hide">
            {availableDates.length === 0 && !loadingShowtimes ? (
              <div className="text-zinc-500 italic text-sm">Chưa có lịch chiếu trong các ngày tới.</div>
            ) : (
              availableDates.map((d, idx) => {
                const isSelected = d.getTime() === selectedDate.getTime();
                const isToday = d.getTime() === today.getTime();
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(d)}
                    className={`flex flex-col items-center justify-center min-w-[85px] py-4 rounded-2xl transition-all shrink-0 ${isSelected
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'bg-[#141414] text-zinc-400 hover:bg-[#1a1a1a] hover:text-white border border-transparent hover:border-zinc-800'
                      }`}
                  >
                    <span className="text-[10px] uppercase tracking-wide mb-1 opacity-80">
                      {isToday ? 'HÔM NAY' : daysOfWeek[d.getDay()]}
                    </span>
                    <span className={`text-2xl leading-none mb-1 ${isSelected ? 'font-black' : 'font-bold'}`}>
                      {String(d.getDate()).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-medium opacity-70">
                      Tháng {d.getMonth() + 1}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Cinemas List */}
          <div className="space-y-6">
            {loadingShowtimes ? (
              <div className="py-20 text-center text-zinc-500">
                Đang tải lịch chiếu...
              </div>
            ) : cinemasWithShowtimes.length === 0 ? (
              <div className="py-20 text-center text-zinc-500 bg-[#141414] rounded-2xl border border-zinc-800">
                Không có suất chiếu nào được tìm thấy cho ngày này.
              </div>
            ) : (
              cinemasWithShowtimes.map(cinema => {
                const groups = groupedShowtimes[cinema.id];
                return (
                  <div key={cinema.id} className="bg-[#141414] rounded-2xl border border-zinc-800 overflow-hidden">
                    {/* Cinema Header */}
                    <div className="flex items-center gap-5 p-6 border-b border-zinc-800/80 bg-[#1a1a1a]/50">
                      <div className="w-12 h-12 rounded-xl bg-red-950/20 border border-red-900/30 flex items-center justify-center text-red-500 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1.5">{cinema.name}</h3>
                        <p className="text-xs text-zinc-500">{cinema.address}</p>
                      </div>
                    </div>

                    {/* Showtime Formats */}
                    <div className="p-6 space-y-6">
                      {Object.keys(groups).map(format => (
                        <div key={format}>
                          <div className="flex items-center gap-2 mb-4">
                            <h4 className="text-sm font-bold text-zinc-300">{format}</h4>
                            {format.toLowerCase().includes('imax') && (
                              <svg className="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3">
                            {groups[format].map(st => {
                              let timeLabel = '';
                              if (st.start_time) {
                                if (st.start_time.includes('T')) {
                                  // Extract "08:00" directly from "2026-03-20T08:00:00.000Z" to avoid JS Date timezone shifting
                                  timeLabel = st.start_time.split('T')[1].slice(0, 5);
                                } else {
                                  timeLabel = st.start_time.slice(0, 5);
                                }
                              }

                              return (
                                <button
                                  key={st.id}
                                  onClick={() => navigate(`/booking/${st.id}`, { state: { movie, cinema, time: timeLabel, base_price: st.base_price } })}
                                  className="flex items-center justify-center w-20 py-2.5 bg-[#0e0e0e] hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 rounded-xl transition-colors group"
                                >
                                  <span className="text-sm font-bold text-white group-hover:text-red-400">{timeLabel}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* Trailer Section */}
        <div className="mx-auto mt-16 max-w-7xl border-t border-zinc-800/50 px-4 pt-10 sm:px-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-8 bg-red-600 rounded-full"></div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Trailer</h2>
          </div>

          <div className="max-w-4xl mx-auto">
            {movie.trailer_url ? (
              isPlayingTrailer ? (
                <div className="rounded-2xl overflow-hidden border border-zinc-800 aspect-video relative bg-black">
                  <iframe
                    width="100%"
                    height="100%"
                    src={getYoutubeEmbedUrl(movie.trailer_url)}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute top-0 left-0 w-full h-full"
                  ></iframe>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 group relative aspect-video cursor-pointer" onClick={() => setIsPlayingTrailer(true)}>
                  <img src={movie.backdrop_url || backdrop} alt="Trailer" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/40 group-hover:scale-110 transition-transform">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1"><path d="M5 3l14 9-14 9V3z" /></svg>
                    </div>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 font-bold justify-between flex text-lg text-white">
                    <span>Trải nghiệm trước bộ phim</span>
                    <span className="text-sm border px-3 py-1 bg-black/60 rounded-full font-normal">Play Trailer</span>
                  </div>
                </div>
              )
            ) : (
              <div className="aspect-video rounded-2xl border border-zinc-800 bg-[#141414] flex items-center justify-center text-zinc-500">
                Chưa có trailer
              </div>
            )}
          </div>
        </div>

      </div>
    </UserLayout>
  );
};

export default MovieDetails;
