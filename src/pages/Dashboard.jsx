import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Ticket, Popcorn, Users, TrendingDown, TrendingUp } from 'lucide-react';
import {
  getDashboardData,
  getDashboardLatestBookings,
  getDashboardMonthlyRevenue,
  getDashboardSummary,
  getDashboardTopCinemas,
  getDashboardTopMovies,
} from '../api/dashboardApi';

const formatCompactCurrency = (value = 0) => {
  const num = Number(value) || 0;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} Tỷ`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} Tr`;
  return `${num.toLocaleString('vi-VN')} đ`;
};

const formatInteger = (value = 0) => (Number(value) || 0).toLocaleString('vi-VN');

const parsePercent = (value) => {
  const raw = Number.parseFloat(String(value || '0').replace('%', '').trim());
  return Number.isFinite(raw) ? raw : 0;
};

const formatPercent = (value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

const getApiData = (response) => response?.data || null;

const buildDashboardFromParts = ({ summary, monthly, latestBookings, topMovies, topCinemas }) => ({
  summary: summary || {},
  monthlyChart: {
    months: monthly?.months || [],
    revenue: monthly?.revenue || [],
  },
  latestBookings: latestBookings || [],
  topMovies: topMovies || [],
  topCinemas: topCinemas || [],
});

const Dashboard = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // Prefer the bundled endpoint first (/dashboard)
        const dashboardRes = await getDashboardData({ year });
        if (!active) return;
        const dashboardBundle = getApiData(dashboardRes);
        setDashboardData(dashboardBundle || null);

        // Summary is optional; do not break whole page if this endpoint fails
        try {
          const summaryRes = await getDashboardSummary({ year });
          if (!active) return;
          setSummaryData(getApiData(summaryRes) || null);
        } catch {
          if (!active) return;
          setSummaryData(null);
        }
      } catch {
        // Fallback to separate dashboard APIs if bundled endpoint fails
        try {
          const [summaryResult, monthlyResult, latestResult, topMoviesResult, topCinemasResult] = await Promise.allSettled([
            getDashboardSummary({ year }),
            getDashboardMonthlyRevenue({ year }),
            getDashboardLatestBookings({ limit: 10 }),
            getDashboardTopMovies({ year, limit: 5 }),
            getDashboardTopCinemas({ year, limit: 5 }),
          ]);
          if (!active) return;

          const summary = summaryResult.status === 'fulfilled' ? getApiData(summaryResult.value) : null;
          const monthly = monthlyResult.status === 'fulfilled' ? getApiData(monthlyResult.value) : null;
          const latestBookings = latestResult.status === 'fulfilled' ? getApiData(latestResult.value) : null;
          const topMovies = topMoviesResult.status === 'fulfilled' ? getApiData(topMoviesResult.value) : null;
          const topCinemas = topCinemasResult.status === 'fulfilled' ? getApiData(topCinemasResult.value) : null;

          const fallbackDashboard = buildDashboardFromParts({
            summary,
            monthly,
            latestBookings,
            topMovies,
            topCinemas,
          });

          const hasAnyData =
            Object.keys(fallbackDashboard.summary || {}).length > 0 ||
            (fallbackDashboard.monthlyChart?.revenue || []).length > 0 ||
            (fallbackDashboard.latestBookings || []).length > 0 ||
            (fallbackDashboard.topMovies || []).length > 0 ||
            (fallbackDashboard.topCinemas || []).length > 0;

          if (!hasAnyData) {
            setError('Không thể tải dữ liệu dashboard.');
            setDashboardData(null);
            setSummaryData(null);
            return;
          }

          setDashboardData(fallbackDashboard);
          setSummaryData(summary || null);
        } catch {
          if (!active) return;
          setError('Không thể tải dữ liệu dashboard.');
          setDashboardData(null);
          setSummaryData(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [year]);

  const kpis = useMemo(() => {
    const summary = dashboardData?.summary || {};
    const changes = summaryData?.changes || {};
    const ticketChange = parsePercent(changes.ticketRevenue);
    const foodChange = parsePercent(changes.foodRevenue);
    const totalRevenue = Number(summary.totalRevenue) || 0;
    const ticketRevenue = Number(summary.ticketRevenue) || 0;
    const foodRevenue = Number(summary.foodRevenue) || 0;

    const prevTicketRevenue = ticketChange !== -100 ? ticketRevenue / (1 + ticketChange / 100) : 0;
    const prevFoodRevenue = foodChange !== -100 ? foodRevenue / (1 + foodChange / 100) : 0;
    const prevTotalRevenue = prevTicketRevenue + prevFoodRevenue;
    const totalRevenueChange = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0;

    return [
      {
        label: 'Doanh thu tổng',
        value: formatCompactCurrency(totalRevenue),
        change: totalRevenueChange,
        icon: Calendar,
      },
      {
        label: 'Vé bán ra',
        value: formatInteger(summary.totalTicketsSold),
        change: parsePercent(changes.totalTicketsSold),
        icon: Ticket,
      },
      {
        label: 'Doanh thu F&B',
        value: formatCompactCurrency(summary.foodRevenue),
        change: parsePercent(changes.foodRevenue),
        icon: Popcorn,
      },
      {
        label: 'Người dùng mới',
        value: formatInteger(summary.newUsers),
        change: parsePercent(changes.newUsers),
        icon: Users,
      },
    ];
  }, [dashboardData, summaryData]);

  const monthlyChart = dashboardData?.monthlyChart || { months: [], revenue: [] };
  const bookings = dashboardData?.latestBookings || [];
  const topMovies = dashboardData?.topMovies || [];
  const topCinemas = dashboardData?.topCinemas || [];
  const maxRevenue = Math.max(...(monthlyChart.revenue?.length ? monthlyChart.revenue : [0]));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-white">Tổng quan</h2>
        <label className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-transparent text-xs text-white outline-none"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((item) => (
              <option key={item} value={item} className="bg-[#101010]">
                Năm {item}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={`kpi-skeleton-${idx}`} className="animate-pulse rounded-xl border border-border bg-surface p-5">
                <div className="h-3 w-28 rounded bg-zinc-800" />
                <div className="mt-4 h-8 w-24 rounded bg-zinc-800" />
              </div>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2 animate-pulse rounded-xl border border-border bg-surface p-5">
              <div className="h-4 w-40 rounded bg-zinc-800" />
              <div className="mt-5 h-52 rounded bg-zinc-900" />
            </div>
            <div className="animate-pulse rounded-xl border border-border bg-surface p-5">
              <div className="h-4 w-32 rounded bg-zinc-800" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={`side-skeleton-${idx}`} className="h-12 rounded bg-zinc-900" />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-10 text-center text-sm text-red-400">
          {error}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item) => {
              const Icon = item.icon;
              const isPositive = item.change >= 0;
              return (
                <div key={item.label} className="rounded-xl border border-border bg-surface p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isPositive ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {formatPercent(item.change)}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-3xl font-black tracking-tight text-white">{item.value}</p>
                    <Icon className="h-4 w-4 text-zinc-500" />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-xl border border-border bg-surface p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-white">Biểu đồ doanh thu</h3>
                  <p className="text-xs text-muted-foreground">Xu hướng theo tháng</p>
                </div>
                <span className="rounded-full bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300">Năm {year}</span>
              </div>
              <div className="h-56 rounded-lg bg-[#0f0f0f] p-3">
                <div className="flex h-full items-end gap-2">
                  {(monthlyChart.months || []).map((month, idx) => {
                    const value = Number(monthlyChart.revenue?.[idx]) || 0;
                    const ratio = maxRevenue > 0 ? Math.max(6, Math.round((value / maxRevenue) * 100)) : 6;
                    return (
                      <div key={month} className="flex flex-1 flex-col items-center gap-2">
                        <div className="flex h-full w-full items-end">
                          <div className="w-full rounded-t bg-primary/90 transition-all" style={{ height: `${ratio}%` }} />
                        </div>
                        <span className="text-[10px] text-zinc-500">{month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Top Phim Doanh Thu</h3>
              </div>
              <div className="space-y-3">
                {topMovies.slice(0, 5).map((movie) => (
                  <div key={movie.id || movie.rank} className="flex items-center gap-3 rounded-lg bg-[#101010] p-2.5">
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                      {movie.poster ? (
                        <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-500">
                          N/A
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-zinc-100">{movie.title}</p>
                      <p className="text-[11px] text-zinc-500">{formatInteger(movie.ticketsSold)} vé</p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-200">{formatCompactCurrency(movie.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Vé được đặt mới nhất</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-zinc-500">
                      <th className="py-2 pr-2">Mã vé</th>
                      <th className="py-2 pr-2">Khách hàng</th>
                      <th className="py-2 pr-2">Phim</th>
                      <th className="py-2 pr-2">Thời gian</th>
                      <th className="py-2 text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={`${booking.ticketId}-${booking.bookingCode}`} className="border-b border-zinc-900/70">
                        <td className="py-3 pr-2 text-zinc-400">{booking.ticketId}</td>
                        <td className="py-3 pr-2 text-zinc-100">{booking.customerName}</td>
                        <td className="py-3 pr-2 text-zinc-300">{booking.movieTitle}</td>
                        <td className="py-3 pr-2 text-zinc-400">{booking.time}</td>
                        <td className="py-3 text-right">
                          <span className="rounded-full bg-green-500/15 px-2 py-1 text-xs font-semibold text-green-400">
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Top Rạp Đặt Nhiều</h3>
              <div className="space-y-3">
                {topCinemas.slice(0, 5).map((cinema) => (
                  <div key={cinema.id || cinema.rank} className="flex items-center gap-3 rounded-lg bg-[#101010] p-2.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-300">
                      {cinema.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-zinc-100">{cinema.name}</p>
                      <p className="text-[11px] text-zinc-500">{formatCompactCurrency(cinema.totalRevenue || 0)}</p>
                    </div>
                    <p className="text-sm font-semibold text-zinc-200">{formatInteger(cinema.totalBookings || cinema.bookings || 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
