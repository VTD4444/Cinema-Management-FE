import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Armchair, Crown, Eraser, Heart } from 'lucide-react';
import { Button } from '../../ui';
import {
  SEAT_CELL_EMPTY,
  countSeatMatrix,
  fillSeatMatrix,
  rowLabelFromIndex,
} from '../../../utils/roomSeatGrid';

const BRUSH_OPTIONS = [
  {
    id: 'standard',
    label: 'Thường',
    icon: Armchair,
    activeClass: 'border-blue-500/60 bg-blue-500/20 text-blue-200',
    cellClass: 'border-zinc-600 bg-zinc-800/80 text-zinc-200',
  },
  {
    id: 'vip',
    label: 'VIP',
    icon: Crown,
    activeClass: 'border-purple-500/60 bg-purple-500/20 text-purple-200',
    cellClass: 'border-purple-500/50 bg-purple-500/15 text-purple-200',
  },
  {
    id: 'couple',
    label: 'Sweetbox',
    icon: Heart,
    activeClass: 'border-pink-500/60 bg-pink-500/20 text-pink-200',
    cellClass: 'border-pink-500/50 bg-pink-500/15 text-pink-200',
  },
  {
    id: 'empty',
    label: 'Xóa ô',
    icon: Eraser,
    activeClass: 'border-zinc-500/60 bg-zinc-700/40 text-zinc-300',
    cellClass: 'border-zinc-800/80 bg-zinc-950/40 text-zinc-600',
  },
];

const cellClassForType = (type) => {
  if (type == null) return BRUSH_OPTIONS[3].cellClass;
  return BRUSH_OPTIONS.find((b) => b.id === type)?.cellClass ?? BRUSH_OPTIONS[0].cellClass;
};

const AdminSeatMapEditor = ({
  matrix = [],
  onMatrixChange,
  rowStart = 'A',
  numRows = 0,
  seatsPerRow = 0,
  disabled = false,
  countLabel = 'ghế sẽ được tạo',
}) => {
  const [brush, setBrush] = useState('standard');
  const [isPainting, setIsPainting] = useState(false);
  const paintRef = useRef(false);

  const nr = parseInt(numRows, 10) || 0;
  const sp = parseInt(seatsPerRow, 10) || 0;
  const seatCount = useMemo(() => countSeatMatrix(matrix), [matrix]);

  const applyBrush = useCallback(
    (rowIndex, colIndex) => {
      if (disabled || !Array.isArray(matrix) || !matrix[rowIndex]) return;
      const value = brush === 'empty' ? SEAT_CELL_EMPTY : brush;
      if (matrix[rowIndex][colIndex] === value) return;

      const next = matrix.map((row, r) =>
        r === rowIndex
          ? row.map((cell, c) => (c === colIndex ? value : cell))
          : [...row],
      );
      onMatrixChange?.(next);
    },
    [brush, disabled, matrix, onMatrixChange],
  );

  const handlePointerDown = (rowIndex, colIndex) => {
    if (disabled) return;
    paintRef.current = true;
    setIsPainting(true);
    applyBrush(rowIndex, colIndex);
  };

  useEffect(() => {
    const stopPaint = () => {
      paintRef.current = false;
      setIsPainting(false);
    };
    window.addEventListener('mouseup', stopPaint);
    return () => window.removeEventListener('mouseup', stopPaint);
  }, []);

  const handleFillAll = (type) => {
    if (disabled || nr < 1 || sp < 1) return;
    onMatrixChange?.(fillSeatMatrix(matrix, type === 'empty' ? SEAT_CELL_EMPTY : type));
  };

  if (nr < 1 || sp < 1) {
    return (
      <div className="rounded-xl border border-border/60 bg-zinc-950/50 p-6 text-center text-sm text-zinc-500">
        Nhập số hàng và ghế mỗi hàng để bắt đầu vẽ sơ đồ.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/60 bg-zinc-950/50 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Vẽ sơ đồ ghế</h4>
          <p className="text-xs text-zinc-500 mt-1">
            Chọn loại ghế bên dưới, click hoặc kéo trên ô để tô. VIP có thể nằm giữa ghế thường.
          </p>
        </div>
        <span className="text-xs text-zinc-400">{seatCount} {countLabel}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {BRUSH_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = brush === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => setBrush(opt.id)}
              className={[
                'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                active ? opt.activeClass : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600',
              ].join(' ')}
            >
              <Icon className="h-3.5 w-3.5" />
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => handleFillAll('standard')}
        >
          Điền tất cả Thường
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => handleFillAll('empty')}
        >
          Xóa toàn bộ
        </Button>
      </div>

      <div className="overflow-x-auto pb-1 select-none">
        <div className="mb-4 rounded-lg border border-zinc-800/80 bg-gradient-to-b from-sky-500/10 to-transparent py-2 text-center text-[10px] font-black uppercase tracking-[0.35em] text-zinc-600">
          Màn hình
        </div>
        <div className="flex min-w-max flex-col items-center gap-1.5">
          {matrix.map((row, rowIndex) => {
            const rowLabel = rowLabelFromIndex(rowStart, rowIndex) || '?';
            return (
              <div key={rowLabel} className="flex items-center gap-2">
                <span className="w-5 text-center text-[10px] font-bold text-zinc-600">{rowLabel}</span>
                <div className="flex flex-wrap items-center justify-center gap-1">
                  {row.map((cellType, colIndex) => {
                    const isCouple = cellType === 'couple';
                    const isEmpty = cellType == null;
                    return (
                      <button
                        key={`${rowLabel}-${colIndex}`}
                        type="button"
                        disabled={disabled}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handlePointerDown(rowIndex, colIndex);
                        }}
                        onMouseEnter={() => {
                          if (paintRef.current) applyBrush(rowIndex, colIndex);
                        }}
                        title={
                          isEmpty
                            ? `${rowLabel}${colIndex + 1} · trống`
                            : `${rowLabel}${colIndex + 1} · ${cellType}`
                        }
                        className={[
                          'flex h-8 items-center justify-center rounded border text-[10px] font-bold transition-all sm:h-9',
                          isCouple ? 'min-w-[52px] px-1 sm:min-w-14' : 'w-8 sm:w-9',
                          cellClassForType(cellType),
                          isPainting ? 'cursor-crosshair' : 'cursor-pointer',
                          'hover:ring-1 hover:ring-white/20',
                        ].join(' ')}
                      >
                        {isEmpty ? '' : colIndex + 1}
                      </button>
                    );
                  })}
                </div>
                <span className="w-5 text-center text-[10px] font-bold text-zinc-600">{rowLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminSeatMapEditor;
