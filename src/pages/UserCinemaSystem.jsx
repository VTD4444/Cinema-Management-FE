import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Search,
  Ticket,
  MonitorPlay,
  Sparkles,
  Wifi,
  Car,
  Armchair,
  Utensils,
} from 'lucide-react';
import UserLayout from '../components/layout/UserLayout';
import { getCinemasPublic } from '../api/cinemaApi';
import { withoutSoftDeleted } from '../utils/withoutSoftDeleted';

const imageFromCinema = (cinema) => {
  if (Array.isArray(cinema?.image_urls) && cinema.image_urls.length > 0) return cinema.image_urls[0];
  return null;
};

const statusLabel = (cinema) => {
  const created = cinema?.created_at ? new Date(cinema.created_at) : null;
  if (created && !Number.isNaN(created.getTime())) {
    const days = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 120) return 'NEW';
  }
  return 'HOT';
};

const UserCinemaSystem = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cinemas, setCinemas] = useState([]);
  const [provinceId, setProvinceId] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);

  useEffect(() => {
    const fetchCinemas = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getCinemasPublic({ pageNo: 1, pageSize: 200 });
        const raw = res?.data?.items || res?.data || [];
        const list = withoutSoftDeleted(Array.isArray(raw) ? raw : []);
        setCinemas(list);
        if (list[0]?.id) setSelectedCinemaId(list[0].id);
      } catch {
        setError('Không thể tải danh sách rạp.');
      } finally {
        setLoading(false);
      }
    };
    fetchCinemas();
  }, []);

  const provinces = useMemo(() => {
    const map = new Map();
    cinemas.forEach((c) => {
      const pid = c?.province_id;
      if (!pid) return;
      const pName = c?.province?.name || `Tỉnh/TP #${pid}`;
      if (!map.has(pid)) map.set(pid, { id: String(pid), name: pName });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [cinemas]);

  const filteredCinemas = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return cinemas.filter((c) => {
      const inProvince = provinceId === 'all' || String(c.province_id) === provinceId;
      if (!inProvince) return false;
      if (!keyword) return true;
      return (
        String(c.name || '').toLowerCase().includes(keyword) ||
        String(c.address || '').toLowerCase().includes(keyword) ||
        String(c?.province?.name || '').toLowerCase().includes(keyword)
      );
    });
  }, [cinemas, provinceId, search]);

  useEffect(() => {
    if (filteredCinemas.length === 0) {
      setSelectedCinemaId(null);
      return;
    }
    const exists = filteredCinemas.some((c) => c.id === selectedCinemaId);
    if (!exists) setSelectedCinemaId(filteredCinemas[0].id);
  }, [filteredCinemas, selectedCinemaId]);

  const selectedCinema = filteredCinemas.find((c) => c.id === selectedCinemaId) || filteredCinemas[0] || null;

  return (
    <UserLayout>
      <div className="min-h-screen bg-[#08090d] pb-14">
        <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100">Hệ Thống Rạp CineGo</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
              Khám phá các cụm rạp trên toàn quốc và chọn rạp phù hợp để trải nghiệm điện ảnh tốt nhất.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <aside className="space-y-4 rounded-2xl border border-zinc-900 bg-zinc-950/80 p-4">
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-zinc-100">1. Chọn Tỉnh / Thành Phố</h2>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm rạp..."
                    className="h-10 w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-3 text-sm text-zinc-200 outline-none focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setProvinceId('all')}
                    className={`rounded-md border px-2 py-2 text-xs ${
                      provinceId === 'all'
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  {provinces.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProvinceId(p.id)}
                      className={`rounded-md border px-2 py-2 text-xs ${
                        provinceId === p.id
                          ? 'border-primary bg-primary/20 text-primary'
                          : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-zinc-100">2. Chọn Rạp Phim</h3>
                <div className="max-h-[440px] space-y-2 overflow-y-auto pr-1">
                  {filteredCinemas.map((c) => {
                    const active = c.id === selectedCinema?.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCinemaId(c.id)}
                        className={`w-full rounded-xl border p-3 text-left transition-colors ${
                          active
                            ? 'border-primary bg-primary/10'
                            : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-700'
                        }`}
                      >
                        <p className={`text-sm font-semibold ${active ? 'text-primary' : 'text-zinc-200'}`}>{c.name}</p>
                        <p className="mt-1 line-clamp-2 text-[11px] text-zinc-500">{c.address}</p>
                      </button>
                    );
                  })}
                  {!loading && filteredCinemas.length === 0 && (
                    <p className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-4 text-center text-xs text-zinc-500">
                      Không tìm thấy rạp phù hợp.
                    </p>
                  )}
                </div>
              </div>
            </aside>

            <section className="rounded-2xl border border-zinc-900 bg-zinc-950/80 p-4 md:p-5">
              {loading ? (
                <p className="py-20 text-center text-sm text-zinc-500">Đang tải dữ liệu rạp...</p>
              ) : error ? (
                <p className="py-20 text-center text-sm text-red-400">{error}</p>
              ) : !selectedCinema ? (
                <p className="py-20 text-center text-sm text-zinc-500">Chưa có dữ liệu rạp.</p>
              ) : (
                <>
                  <div className="relative overflow-hidden rounded-xl border border-zinc-900">
                    {imageFromCinema(selectedCinema) ? (
                      <img
                        src={imageFromCinema(selectedCinema)}
                        alt={selectedCinema.name}
                        className="h-64 w-full object-cover md:h-72"
                      />
                    ) : (
                      <div className="flex h-64 w-full items-center justify-center bg-zinc-900 text-sm text-zinc-500 md:h-72">
                        Chưa có ảnh rạp
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase">
                        <span className="rounded bg-primary px-2 py-1 text-white">{statusLabel(selectedCinema)}</span>
                        <span className="rounded bg-zinc-800 px-2 py-1 text-zinc-300">
                          {selectedCinema?.province?.name || 'Cụm rạp'}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold text-white">{selectedCinema.name}</h2>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-300">
                        <MapPin className="h-3.5 w-3.5" />
                        {selectedCinema.address}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <button
                      type="button"
                      className="h-11 rounded-lg border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-200"
                    >
                      Xem màn hình 2D
                    </button>
                    <button
                      type="button"
                      className="h-11 rounded-lg border border-zinc-800 bg-zinc-900 text-sm font-medium text-zinc-200"
                    >
                      Xem bản đồ
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
                    <div className="rounded-xl border border-zinc-900 bg-zinc-900/60 p-4">
                      <h4 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
                        <span className="h-6 w-1 rounded-full bg-primary" />
                        <span className="text-[24px] leading-none md:text-[24px]">Hình ảnh rạp</span>
                      </h4>
                      {imageFromCinema(selectedCinema) ? (
                        <img
                          src={imageFromCinema(selectedCinema)}
                          alt={`${selectedCinema.name} preview`}
                          className="h-44 w-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center rounded-xl bg-zinc-900 text-xs text-zinc-500">
                          Không có ảnh
                        </div>
                      )}
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="flex h-24 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 text-zinc-500">
                          <Armchair className="h-6 w-6" />
                        </div>
                        <div className="flex h-24 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 text-zinc-500">
                          <Utensils className="h-6 w-6" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="rounded-xl border border-zinc-900 bg-zinc-900/60 p-4">
                      <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
                          <span className="h-6 w-1 rounded-full bg-primary" />
                        <span className="text-[24px] leading-none md:text-[24px]">Liên hệ</span>
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-800/30 px-3 py-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-900/25">
                              <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-zinc-300">
                              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">Tổng đài hỗ trợ</p>
                              <p className="text-[16px] font-bold leading-none text-zinc-100 md:text-[18px]">1900 1234 56</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-800/30 px-3 py-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-900/25">
                              <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <div className="text-zinc-300">
                              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">Số fax</p>
                              <p className="text-[16px] font-bold leading-none text-zinc-100 md:text-[18px]">+84 24 3333 4444</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-zinc-900 bg-zinc-900/60 p-4">
                      <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-zinc-100">
                          <span className="h-6 w-1 rounded-full bg-primary" />
                        <span className="text-[24px] leading-none md:text-[24px]">Tiện ích rạp</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-800/30 px-2.5 py-1.5 font-semibold text-zinc-300">
                            <Ticket className="h-4 w-4 text-primary" />
                            Box-Luxe
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-800/30 px-2.5 py-1.5 font-semibold text-zinc-300">
                            <MonitorPlay className="h-4 w-4 text-indigo-400" />
                            Dolby Atmos
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-800/30 px-2.5 py-1.5 font-semibold text-zinc-300">
                            <Wifi className="h-4 w-4 text-emerald-400" />
                            Free WiFi
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-800/30 px-2.5 py-1.5 font-semibold text-zinc-300">
                            <Car className="h-4 w-4 text-violet-400" />
                            Bãi đỗ xe
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </section>

        <section className="mt-14 border-t border-zinc-900 bg-[#111115] py-14">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">CineGo Membership</p>
            <h2 className="mt-2 text-3xl font-bold text-zinc-100">Trải nghiệm điện ảnh đỉnh cao</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-400">
              Đăng ký thành viên CineGo để nhận ưu đãi đặt vé và thông tin sự kiện mới nhất từ hệ thống rạp.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link to="/register" className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-white">
                Đăng Ký Ngay
              </Link>
              <button
                type="button"
                className="h-10 rounded-lg border border-zinc-700 bg-zinc-900 px-5 text-sm font-semibold text-zinc-200"
              >
                Tìm Hiểu Thêm
              </button>
            </div>
          </div>
        </section>
      </div>
    </UserLayout>
  );
};

export default UserCinemaSystem;
