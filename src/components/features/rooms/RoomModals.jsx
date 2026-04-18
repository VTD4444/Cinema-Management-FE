import React, { useState, useEffect, useMemo } from 'react';
import { Armchair, Crown, Heart } from 'lucide-react';
import { Modal, Input, Button, Select } from '../../ui';
import { createRoom, updateRoom, deleteRoom, getRoomById } from '../../../api/roomApi';
import { createSeat, getSeats } from '../../../api/seatApi';
import { handleApiError } from '../../../utils/errorHandling';
import { withoutSoftDeleted } from '../../../utils/withoutSoftDeleted';
import {
  emptySeatGrid,
  validateSeatGrid,
  buildSeatPayloads,
  computePreviewSeatsFromGrids,
} from '../../../utils/roomSeatGrid';
import AdminSeatMapPreview from './AdminSeatMapPreview';

const RoomAddSeatBlock = ({ title, icon, accentClass, borderClass, grid, setGrid, stackHint, onClearError }) => {
  const IconComponent = icon;
  return (
    <div className={`rounded-xl border ${borderClass} bg-zinc-900/40 p-4 space-y-3`}>
    <div className={`flex items-center gap-2 text-sm font-semibold ${accentClass}`}>
      <IconComponent className="h-4 w-4 shrink-0" />
      {title}
    </div>
    <p className="text-xs text-zinc-500 leading-relaxed">
      Để trống <span className="text-zinc-400">số hàng</span> và <span className="text-zinc-400">ghế/hàng</span> nếu không tạo loại này.
    </p>
    <div className="grid grid-cols-2 gap-2">
      <Input
        label="Số hàng"
        type="number"
        min="1"
        max="26"
        placeholder="—"
        value={grid.num_rows}
        onChange={(e) => { setGrid((p) => ({ ...p, num_rows: e.target.value })); onClearError?.(); }}
        className="bg-zinc-900/50 border-zinc-800 rounded-lg h-10 text-sm"
      />
      <Input
        label="Ghế/hàng"
        type="number"
        min="1"
        max="99"
        placeholder="—"
        value={grid.seats_per_row}
        onChange={(e) => { setGrid((p) => ({ ...p, seats_per_row: e.target.value })); onClearError?.(); }}
        className="bg-zinc-900/50 border-zinc-800 rounded-lg h-10 text-sm"
      />
    </div>
    {stackHint && (
      <p className="text-xs text-zinc-500">
        ≈ <span className="text-zinc-300 font-medium">{stackHint.seats}</span> ghế · hàng{' '}
        <span className="text-zinc-300 font-medium">{stackHint.rowsText}</span>
      </p>
    )}
    </div>
  );
};

