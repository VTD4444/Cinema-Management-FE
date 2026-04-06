import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Clock3, Film, PlayCircle, Share2, Star } from 'lucide-react';
import UserLayout from '../components/layout/UserLayout';
import { Button } from '../components/ui';
import { getMovieById } from '../api/movieApi';

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
  } catch (_e) {
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
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getMovieById(id);
        const data = res?.data || res;
        if (data && typeof data === 'object') {
          setMovie(data);
        } else {
          setError('Không tìm thấy phim.');
        }
      } catch (_e) {
        setError('Không thể tải chi tiết phim.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

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
                      <Link to="/search">
                        <Button className="h-10 rounded-md bg-primary px-5 text-sm font-semibold hover:bg-primary-hover">
                          Đặt vé ngay
                        </Button>
                      </Link>
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
