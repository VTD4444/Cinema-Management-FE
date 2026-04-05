import React, { useEffect, useState } from 'react';
import { getMoviesPublic } from '../api/movieApi';
import { withoutSoftDeleted } from '../utils/withoutSoftDeleted';
import { Button } from '../components/ui';
import UserLayout from '../components/layout/UserLayout';

import { useNavigate } from 'react-router-dom';

const SectionTitle = ({ title, actionLabel }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-lg font-semibold text-white">{title}</h2>
    {actionLabel && (
      <button className="text-xs text-red-400 hover:text-red-300">{actionLabel}</button>
    )}
  </div>
);

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const poster = Array.isArray(movie.poster_urls) ? movie.poster_urls[0] : null;
  return (
    <div 
      className="w-40 shrink-0 cursor-pointer group"
      onClick={() => navigate(`/movie/${movie.id}`)}
    >
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-zinc-800 mb-2">
        {poster ? (
          // eslint-disable-next-line jsx-a11y/img-redundant-alt
          <img src={poster} alt={movie.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
            No image
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-white line-clamp-2">{movie.title}</p>
      {movie.release_date && (
        <p className="text-xs text-zinc-400 mt-1">
          {new Date(movie.release_date).toLocaleDateString('vi-VN')}
        </p>
      )}
    </div>
  );
};

const UserHome = () => {
  const navigate = useNavigate();
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [latestTrailers, setLatestTrailers] = useState([]);
  const [actors, setActors] = useState([]); // tạm mock từ dữ liệu phim
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [showingRes, comingRes] = await Promise.all([
          getMoviesPublic({ status: 'SHOWING', pageNo: 1, pageSize: 10 }),
          getMoviesPublic({ status: 'COMING_SOON', pageNo: 1, pageSize: 10 }),
        ]);

        const showingRaw = showingRes?.data?.items || showingRes?.data || [];
        const comingRaw = comingRes?.data?.items || comingRes?.data || [];
        const showing = withoutSoftDeleted(Array.isArray(showingRaw) ? showingRaw : []);
        const coming = withoutSoftDeleted(Array.isArray(comingRaw) ? comingRaw : []);

        setNowShowing(showing);
        setComingSoon(coming);

        // Trailer mới nhất: lấy 6 phim có trailer_url (ưu tiên đang chiếu)
        const allMovies = [...showing, ...coming];
        setLatestTrailers(allMovies.filter((m) => m.trailer_url).slice(0, 6));

        // Danh sách diễn viên: tạm mock từ directors_name/description nếu chưa có trường riêng
        const actorNames = Array.from(
          new Set(
            allMovies
              .flatMap((m) =>
                typeof m.directors_name === 'string' ? m.directors_name.split(',') : []
              )
              .map((name) => name.trim())
              .filter(Boolean),
          ),
        ).slice(0, 8);
        setActors(actorNames);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to load movies for home', e);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const heroMovie = nowShowing[0] || comingSoon[0];

  return (
    <UserLayout>
      {/* Banner */}
      <div className="px-10 pb-10">
        <section className="grid grid-cols-1 lg:grid-cols-[2fr,1.2fr] gap-10 mb-12">
          <div className="relative rounded-3xl overflow-hidden bg-zinc-900 min-h-[260px]">
            {heroMovie && heroMovie.backdrop_url ? (
              <img
                src={heroMovie.backdrop_url}
                alt={heroMovie.title}
                className="absolute inset-0 w-full h-full object-cover opacity-70"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 p-8 flex flex-col justify-center h-full max-w-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-red-400 mb-2">Now showing</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">{heroMovie?.title}</h1>
              {heroMovie?.description && (
                <p className="text-sm text-zinc-200 line-clamp-3 mb-6">{heroMovie.description}</p>
              )}
              <div className="flex gap-3">
                <Button className="bg-red-600 hover:bg-red-500 h-10 px-4 rounded-full text-sm">
                  Đặt vé ngay
                </Button>
                <Button
                  variant="ghost"
                  className="border border-zinc-600 bg-zinc-900/40 hover:bg-zinc-800 h-10 px-4 rounded-full text-sm"
                  onClick={() => heroMovie && navigate(`/movie/${heroMovie.id}`)}
                >
                  Xem chi tiết
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/70 rounded-3xl border border-zinc-800 p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2">Ưu đãi thành viên mới</h2>
              <p className="text-sm text-zinc-300">
                Đăng ký tài khoản ngay hôm nay để nhận ưu đãi giảm giá vé xem phim và tích điểm đổi
                quà hấp dẫn.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                className="bg-purple-600 hover:bg-purple-500 h-10 px-4 rounded-full text-sm"
                onClick={() => navigate('/register')}
              >
                Đăng ký ngay
              </Button>
              <Button
                variant="ghost"
                className="border border-zinc-600 bg-zinc-900/40 hover:bg-zinc-800 h-10 px-4 rounded-full text-sm"
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
        </section>

        {/* Trailer mới nhất */}
        <section className="mb-10">
          <SectionTitle title="Trailer mới nhất" actionLabel="Xem tất cả" />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {latestTrailers.length === 0 ? (
              <p className="text-sm text-zinc-400">Chưa có trailer nào.</p>
            ) : (
              latestTrailers.map((m) => (
                <div
                  key={`trailer-${m.id}`}
                  className="w-56 shrink-0 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 relative"
                >
                  <div className="aspect-video relative">
                    {m.trailer_thumbnail ? (
                      <img
                        src={m.trailer_thumbnail}
                        alt={m.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">
                        Trailer
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center text-black text-xs">
                        ▶
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-white line-clamp-1">{m.title}</p>
                    <p className="text-xs text-zinc-400 mt-1">Trailer chính thức</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Phim đang chiếu */}
        <section className="mb-10">
          <SectionTitle title="Phim đang chiếu" actionLabel="Xem tất cả" />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {loading && nowShowing.length === 0 ? (
              <p className="text-sm text-zinc-400">Đang tải danh sách phim...</p>
            ) : nowShowing.length === 0 ? (
              <p className="text-sm text-zinc-400">Hiện chưa có phim đang chiếu.</p>
            ) : (
              nowShowing.map((m) => <MovieCard key={m.id} movie={m} />)
            )}
          </div>
        </section>

        {/* Phim sắp chiếu */}
        <section className="mb-10">
          <SectionTitle title="Phim sắp chiếu" actionLabel="Xem tất cả" />
          <div className="flex gap-4 overflow-x-auto pb-2">
            {loading && comingSoon.length === 0 ? (
              <p className="text-sm text-zinc-400">Đang tải danh sách phim...</p>
            ) : comingSoon.length === 0 ? (
              <p className="text-sm text-zinc-400">Hiện chưa có phim sắp chiếu.</p>
            ) : (
              comingSoon.map((m) => <MovieCard key={m.id} movie={m} />)
            )}
          </div>
        </section>

        {/* Danh sách các diễn viên */}
        <section className="mb-10">
          <SectionTitle title="Danh sách các diễn viên" />
          <div className="flex gap-6 overflow-x-auto pb-2">
            {actors.length === 0 ? (
              <p className="text-sm text-zinc-400">Danh sách diễn viên sẽ được cập nhật.</p>
            ) : (
              actors.map((name) => (
                <div key={name} className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-semibold">
                    {name.charAt(0)}
                  </div>
                  <p className="text-xs text-zinc-200 text-center max-w-[96px] line-clamp-2">
                    {name}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quảng cáo CineGoPlus */}
        <section className="mt-12 text-center text-sm text-zinc-200 bg-gradient-to-r from-red-700 via-purple-700 to-indigo-700 rounded-3xl py-10 px-6 shadow-[0_0_40px_rgba(239,68,68,0.35)]">
          <p className="text-xs uppercase tracking-[0.25em] mb-2 text-red-200/90">
            CineGoPlus membership
          </p>
          <h2 className="text-2xl font-bold mb-3">Trải nghiệm điện ảnh đỉnh cao</h2>
          <p className="max-w-2xl mx-auto mb-6 text-sm text-zinc-100">
            Tham gia CineGoPlus để nhận ưu đãi độc quyền, tích điểm đổi quà, vé xem phim giá tốt và
            nhiều đặc quyền dành riêng cho thành viên.
          </p>
          <div className="flex justify-center gap-3">
            <Button className="bg-white text-black hover:bg-zinc-100 h-10 px-6 rounded-full text-sm">
              Đăng ký ngay
            </Button>
            <Button
              variant="ghost"
              className="border border-white/70 text-white hover:bg-white/10 h-10 px-6 rounded-full text-sm"
            >
              Tìm hiểu thêm
            </Button>
          </div>
        </section>
      </div>
    </UserLayout>
  );
};

export default UserHome;