const RoomModals = ({ state, onClose, onSuccess, cinemaId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    room_type: 'standard',
    seat_count: '',
    format: '2d',
    status: 'active',
  });
  const [sharedSeatRowStart, setSharedSeatRowStart] = useState('A');
  const [seatGridStandard, setSeatGridStandard] = useState(() => emptySeatGrid());
  const [seatGridVip, setSeatGridVip] = useState(() => emptySeatGrid());
  const [seatGridCouple, setSeatGridCouple] = useState(() => emptySeatGrid());
  const [roomSeats, setRoomSeats] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const isDelete = state.type === 'delete';
  const isAddOrEdit = state.type === 'add' || state.type === 'edit';
  const data = state.data;

  const previewSeats = useMemo(
    () => computePreviewSeatsFromGrids(sharedSeatRowStart, seatGridStandard, seatGridVip, seatGridCouple),
    [sharedSeatRowStart, seatGridStandard, seatGridVip, seatGridCouple],
  );

  useEffect(() => {
    if (state.type === 'edit' && data) {
      setFormData({
        name: data.name ?? '',
        room_type: data.room_type ?? 'standard',
        seat_count: data.seat_count ?? '',
        format: data.format ?? '2d',
        status: data.status ?? 'active',
      });
      setRoomSeats([]);
    } else if (state.type === 'add') {
      setFormData({
        name: '',
        room_type: 'standard',
        seat_count: '',
        format: '2d',
        status: 'active',
      });
      setSharedSeatRowStart('A');
      setSeatGridStandard(emptySeatGrid());
      setSeatGridVip(emptySeatGrid());
      setSeatGridCouple(emptySeatGrid());
      setRoomSeats([]);
    }
    setError('');
  }, [state.type, data]);

  useEffect(() => {
    if (state.type !== 'edit' || !data?.id) {
      setDetailLoading(false);
      return undefined;
    }
    let cancelled = false;
    setDetailLoading(true);
    (async () => {
      try {
        const [roomRes, seatRes] = await Promise.all([
          getRoomById(data.id),
          getSeats({ room_id: data.id }),
        ]);
        if (cancelled) return;
        const r = roomRes?.data;
        const raw = seatRes?.data;
        const list = Array.isArray(raw) ? raw : [];
        const cleaned = withoutSoftDeleted(list);
        setFormData((prev) => ({
          ...prev,
          name: r?.name ?? prev.name ?? data.name ?? '',
          room_type: r?.room_type ?? data.room_type ?? prev.room_type ?? 'standard',
          seat_count: r?.seat_count ?? data.seat_count ?? (cleaned.length || prev.seat_count) ?? '',
          format: r?.format ?? data.format ?? prev.format ?? '2d',
          status: r?.status ?? data.status ?? prev.status ?? 'active',
        }));
        setRoomSeats(cleaned);
      } catch {
        if (!cancelled) setRoomSeats([]);
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.type, data?.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (state.type === 'add') {
      if (!cinemaId) {
        setError('Chưa chọn rạp.');
        setLoading(false);
        return;
      }
      const name = formData.name.trim();
      if (!name) {
        setError('Nhập tên phòng.');
        setLoading(false);
        return;
      }

      const grids = [
        { key: 'standard', label: 'Ghế thường', grid: seatGridStandard, type: 'standard' },
        { key: 'vip', label: 'Ghế VIP', grid: seatGridVip, type: 'vip' },
        { key: 'couple', label: 'Sweetbox', grid: seatGridCouple, type: 'couple' },
      ];
      let gridError = '';
      for (const { label, grid } of grids) {
        const v = validateSeatGrid(grid, label);
        if (v.error) {
          gridError = v.error;
          break;
        }
      }
      if (gridError) {
        setError(gridError);
        setLoading(false);
        return;
      }

      const anySeatBlock = grids.some(({ grid }) => !validateSeatGrid(grid, '').skip);
      if (anySeatBlock) {
        const letter = (sharedSeatRowStart || 'A').trim();
        if (!/^[A-Za-z]$/.test(letter)) {
          setError('Dãy bắt đầu ghế: một chữ cái A–Z.');
          setLoading(false);
          return;
        }
        let totalRows = 0;
        for (const { grid } of grids) {
          const v = validateSeatGrid(grid, '');
          if (!v.skip) totalRows += v.nr;
        }
        const base = letter.toUpperCase().charCodeAt(0);
        if (base + totalRows - 1 > 90) {
          setError('Tổng số hàng (Thường + VIP + Sweetbox) vượt quá Z. Giảm số hàng hoặc đổi dãy đầu.');
          setLoading(false);
          return;
        }
      }

      createRoom({ cinema_id: cinemaId, name })
        .then(async (res) => {
          if (res?.success === false) {
            setError(res?.message || 'Không thể tạo phòng.');
            return;
          }
          const roomId = res?.data?.id;
          if (!roomId) {
            setError('Phòng đã tạo nhưng không nhận được ID.');
            onSuccess?.();
            onClose();
            return;
          }

          const payloads = [];
          let rowCursor = (sharedSeatRowStart || 'A').toUpperCase().charCodeAt(0);
          for (const { grid, type } of grids) {
            const v = validateSeatGrid(grid, '');
            if (v.skip) continue;
            const rowStartChar = String.fromCharCode(rowCursor);
            payloads.push(...buildSeatPayloads(roomId, type, v.nr, v.sp, rowStartChar));
            rowCursor += v.nr;
          }

          if (payloads.length === 0) {
            onSuccess?.();
            onClose();
            return;
          }

          const results = await Promise.allSettled(payloads.map((p) => createSeat(p)));
          const failed = results.filter((x) => x.status === 'rejected').length;
          if (failed > 0) {
            setError(
              `Phòng đã tạo. ${payloads.length - failed}/${payloads.length} ghế tạo thành công. Một số ghế có thể trùng hoặc lỗi mạng — kiểm tra và thêm tay nếu cần.`
            );
            onSuccess?.();
            return;
          }
          onSuccess?.();
          onClose();
        })
        .catch((err) => setError(handleApiError(err, 'Không thể lưu phòng chiếu.')))
        .finally(() => setLoading(false));
      return;
    }

    const payload = { name: formData.name.trim() };
    updateRoom(data.id, payload)
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Có lỗi xảy ra');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể lưu phòng chiếu.')))
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    setError('');
    setLoading(true);
    deleteRoom(data.id)
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Không thể xóa.');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể xóa phòng.')))
      .finally(() => setLoading(false));
  };

  if (!state.type) return null;

  if (isDelete) {
    return (
      <Modal isOpen title="Xác nhận xóa" onClose={onClose} className="max-w-md bg-[#161616] border-border/50">
        <div className="space-y-6">
          <p className="text-sm text-zinc-400">Bạn có chắc chắn muốn xóa &quot;{data?.name}&quot;?</p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1 rounded-full" disabled={loading}>Hủy</Button>
            <Button variant="danger" className="flex-1 rounded-full" onClick={handleDelete} disabled={loading} isLoading={loading}>Xác nhận xóa</Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (isAddOrEdit) {
    const isAdd = state.type === 'add';

    const baseRowCode = (sharedSeatRowStart || 'A').toUpperCase().charCodeAt(0);
    let stackAcc = 0;
    const stackPreviews = isAdd
      ? [seatGridStandard, seatGridVip, seatGridCouple].map((grid) => {
          const v = validateSeatGrid(grid, '');
          if (v.skip || v.error || !v.nr) return null;
          const fromC = baseRowCode + stackAcc;
          const toC = baseRowCode + stackAcc + v.nr - 1;
          stackAcc += v.nr;
          if (fromC > 90) return null;
          const from = String.fromCharCode(Math.min(fromC, 90));
          const to = String.fromCharCode(Math.min(toC, 90));
          return {
            seats: v.nr * v.sp,
            rowsText: v.nr > 1 ? `${from} → ${to}` : from,
          };
        })
      : [null, null, null];

    return (
      <Modal
        isOpen
        onClose={onClose}
        title={isAdd ? 'Thêm phòng & ghế' : 'Chỉnh sửa phòng chiếu'}
        className="max-w-4xl bg-[#161616] border-border/50 max-h-[92vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <Input
            label="Tên phòng"
            placeholder="VD: Phòng 01"
            value={formData.name}
            onChange={(e) => { setFormData((p) => ({ ...p, name: e.target.value })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
            required
          />

          {isAdd && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500 leading-relaxed">
                Ba khối <strong className="text-zinc-400">xếp hàng nối tiếp</strong> từ một dãy đầu: ví dụ Thường 5 hàng (A–E) rồi VIP 2 hàng (F–G),
                rồi Sweetbox — tránh trùng mã ghế (cùng dãy + số thứ tự).
              </p>
              <Input
                label="Dãy bắt đầu (hàng đầu tiên của ghế thường)"
                placeholder="A"
                value={sharedSeatRowStart}
                onChange={(e) => {
                  const v = e.target.value.toUpperCase().slice(0, 1);
                  setSharedSeatRowStart(v || 'A');
                  setError('');
                }}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11 uppercase max-w-[200px]"
                maxLength={1}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RoomAddSeatBlock
                  title="Ghế thường"
                  icon={Armchair}
                  accentClass="text-blue-300"
                  borderClass="border-blue-500/25"
                  grid={seatGridStandard}
                  setGrid={setSeatGridStandard}
                  stackHint={stackPreviews[0]}
                  onClearError={() => setError('')}
                />
                <RoomAddSeatBlock
                  title="Ghế VIP"
                  icon={Crown}
                  accentClass="text-amber-300"
                  borderClass="border-amber-500/25"
                  grid={seatGridVip}
                  setGrid={setSeatGridVip}
                  stackHint={stackPreviews[1]}
                  onClearError={() => setError('')}
                />
                <RoomAddSeatBlock
                  title="Sweetbox"
                  icon={Heart}
                  accentClass="text-pink-300"
                  borderClass="border-pink-500/25"
                  grid={seatGridCouple}
                  setGrid={setSeatGridCouple}
                  stackHint={stackPreviews[2]}
                  onClearError={() => setError('')}
                />
              </div>
              <AdminSeatMapPreview
                seats={previewSeats}
                title="Xem trước sơ đồ ghế"
                emptyHint="Nhập số hàng và ghế/hàng ở ít nhất một khối để xem trước sơ đồ."
              />
            </div>
          )}

          {!isAdd && (
            <>
              <p className="text-xs text-zinc-500">
                API phòng hiện chỉ lưu <strong className="text-zinc-400">tên phòng</strong>. Thông tin loại / định dạng (nếu có) chỉ để tham khảo từ danh sách.
              </p>
              {(formData.room_type || formData.format || formData.status || formData.seat_count !== '') && (
                <div className="flex flex-wrap gap-2 rounded-lg border border-border/50 bg-zinc-900/40 px-3 py-2 text-xs text-zinc-400">
                  {formData.room_type && <span>Loại: <span className="text-zinc-200">{formData.room_type}</span></span>}
                  {formData.format && <span>· Định dạng: <span className="text-zinc-200">{formData.format}</span></span>}
                  {formData.status && <span>· Trạng thái: <span className="text-zinc-200">{formData.status}</span></span>}
                  {formData.seat_count !== '' && formData.seat_count != null && (
                    <span>· Số ghế (ước tính): <span className="text-zinc-200">{formData.seat_count}</span></span>
                  )}
                </div>
              )}
              <div className="relative pt-2">
                {detailLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-zinc-950/70 text-sm text-zinc-400">
                    Đang tải chi tiết phòng &amp; sơ đồ…
                  </div>
                )}
                <AdminSeatMapPreview
                  seats={roomSeats}
                  title="Sơ đồ ghế hiện tại"
                  emptyHint="Phòng chưa có ghế trong hệ thống. Thêm ghế tại mục Quản lý Ghế ngồi."
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full px-6 h-10">Hủy</Button>
            <Button type="submit" className="rounded-full px-6 h-10" isLoading={loading}>
              {isAdd ? 'Tạo phòng' : 'Lưu'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default RoomModals;
