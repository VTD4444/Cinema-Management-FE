import React, { useState, useEffect } from 'react';
import { Armchair, Crown, Heart } from 'lucide-react';
import { Modal, Input, Button, Select } from '../../ui';
import { createRoom, updateRoom, deleteRoom } from '../../../api/roomApi';
import { createSeat } from '../../../api/seatApi';
import { handleApiError } from '../../../utils/errorHandling';

const ROOM_TYPES = [
  { value: 'standard', label: 'Standard' },
  { value: 'gold_class', label: 'Gold Class' },
  { value: 'couple', label: 'Couple' },
];

const FORMATS = [
  { value: 'imax', label: 'IMAX' },
  { value: '2d', label: '2D' },
  { value: '3d', label: '3D' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'pending', label: 'Chờ duyệt' },
];

const emptySeatGrid = () => ({
  num_rows: '',
  seats_per_row: '',
});

const rowLabelFromIndex = (startLetter, index) => {
  const start = startLetter.toUpperCase().charCodeAt(0);
  const code = start + index;
  if (code < 65 || code > 90) return null;
  return String.fromCharCode(code);
};

const validateSeatGrid = (g, label) => {
  const nrRaw = String(g.num_rows ?? '').trim();
  const spRaw = String(g.seats_per_row ?? '').trim();
  if (!nrRaw && !spRaw) return { error: null, skip: true };
  if (!nrRaw || !spRaw) return { error: `${label}: nhập đủ số hàng và ghế mỗi hàng, hoặc để trống cả hai.`, skip: false };
  const nr = parseInt(nrRaw, 10);
  const sp = parseInt(spRaw, 10);
  if (Number.isNaN(nr) || nr < 1 || nr > 26) return { error: `${label}: số hàng 1–26.`, skip: false };
  if (Number.isNaN(sp) || sp < 1 || sp > 99) return { error: `${label}: ghế mỗi hàng 1–99.`, skip: false };
  return { error: null, skip: false, nr, sp };
};

const buildSeatPayloads = (roomId, seatType, nr, sp, rowStart) => {
  const payloads = [];
  for (let r = 0; r < nr; r += 1) {
    const row = rowLabelFromIndex(rowStart, r);
    if (!row) break;
    for (let n = 1; n <= sp; n += 1) {
      payloads.push({
        room_id: Number(roomId),
        row_label: row,
        number: n,
        type: seatType,
      });
    }
  }
  return payloads;
};

const RoomModals = ({ state, onClose, onSuccess, cinemaId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
  });
  const [sharedSeatRowStart, setSharedSeatRowStart] = useState('A');
  const [seatGridStandard, setSeatGridStandard] = useState(emptySeatGrid);
  const [seatGridVip, setSeatGridVip] = useState(emptySeatGrid);
  const [seatGridCouple, setSeatGridCouple] = useState(emptySeatGrid);

  const isDelete = state.type === 'delete';
  const isAddOrEdit = state.type === 'add' || state.type === 'edit';
  const data = state.data;

  useEffect(() => {
    if (state.type === 'edit' && data) {
      setFormData({
        name: data.name ?? '',
      });
    } else if (state.type === 'add') {
      setFormData({
        name: '',
      });
      setSharedSeatRowStart('A');
      setSeatGridStandard(emptySeatGrid());
      setSeatGridVip(emptySeatGrid());
      setSeatGridCouple(emptySeatGrid());
    }
    setError('');
  }, [state.type, state.data]);

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

    const payload = {
      name: formData.name.trim(),
      room_type: formData.room_type,
      seat_count: formData.seat_count ? parseInt(formData.seat_count, 10) : 0,
      format: formData.format,
      status: formData.status,
    };
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

    const RoomAddSeatBlock = ({ title, icon: Icon, accentClass, borderClass, grid, setGrid, stackHint }) => (
      <div className={`rounded-xl border ${borderClass} bg-zinc-900/40 p-4 space-y-3`}>
        <div className={`flex items-center gap-2 text-sm font-semibold ${accentClass}`}>
          <Icon className="h-4 w-4 shrink-0" />
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
            onChange={(e) => { setGrid((p) => ({ ...p, num_rows: e.target.value })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-lg h-10 text-sm"
          />
          <Input
            label="Ghế/hàng"
            type="number"
            min="1"
            max="99"
            placeholder="—"
            value={grid.seats_per_row}
            onChange={(e) => { setGrid((p) => ({ ...p, seats_per_row: e.target.value })); setError(''); }}
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

    return (
      <Modal
        isOpen
        onClose={onClose}
        title={isAdd ? 'Thêm phòng & ghế' : 'Chỉnh sửa phòng chiếu'}
        className={isAdd ? 'max-w-4xl bg-[#161616] border-border/50 max-h-[92vh] overflow-y-auto' : 'max-w-md bg-[#161616] border-border/50'}
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
                />
                <RoomAddSeatBlock
                  title="Ghế VIP"
                  icon={Crown}
                  accentClass="text-amber-300"
                  borderClass="border-amber-500/25"
                  grid={seatGridVip}
                  setGrid={setSeatGridVip}
                  stackHint={stackPreviews[1]}
                />
                <RoomAddSeatBlock
                  title="Sweetbox"
                  icon={Heart}
                  accentClass="text-pink-300"
                  borderClass="border-pink-500/25"
                  grid={seatGridCouple}
                  setGrid={setSeatGridCouple}
                  stackHint={stackPreviews[2]}
                />
              </div>
            </div>
          )}

          {!isAdd && (
            <>
              <Select
                label="Loại phòng"
                value={formData.room_type}
                onChange={(e) => setFormData((p) => ({ ...p, room_type: e.target.value }))}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
              >
                {ROOM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </Select>
              <Input
                label="Số ghế"
                type="number"
                min="1"
                placeholder="VD: 80"
                value={formData.seat_count}
                onChange={(e) => { setFormData((p) => ({ ...p, seat_count: e.target.value })); setError(''); }}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                required
              />
              <Select
                label="Định dạng"
                value={formData.format}
                onChange={(e) => setFormData((p) => ({ ...p, format: e.target.value }))}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
              >
                {FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </Select>
              <Select
                label="Trạng thái"
                value={formData.status}
                onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
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
