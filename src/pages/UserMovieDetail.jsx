import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Clock3, Film, MapPin, PlayCircle, Share2, Star } from 'lucide-react';
import UserLayout from '../components/layout/UserLayout';
import { Button } from '../components/ui';
import { getMovieById } from '../api/movieApi';
import { getCitiesPublic } from '../api/cityApi';
import { getCinemasPublic } from '../api/cinemaApi';
import { getShowtimesByFilter } from '../api/showtimeApi';

const posterFromMovie = (movie) => {
  if (Array.isArray(movie?.poster_urls) && movie.poster_urls.length > 0) return movie.poster_urls[0];
  return movie?.poster_url || movie?.thumbnail_url || null;
};

const getYoutubeEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '').trim();
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v');
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
  } catch {
    return '';
  }
  return '';
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Đang cập nhật';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN');
};

const splitCommaText = (value) =>
  typeof value === 'string'
    ? value
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
    : [];

const UserMovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [groupedShowtimes, setGroupedShowtimes] = useState({});
  const [cachedShowtimes, setCachedShowtimes] = useState({});
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const allDates = useMemo(
    () =>
      Array.from({ length: 5 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        return d;
      }),
    [today],
  );
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const [movieRes, cityRes] = await Promise.all([getMovieById(id), getCitiesPublic()]);
        const data = movieRes?.data || movieRes;
        const cityRaw = cityRes?.data?.items || cityRes?.data || cityRes?.results || [];
        const cityList = Array.isArray(cityRaw) ? cityRaw : [];
        if (data && typeof data === 'object') setMovie(data);
        else setError('Không tìm thấy phim.');
        setCities(cityList);
        if (cityList.length > 0) setSelectedCity(String(cityList[0].id));
      } catch {
        setError('Không thể tải chi tiết phim.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  useEffect(() => {
    if (!selectedCity || !id) return;
    let active = true;
    const fetchShowtimes = async () => {
      setLoadingShowtimes(true);
      try {
        const cRes = await getCinemasPublic({ province_id: selectedCity });
        let cinemaList = cRes?.data?.items || cRes?.data || cRes?.results || [];
        if (!Array.isArray(cinemaList)) cinemaList = [];
        if (!active) return;
        setCinemas(cinemaList);
        if (cinemaList.length === 0) {
          setCachedShowtimes({});
          setGroupedShowtimes({});
          setAvailableDates([]);
          return;
        }

        const fetchPromises = [];
        allDates.forEach((d) => {
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate(),
          ).padStart(2, '0')}`;
          cinemaList.forEach((c) => {
            fetchPromises.push(
              getShowtimesByFilter({ movie_id: id, cinema_id: c.id, date: dateStr })
                .then((r) => {
                  const sData = r?.data?.showtimes || r?.data?.items || r?.data || [];
                  return { dateStr, cinemaId: c.id, showtimes: Array.isArray(sData) ? sData : [] };
                })
                .catch(() => ({ dateStr, cinemaId: c.id, showtimes: [] })),
            );
          });
        });

        const results = await Promise.all(fetchPromises);
        if (!active) return;
        const newCache = {};
        allDates.forEach((d) => {
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate(),
          ).padStart(2, '0')}`;
          newCache[dateStr] = {};
        });

        results.forEach((res) => {
          const formatGroups = {};
          res.showtimes.forEach((st) => {
            const format = st.format || st.room_type || '2D';
            if (!formatGroups[format]) formatGroups[format] = [];
            formatGroups[format].push(st);
          });
          Object.keys(formatGroups).forEach((f) =>
            formatGroups[f].sort((a, b) => (a.start_time || '').localeCompare(b.start_time || '')),
          );
          newCache[res.dateStr][res.cinemaId] = formatGroups;
        });

        setCachedShowtimes(newCache);
        const validDates = allDates.filter((d) => {
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
            d.getDate(),
          ).padStart(2, '0')}`;
          return Object.values(newCache[dateStr] || {}).some((groups) => Object.keys(groups).length > 0);
        });
        setAvailableDates(validDates);
        if (validDates.length > 0 && !validDates.find((vd) => vd.getTime() === selectedDate.getTime())) {
          setSelectedDate(validDates[0]);
        }
      } finally {
        if (active) setLoadingShowtimes(false);
      }
    };
    fetchShowtimes();
    return () => {
      active = false;
    };
  }, [selectedCity, id, allDates, selectedDate]);

  useEffect(() => {
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(
      selectedDate.getDate(),
    ).padStart(2, '0')}`;
    setGroupedShowtimes(cachedShowtimes[dateStr] || {});
  }, [selectedDate, cachedShowtimes]);

  const poster = posterFromMovie(movie);
  const embedTrailer = useMemo(() => getYoutubeEmbedUrl(movie?.trailer_url), [movie?.trailer_url]);
  const statusLabel =
    String(movie?.status || '').toUpperCase() === 'SHOWING'
      ? 'Đang chiếu'
      : String(movie?.status || '').toUpperCase() === 'COMING_SOON'
        ? 'Sắp chiếu'
        : 'Phim';
  const genres = Array.isArray(movie?.genres) ? movie.genres.map((g) => g?.name).filter(Boolean) : [];
  const directors = splitCommaText(movie?.directors_name);
  const cast = splitCommaText(movie?.cast_names || movie?.actors || movie?.actor_names);
  const daysOfWeek = ['CN', 'THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7'];
  const cinemasWithShowtimes = cinemas.filter(
    (c) => groupedShowtimes[c.id] && Object.keys(groupedShowtimes[c.id]).length > 0,
  );

  return (
    <UserLayout>
      <div className="relative min-h-screen bg-[#080808]">
        <section className="relative h-[340px] w-full overflow-hidden border-b border-zinc-900">
          {poster ? (
            <img src={poster} alt={movie?.title || 'movie banner'} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-[#080808]" />
        </section>

        <div className="relative mx-auto -mt-56 w-full max-w-6xl px-4 pb-12 sm:px-8">
          {loading ? (
            <p className="py-16 text-center text-sm text-zinc-400">Đang tải chi tiết phim...</p>
          ) : error ? (
            <p className="py-16 text-center text-sm text-red-400">{error}</p>
          ) : !movie ? (
            <p className="py-16 text-center text-sm text-zinc-400">Không có dữ liệu phim.</p>
          ) : (
            <>
              <section className="mb-10 pt-5 md:pt-8">
                <div className="grid items-start gap-8 md:grid-cols-[240px_1fr]">
                  <div className="w-full max-w-[240px] overflow-hidden rounded-xl bg-zinc-900 shadow-[0_14px_40px_rgba(0,0,0,0.55)] md:mx-0">
                    {poster ? (
                      <img src={poster} alt={movie.title} className="aspect-[3/4] h-full w-full object-cover" />
                    ) : (
                      <div className="flex aspect-[3/4] items-center justify-center text-xs text-zinc-500">
                        No poster
                      </div>
                    )}
                  </div>
                  <div className="pt-1 md:pt-3">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-primary px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                        {statusLabel}
                      </span>
                      <span className="rounded border border-zinc-700 px-2 py-1 text-[10px] text-zinc-400">
                        {genres[0] || 'Movie'}
                      </span>
                    </div>
                    <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">{movie.title}</h1>
                    <div className="mb-5 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 text-amber-400" />
                        {movie.rating || 'N/A'}
                      </span>
                      {genres.length > 0 && <span>{genres[0]}</span>}
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {movie.duration ? `${movie.duration} phút` : 'Đang cập nhật'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(movie.release_date)}
                      </span>
                    </div>

                    <h2 className="mb-2 text-sm font-semibold text-zinc-200">Nội dung phim</h2>
                    <p className="mb-6 max-w-3xl text-sm leading-7 text-zinc-400">
                      {movie.description || 'Nội dung phim sẽ được cập nhật sớm.'}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        className="h-10 rounded-md bg-primary px-5 text-sm font-semibold hover:bg-primary-hover"
                        onClick={() => {
                          document.getElementById('booking-showtimes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        Đặt vé ngay
                      </Button>
                      <Button
                        variant="secondary"
                        className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-5 text-sm text-zinc-200 hover:bg-zinc-800"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Chia sẻ
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid gap-3 border-t border-zinc-900 pt-6 md:grid-cols-3">
                  <div className="rounded-lg bg-zinc-950/60 p-4">
                    <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">Đạo diễn</p>
                    <p className="text-sm text-zinc-200">{directors.join(', ') || 'Đang cập nhật'}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-950/60 p-4">
                    <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">Thể loại</p>
                    <p className="text-sm text-zinc-200">{genres.join(', ') || 'Đang cập nhật'}</p>
                  </div>
                  <div className="rounded-lg bg-zinc-950/60 p-4">
                    <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">Diễn viên</p>
                    <p className="text-sm text-zinc-200">
                      {cast.join(', ') }
                    </p>
                  </div>
                </div>
              </section>

              <section id="booking-showtimes" className="mx-auto mb-10 max-w-6xl">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold text-zinc-100">Lịch Chiếu</h3>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-sm text-zinc-200 outline-none"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                  {(availableDates.length > 0 ? availableDates : [today]).map((d) => {
                    const selected = d.getTime() === selectedDate.getTime();
                    return (
                      <button
                        key={d.toISOString()}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`min-w-[84px] rounded-xl border px-3 py-2 text-center text-xs ${
                          selected
                            ? 'border-primary bg-primary text-white'
                            : 'border-zinc-800 bg-zinc-950 text-zinc-400'
                        }`}
                      >
                        <div className="font-semibold">{String(d.getDate()).padStart(2, '0')}</div>
                        <div className="opacity-80">{daysOfWeek[d.getDay()]}</div>
                      </button>
                    );
                  })}
                </div>

                {loadingShowtimes ? (
                  <p className="rounded-xl bg-zinc-950 p-8 text-center text-sm text-zinc-500">Đang tải lịch chiếu...</p>
                ) : cinemasWithShowtimes.length === 0 ? (
                  <p className="rounded-xl bg-zinc-950 p-8 text-center text-sm text-zinc-500">
                    Không có suất chiếu cho điều kiện đã chọn.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {cinemasWithShowtimes.map((cinema) => {
                      const groups = groupedShowtimes[cinema.id];
                      return (
                        <div key={cinema.id} className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
                          <div className="mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-sm font-semibold text-zinc-100">{cinema.name}</p>
                              <p className="text-xs text-zinc-500">{cinema.address}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            {Object.keys(groups).map((format) => (
                              <div key={format}>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400">{format}</p>
                                <div className="flex flex-wrap gap-2">
                                  {groups[format].map((st) => {
                                    const timeLabel = st.start_time?.includes('T')
                                      ? st.start_time.split('T')[1].slice(0, 5)
                                      : (st.start_time || '').slice(0, 5);
                                    return (
                                      <button
                                        key={st.id}
                                        type="button"
                                        onClick={() =>
                                          navigate(`/booking/${st.id}`, {
                                            state: { movie, cinema, time: timeLabel, base_price: st.base_price },
                                          })
                                        }
                                        className="rounded-lg border border-zinc-800 bg-black px-3 py-2 text-sm font-semibold text-zinc-200 hover:border-zinc-600 hover:text-white"
                                      >
                                        {timeLabel}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section className="mx-auto mb-8 max-w-5xl">
                <h3 className="mb-4 text-center text-3xl font-black tracking-tight text-zinc-100">TRAILER</h3>
                {embedTrailer ? (
                  <div className="overflow-hidden rounded-xl bg-zinc-950 shadow-lg">
                    <div className="relative aspect-video">
                      <iframe
                        src={embedTrailer}
                        title={`${movie.title} trailer`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                  </div>
                ) : movie.trailer_url ? (
                  <a
                    href={movie.trailer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-[280px] items-center justify-center rounded-xl bg-zinc-950 text-zinc-300 hover:text-white"
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Mở trailer
                  </a>
                ) : (
                  <div className="flex min-h-[280px] items-center justify-center rounded-xl bg-zinc-950 text-zinc-500">
                    Trailer chưa được cập nhật.
                  </div>
                )}
              </section>

              <section className="mx-auto max-w-4xl rounded-xl bg-zinc-950/60 p-4 text-center text-xs text-zinc-500">
                <Film className="mx-auto mb-2 h-4 w-4" />
                Thông tin lịch chiếu sẽ hiển thị khi bạn chọn rạp ở trang tìm kiếm.
              </section>
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default UserMovieDetail;
