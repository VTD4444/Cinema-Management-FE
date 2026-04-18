import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clapperboard } from 'lucide-react';
import UserLayout from '../components/layout/UserLayout';
import { Button } from '../components/ui';
import { getActorByIdPublic } from '../api/actorApi';
import { getMoviesPublic } from '../api/movieApi';

const getMoviePoster = (movie) => {
  if (Array.isArray(movie?.poster_urls) && movie.poster_urls.length > 0) return movie.poster_urls[0];
  return movie?.poster_url || null;
};

const UserActorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actor, setActor] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchActorData = async () => {
      setLoading(true);
      setError('');
      try {
        const [actorRes, showingRes, comingRes] = await Promise.all([
          getActorByIdPublic(id),
          getMoviesPublic({ actorId: id, status: 'SHOWING', pageNo: 1, pageSize: 30 }),
          getMoviesPublic({ actorId: id, status: 'COMING_SOON', pageNo: 1, pageSize: 30 }),
        ]);

        const actorData = actorRes?.data?.actor || actorRes?.actor || actorRes?.data || null;
        if (!actorData) {
          setError('Không tìm thấy diễn viên.');
          setActor(null);
          setRelatedMovies([]);
          return;
        }

        const showingRaw = showingRes?.data?.items || showingRes?.data || [];
        const comingRaw = comingRes?.data?.items || comingRes?.data || [];
        const movieList = [...(Array.isArray(showingRaw) ? showingRaw : []), ...(Array.isArray(comingRaw) ? comingRaw : [])];

        setActor(actorData);
        setRelatedMovies(movieList.slice(0, 12));
      } catch {
        setError('Không thể tải thông tin diễn viên.');
        setActor(null);
        setRelatedMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActorData();
  }, [id]);

  const actorInitial = useMemo(() => String(actor?.name || '?').charAt(0), [actor?.name]);
  const heroBackdrop = useMemo(() => {
    if (actor?.image_url) return actor.image_url;
    if (relatedMovies.length > 0) return getMoviePoster(relatedMovies[0]);
    return null;
  }, [actor?.image_url, relatedMovies]);

  return (
    <UserLayout>
      <div className="relative min-h-screen bg-[#080808]">
        <section className="relative h-[300px] w-full overflow-hidden border-b border-zinc-900 sm:h-[340px]">
          {heroBackdrop ? (
            <img src={heroBackdrop} alt={actor?.name || 'actor banner'} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />
          )}
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/45 to-[#080808]" />
        </section>

        <div className="relative mx-auto -mt-40 w-full max-w-6xl px-4 pb-12 sm:-mt-44 sm:px-6 lg:px-8">
          <Button variant="secondary" className="mb-5 h-9 px-3 text-xs" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>

          {loading ? (
            <div className="space-y-6">
              <section className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                  <div className="h-28 w-28 rounded-full bg-zinc-800" />
                  <div className="w-full max-w-xl space-y-3 sm:pt-2">
                    <div className="h-3 w-20 rounded bg-zinc-800" />
                    <div className="h-8 w-56 rounded bg-zinc-800" />
                    <div className="h-4 w-full rounded bg-zinc-800" />
                    <div className="h-4 w-3/4 rounded bg-zinc-800" />
                  </div>
                </div>
              </section>
              <section>
                <div className="mb-4 h-7 w-56 animate-pulse rounded bg-zinc-800" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div key={`movie-skeleton-${idx}`} className="animate-pulse">
                      <div className="aspect-[3/4] rounded-lg border border-zinc-800 bg-zinc-900" />
                      <div className="mt-2 h-4 w-10/12 rounded bg-zinc-800" />
                      <div className="mt-1 h-4 w-7/12 rounded bg-zinc-800" />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : error ? (
            <p className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-10 text-center text-sm text-red-400">
              {error}
            </p>
          ) : !actor ? (
            <p className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-10 text-center text-sm text-zinc-400">
              Không có dữ liệu diễn viên.
            </p>
          ) : (
            <>
              <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 sm:p-6">
                <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900">
                    {actor.image_url ? (
                      <img src={actor.image_url} alt={actor.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-zinc-300">
                        {actorInitial}
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Diễn viên</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">{actor.name}</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                      Thông tin chi tiết đang được cập nhật thêm. Bạn có thể xem các phim bên dưới có sự tham gia của
                      diễn viên này.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-8">
                <h2 className="mb-4 inline-flex items-center gap-2 text-xl font-bold text-zinc-100">
                  <Clapperboard className="h-5 w-5 text-primary" />
                  Phim có sự tham gia
                </h2>
                {relatedMovies.length === 0 ? (
                  <p className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-10 text-center text-sm text-zinc-500">
                    Chưa có phim phù hợp cho diễn viên này.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {relatedMovies.map((movie) => (
                      <button
                        key={movie.id}
                        type="button"
                        className="group min-w-0 text-left"
                        onClick={() => navigate(`/movie/${movie.id}`)}
                      >
                        <div className="aspect-[3/4] overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                          {getMoviePoster(movie) ? (
                            <img
                              src={getMoviePoster(movie)}
                              alt={movie.title}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
                              No image
                            </div>
                          )}
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm font-medium text-zinc-200">{movie.title}</p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default UserActorDetail;

