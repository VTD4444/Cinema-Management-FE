import React, { useMemo } from 'react';
import { Armchair, Crown, Heart } from 'lucide-react';
import { normalizeSeatTypeForUi } from '../../../api/seatApi';

const seatCellClass = (typeUi) => {
  if (typeUi === 'vip') {
    return 'border-purple-500/50 bg-purple-500/15 text-purple-200';
  }
  if (typeUi === 'couple') {
    return 'border-pink-500/50 bg-pink-500/15 text-pink-200 w-[52px] sm:w-14';
  }
  return 'border-zinc-600 bg-zinc-800/80 text-zinc-200';
};

const groupSeatsByRow = (seats) => {
  if (!Array.isArray(seats) || seats.length === 0) return [];
  const map = {};
  seats.forEach((s) => {
    const row = String(s.row_label ?? '').toUpperCase() || '?';
    if (!map[row]) map[row] = [];
    map[row].push(s);
  });
  Object.keys(map).forEach((k) => {
    map[k].sort((a, b) => (Number(a.number) || 0) - (Number(b.number) || 0));
  });
  return Object.keys(map)
    .sort((a, b) => a.localeCompare(b))
    .map((label) => ({ label, seats: map[label] }));
};

/**
 * Sơ đồ ghế admin (read-only): preview khi thêm phòng hoặc dữ liệu thật khi sửa / chọn phòng.
 */
const AdminSeatMapPreview = ({
  seats = [],
  highlightSeatId = null,
  title = 'Sơ đồ ghế',
  emptyHint = 'Chưa có ghế để hiển thị.',
  className = '',
}) => {
  const rows = useMemo(() => groupSeatsByRow(seats), [seats]);

  return (
    <div className={`rounded-xl border border-border/60 bg-zinc-950/50 p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</h4>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Armchair className="h-3 w-3 text-blue-400" /> Thường
          </span>
          <span className="inline-flex items-center gap-1">
            <Crown className="h-3 w-3 text-purple-400" /> VIP
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3 w-3 text-pink-400" /> Sweetbox
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 py-8">{emptyHint}</p>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="mb-4 rounded-lg border border-zinc-800/80 bg-gradient-to-b from-sky-500/10 to-transparent py-2 text-center text-[10px] font-black uppercase tracking-[0.35em] text-zinc-600">
            Màn hình
          </div>
          <div className="flex min-w-max flex-col items-center gap-2">
            {rows.map(({ label, seats: rowSeats }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-5 text-center text-[10px] font-bold text-zinc-600">{label}</span>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {rowSeats.map((s) => {
                    const typeUi = normalizeSeatTypeForUi(s.type);
                    const isCouple = typeUi === 'couple';
                    const isHi = highlightSeatId != null && Number(s.id) === Number(highlightSeatId);
                    return (
                      <div
                        key={`${label}-${s.number}-${s.id ?? ''}`}
                        title={`${label}${String(s.number ?? '').padStart(2, '0')} · ${typeUi}`}
                        className={[
                          'flex h-8 items-center justify-center rounded border text-[10px] font-bold sm:h-9',
                          isCouple ? 'min-w-[52px] px-1 sm:min-w-14' : 'w-8 sm:w-9',
                          seatCellClass(typeUi),
                          isHi ? 'ring-2 ring-primary ring-offset-2 ring-offset-zinc-950' : '',
                        ].join(' ')}
                      >
                        {s.number}
                      </div>
                    );
                  })}
                </div>
                <span className="w-5 text-center text-[10px] font-bold text-zinc-600">{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[10px] text-zinc-600">
            {seats.length} ghế
            {highlightSeatId != null ? ' · ghế đang sửa được viền sáng' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminSeatMapPreview;
