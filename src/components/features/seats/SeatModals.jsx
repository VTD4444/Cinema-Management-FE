import React, { useState, useEffect } from 'react';
import { Armchair, Crown, Heart, Upload, AlertTriangle } from 'lucide-react';
import { Modal, Input, Button, Select } from '../../ui';
import {
  createSeat,
  updateSeat,
  deleteSeat,
  importSeatsFromExcel,
  normalizeSeatTypeForUi,
} from '../../../api/seatApi';
import { handleApiError } from '../../../utils/errorHandling';

const TYPE_OPTIONS = [
  { value: 'standard', label: 'Thường' },
  { value: 'vip', label: 'VIP' },
  { value: 'couple', label: 'Sweetbox' },
];

const emptyGrid = () => ({
  num_rows: '',
  seats_per_row: '',
});

const emptyManual = () => ({ row_label: '', number: '' });

const rowLabelFromIndex = (startLetter, index) => {
  const start = startLetter.toUpperCase().charCodeAt(0);
  const code = start + index;
  if (code < 65 || code > 90) return null;
  return String.fromCharCode(code);
};

/** Same rules as RoomModals: empty both = skip; partial = error. */
const validateSeatGridBlock = (g, label) => {
  const nrRaw = String(g.num_rows ?? '').trim();
  const spRaw = String(g.seats_per_row ?? '').trim();
  if (!nrRaw && !spRaw) return { error: null, skip: true };
  if (!nrRaw || !spRaw) {
    return { error: `${label}: nhập đủ số hàng và ghế mỗi hàng, hoặc để trống cả hai.`, skip: false };
  }
  const nr = parseInt(nrRaw, 10);
  const sp = parseInt(spRaw, 10);
  if (Number.isNaN(nr) || nr < 1 || nr > 26) return { error: `${label}: số hàng 1–26.`, skip: false };
  if (Number.isNaN(sp) || sp < 1 || sp > 99) return { error: `${label}: ghế mỗi hàng 1–99.`, skip: false };
  return { error: null, skip: false, nr, sp };
};

const buildGridPayloadsFromStart = (rid, seatType, nr, sp, rowStartChar) => {
  const payloads = [];
  for (let r = 0; r < nr; r += 1) {
    const row = rowLabelFromIndex(rowStartChar, r);
    if (!row) break;
    for (let n = 1; n <= sp; n += 1) {
      payloads.push({ room_id: rid, row_label: row, number: n, type: seatType });
    }
  }
  return payloads;
};

/** Planned row ranges if lưới được tạo theo thứ tự Thường → VIP → Sweetbox. */
const computeStackHints = (sharedStart, gridStandard, gridVip, gridCouple) => {
  const letter = (sharedStart || 'A').trim();
  if (!/^[A-Za-z]$/.test(letter)) return [null, null, null];
  const base = letter.toUpperCase().charCodeAt(0);
  const grids = [gridStandard, gridVip, gridCouple];
  let cursor = 0;
  return grids.map((g) => {
    const v = validateSeatGridBlock(g, '');
    if (v.skip || v.error) return null;
    const startCode = base + cursor;
    const endCode = startCode + v.nr - 1;
    if (startCode > 90 || endCode > 90) return 'Vượt quá Z — giảm số hàng hoặc đổi dãy đầu.';
    const startLabel = String.fromCharCode(startCode);
    const endLabel = String.fromCharCode(endCode);
    const hint = `Dự kiến: hàng ${startLabel}–${endLabel} · ${v.nr * v.sp} ghế`;
    cursor += v.nr;
    return hint;
  });
};

const SeatTypeSection = ({
  title,
  icon,
  accentClass,
  borderClass,
  seatType,
  grid,
  setGrid,
  manual,
  setManual,
  stackHint,
  loading,
  onCreateGrid,
  onAddSingleSeat,
  onClearError,
}) => {
  const IconComponent = icon;
  const nr = parseInt(grid.num_rows, 10) || 0;
  const sp = parseInt(grid.seats_per_row, 10) || 0;
  const preview = nr > 0 && sp > 0 ? nr * sp : 0;
  return (
    <div className={`rounded-xl border ${borderClass} bg-zinc-900/40 p-4 space-y-4`}>
      <div className={`flex items-center gap-2 text-sm font-semibold ${accentClass}`}>
        <IconComponent className="h-4 w-4 shrink-0" />
        {title}
      </div>
      <div>
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Tạo theo lưới</p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Số hàng"
            type="number"
            min="1"
            max="26"
            value={grid.num_rows}
            onChange={(e) => { setGrid((p) => ({ ...p, num_rows: e.target.value })); onClearError?.(); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-lg h-10 text-sm"
          />
          <Input
            label="Ghế/hàng"
            type="number"
            min="1"
            max="99"
            value={grid.seats_per_row}
            onChange={(e) => { setGrid((p) => ({ ...p, seats_per_row: e.target.value })); onClearError?.(); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-lg h-10 text-sm"
          />
        </div>
        {stackHint && (
          <p className={`text-xs mt-2 ${stackHint.startsWith('Vượt') ? 'text-amber-400/90' : 'text-zinc-500'}`}>
            {stackHint}
          </p>
        )}
        {preview > 0 && (
          <p className="text-xs text-zinc-500 mt-2">
            ≈ <span className="text-zinc-300 font-medium">{preview}</span> ghế trong lưới này
          </p>
        )}
        <Button
          type="button"
          variant="secondary"
          className="mt-3 w-full rounded-full h-9 text-sm"
          disabled={loading}
          onClick={onCreateGrid}
        >
          Tạo lưới
        </Button>
      </div>
      <div className="border-t border-border/50 pt-3">
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Thêm một ghế</p>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="w-16">
            <Input
              label="Dãy"
              placeholder="A"
              value={manual.row_label}
              onChange={(e) => setManual((p) => ({ ...p, row_label: e.target.value.toUpperCase().slice(0, 5) }))}
              className="bg-zinc-900/50 border-zinc-800 rounded-lg h-10 text-sm uppercase"
              maxLength={5}
            />
          </div>
          <div className="w-20">
            <Input
              label="Số"
              type="number"
              min="1"
              value={manual.number}
              onChange={(e) => setManual((p) => ({ ...p, number: e.target.value }))}
              className="bg-zinc-900/50 border-zinc-800 rounded-lg h-10 text-sm"
            />
          </div>
          <Button
            type="button"
            className="rounded-full h-10 px-4 text-sm shrink-0"
            disabled={loading}
            onClick={() => onAddSingleSeat(seatType, manual)}
          >
            Thêm
          </Button>
        </div>
      </div>
    </div>
  );
};

const SeatModals = ({ state, onClose, onSuccess, roomId, rooms = [] }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    room_id: '',
    row_label: '',
    number: '',
    type: 'standard',
  });

  const [sharedRowStart, setSharedRowStart] = useState('A');
  const [rowBandOffset, setRowBandOffset] = useState(0);
  const [gridStandard, setGridStandard] = useState(emptyGrid);
  const [gridVip, setGridVip] = useState(emptyGrid);
  const [gridCouple, setGridCouple] = useState(emptyGrid);
  const [manualStandard, setManualStandard] = useState(emptyManual);
  const [manualVip, setManualVip] = useState(emptyManual);
  const [manualCouple, setManualCouple] = useState(emptyManual);

  const [importFile, setImportFile] = useState(null);

  const isDelete = state.type === 'delete';
  const isAdd = state.type === 'add';
  const isEdit = state.type === 'edit';
  const isImport = state.type === 'import';
  const data = state.data;

  useEffect(() => {
    if (isEdit && data) {
      setFormData({
        room_id: String(data.room_id ?? ''),
        row_label: data.row_label ?? '',
        number: data.number != null ? String(data.number) : '',
        type: normalizeSeatTypeForUi(data.type),
      });
    } else if (isAdd) {
      setFormData({
        room_id: roomId ? String(roomId) : '',
        row_label: '',
        number: '',
        type: 'standard',
      });
      setSharedRowStart('A');
      setRowBandOffset(0);
      setGridStandard(emptyGrid());
      setGridVip(emptyGrid());
      setGridCouple(emptyGrid());
      setManualStandard(emptyManual());
      setManualVip(emptyManual());
      setManualCouple(emptyManual());
    } else if (isImport) {
      setImportFile(null);
    }
    setError('');
  }, [state.type, data, roomId, isEdit, isAdd, isImport]);

  const resolveRoomId = () => {
    const id = parseInt(formData.room_id, 10);
    return Number.isFinite(id) && id > 0 ? id : null;
  };

  const handleCreateGrid = async (seatType, seatGrid, clearGrid) => {
    setError('');
    const rid = resolveRoomId();
    if (!rid) {
      setError('Chọn phòng chiếu.');
      return;
    }
    const letter = (sharedRowStart || 'A').trim();
    if (!/^[A-Za-z]$/.test(letter)) {
      setError('Dãy bắt đầu: một chữ cái A–Z.');
      return;
    }
    const v = validateSeatGridBlock(seatGrid, 'Lưới');
    if (v.skip) {
      setError('Nhập số hàng và ghế mỗi hàng.');
      return;
    }
    if (v.error) {
      setError(v.error);
      return;
    }
    const base = letter.toUpperCase().charCodeAt(0);
    const firstCode = base + rowBandOffset;
    if (firstCode + v.nr - 1 > 90) {
      setError('Các hàng vượt quá Z. Giảm số hàng, đổi dãy đầu hoặc chọn phòng/ghế khác.');
      return;
    }
    const rowStartChar = String.fromCharCode(firstCode);
    const payloads = buildGridPayloadsFromStart(rid, seatType, v.nr, v.sp, rowStartChar);
    if (payloads.length === 0) {
      setError('Nhập số hàng và ghế mỗi hàng.');
      return;
    }
    setLoading(true);
    const results = await Promise.allSettled(payloads.map((p) => createSeat(p)));
    const failed = results.filter((x) => x.status === 'rejected').length;
    setLoading(false);
    if (failed > 0) {
      setError(
        `Đã gửi ${payloads.length - failed}/${payloads.length} ghế. Một số có thể trùng hoặc lỗi — kiểm tra danh sách.`,
      );
      onSuccess?.();
      return;
    }
    setRowBandOffset((o) => o + v.nr);
    clearGrid?.();
    onSuccess?.();
  };

  const handleSingleSeat = async (seatType, manual) => {
    setError('');
    const rid = resolveRoomId();
    if (!rid) {
      setError('Chọn phòng chiếu.');
      return;
    }
    const row = (manual.row_label || '').trim().toUpperCase().slice(0, 5);
    const num = parseInt(manual.number, 10);
    if (!row || !num || num < 1) {
      setError('Nhập dãy và số ghế hợp lệ.');
      return;
    }
    setLoading(true);
    createSeat({ room_id: rid, row_label: row, number: num, type: seatType })
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          if (seatType === 'standard') setManualStandard(emptyManual());
          if (seatType === 'vip') setManualVip(emptyManual());
          if (seatType === 'couple') setManualCouple(emptyManual());
        } else {
          setError(res?.message || 'Không thể thêm ghế.');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể thêm ghế.')))
      .finally(() => setLoading(false));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      row_label: formData.row_label.trim().toUpperCase().slice(0, 5),
      number: parseInt(formData.number, 10) || 0,
      type: formData.type,
    };
    updateSeat(data.id, payload)
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Có lỗi xảy ra');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể lưu ghế.')))
      .finally(() => setLoading(false));
  };

  const handleDelete = () => {
    setError('');
    setLoading(true);
    deleteSeat(data.id)
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Không thể xóa.');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể xóa ghế.')))
      .finally(() => setLoading(false));
  };

  const handleImportSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!importFile) {
      setError('Chọn file Excel (.xlsx).');
      return;
    }
    setLoading(true);
    importSeatsFromExcel(importFile)
      .then((res) => {
        if (res?.success !== false) {
          onSuccess?.();
          onClose();
        } else {
          setError(res?.message || 'Import thất bại.');
        }
      })
      .catch((err) => setError(handleApiError(err, 'Không thể import file.')))
      .finally(() => setLoading(false));
  };

  if (!state.type) return null;

  if (isDelete) {
    return (
      <Modal isOpen title="Xác nhận xóa" onClose={onClose} className="max-w-md bg-[#161616] border-border/50">
        <div className="space-y-6">
          <p className="text-sm text-zinc-400">Bạn có chắc chắn muốn xóa ghế này?</p>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1 rounded-full" disabled={loading}>Hủy</Button>
            <Button variant="danger" className="flex-1 rounded-full" onClick={handleDelete} disabled={loading} isLoading={loading}>Xác nhận xóa</Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (isImport) {
    return (
      <Modal
        isOpen
        onClose={onClose}
        title="Import ghế từ Excel"
        className="max-w-lg bg-[#161616] border-border/50"
      >
        <form onSubmit={handleImportSubmit} className="space-y-5">
          {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200/90">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
              <p>
                API backend sẽ <strong className="text-amber-200">xóa toàn bộ ghế hiện có</strong> của mọi{' '}
                <code className="text-zinc-300">room_id</code> xuất hiện trong file, rồi tạo lại theo sheet.
              </p>
              <p>
                Sheet đầu tiên: cột <code className="text-zinc-300">room_id</code>,{' '}
                <code className="text-zinc-300">row_label</code>, <code className="text-zinc-300">number</code>,{' '}
                <code className="text-zinc-300">type</code> (tuỳ chọn: standard / vip / couple).
              </p>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2">File .xlsx</label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-600 bg-zinc-900/50 px-4 py-8 hover:border-primary/50 transition-colors">
              <Upload className="h-5 w-5 text-zinc-400" />
              <span className="text-sm text-zinc-300">{importFile ? importFile.name : 'Chọn file Excel'}</span>
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  setImportFile(e.target.files?.[0] || null);
                  setError('');
                }}
              />
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full px-6 h-10">Hủy</Button>
            <Button type="submit" className="rounded-full px-6 h-10 gap-2" isLoading={loading}>
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  if (isAdd) {
    const stackHints = computeStackHints(sharedRowStart, gridStandard, gridVip, gridCouple);
    const L = (sharedRowStart || 'A').trim();
    const nextRowLetter =
      /^[A-Za-z]$/.test(L) && L.toUpperCase().charCodeAt(0) + rowBandOffset <= 90
        ? String.fromCharCode(L.toUpperCase().charCodeAt(0) + rowBandOffset)
        : '—';

    return (
      <Modal
        isOpen
        onClose={onClose}
        title="Thêm ghế"
        className="max-w-4xl bg-[#161616] border-border/50 max-h-[90vh] overflow-y-auto"
      >
        <div className="space-y-6">
          {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          {rooms.length > 0 ? (
            <Select
              label="Phòng chiếu"
              value={formData.room_id}
              onChange={(e) => {
                setFormData((p) => ({ ...p, room_id: e.target.value }));
                setRowBandOffset(0);
                setError('');
              }}
              className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
              required
            >
              <option value="">Chọn phòng</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </Select>
          ) : (
            <p className="text-sm text-amber-400/90 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2">
              Chưa có phòng chiếu. Hãy tạo phòng ở mục Phòng chiếu & Ghế trước khi thêm ghế.
            </p>
          )}
          <Input
            label="Dãy bắt đầu (chung cho lưới)"
            placeholder="A"
            value={sharedRowStart}
            onChange={(e) => {
              setSharedRowStart((e.target.value || 'A').toUpperCase().slice(0, 1) || 'A');
              setError('');
            }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11 text-sm uppercase max-w-[120px]"
            maxLength={1}
          />
          <p className="text-xs text-zinc-500 -mt-3">
            Lần <strong className="text-zinc-400">Tạo lưới</strong> tiếp theo bắt đầu từ hàng{' '}
            <strong className="text-zinc-300">{nextRowLetter}</strong>
            {rowBandOffset > 0 ? ' (đã cộng các hàng vừa tạo trong phiên này).' : '.'} Thường → VIP → Sweetbox nối tiếp hàng để tránh trùng{' '}
            <code className="text-zinc-400">(room_id, row, number)</code>.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SeatTypeSection
              title="Ghế thường"
              icon={Armchair}
              accentClass="text-blue-300"
              borderClass="border-blue-500/25"
              seatType="standard"
              grid={gridStandard}
              setGrid={setGridStandard}
              manual={manualStandard}
              setManual={setManualStandard}
              stackHint={stackHints[0]}
              loading={loading}
              onCreateGrid={() => handleCreateGrid('standard', gridStandard, () => setGridStandard(emptyGrid()))}
              onAddSingleSeat={handleSingleSeat}
              onClearError={() => setError('')}
            />
            <SeatTypeSection
              title="Ghế VIP"
              icon={Crown}
              accentClass="text-amber-300"
              borderClass="border-amber-500/25"
              seatType="vip"
              grid={gridVip}
              setGrid={setGridVip}
              manual={manualVip}
              setManual={setManualVip}
              stackHint={stackHints[1]}
              loading={loading}
              onCreateGrid={() => handleCreateGrid('vip', gridVip, () => setGridVip(emptyGrid()))}
              onAddSingleSeat={handleSingleSeat}
              onClearError={() => setError('')}
            />
            <SeatTypeSection
              title="Sweetbox (Couple)"
              icon={Heart}
              accentClass="text-pink-300"
              borderClass="border-pink-500/25"
              seatType="couple"
              grid={gridCouple}
              setGrid={setGridCouple}
              manual={manualCouple}
              setManual={setManualCouple}
              stackHint={stackHints[2]}
              loading={loading}
              onCreateGrid={() => handleCreateGrid('couple', gridCouple, () => setGridCouple(emptyGrid()))}
              onAddSingleSeat={handleSingleSeat}
              onClearError={() => setError('')}
            />
          </div>
          <div className="flex justify-end pt-2 border-t border-border/50">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full px-6 h-10">Đóng</Button>
          </div>
        </div>
      </Modal>
    );
  }

  if (isEdit) {
    return (
      <Modal
        isOpen
        onClose={onClose}
        title="Chỉnh sửa ghế"
        className="max-w-md bg-[#161616] border-border/50"
      >
        <form onSubmit={handleEditSubmit} className="space-y-6">
          {error && <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
          <Input
            label="Dãy (A-Z)"
            placeholder="VD: A"
            value={formData.row_label}
            onChange={(e) => { setFormData((p) => ({ ...p, row_label: e.target.value.toUpperCase().slice(0, 5) })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11 uppercase"
            maxLength={5}
            required
          />
          <Input
            label="Thứ tự (số ghế trong dãy)"
            type="number"
            min="1"
            placeholder="VD: 1"
            value={formData.number}
            onChange={(e) => { setFormData((p) => ({ ...p, number: e.target.value })); setError(''); }}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
            required
          />
          <Select
            label="Loại ghế"
            value={formData.type}
            onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
            className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} className="rounded-full px-6 h-10">Hủy</Button>
            <Button type="submit" className="rounded-full px-6 h-10" isLoading={loading}>Lưu</Button>
          </div>
        </form>
      </Modal>
    );
  }

  return null;
};

export default SeatModals;
