/** Dùng chung RoomModals + AdminSeatMapPreview */

export const emptySeatGrid = () => ({
  num_rows: '',
  seats_per_row: '',
});

export const rowLabelFromIndex = (startLetter, index) => {
  const start = startLetter.toUpperCase().charCodeAt(0);
  const code = start + index;
  if (code < 65 || code > 90) return null;
  return String.fromCharCode(code);
};

export const validateSeatGrid = (g, label) => {
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

export const buildSeatPayloads = (roomId, seatType, nr, sp, rowStart) => {
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

/**
 * Danh sách ghế “ảo” để vẽ preview (thêm phòng) — cùng logic xếp hàng với khi tạo thật.
 */
export const computePreviewSeatsFromGrids = (sharedSeatRowStart, seatGridStandard, seatGridVip, seatGridCouple) => {
  const grids = [
    { grid: seatGridStandard, type: 'standard' },
    { grid: seatGridVip, type: 'vip' },
    { grid: seatGridCouple, type: 'couple' },
  ];
  const out = [];
  let rowCursor = (sharedSeatRowStart || 'A').toUpperCase().charCodeAt(0);
  for (const { grid, type } of grids) {
    const v = validateSeatGrid(grid, '');
    if (v.skip) continue;
    const rowStartChar = String.fromCharCode(rowCursor);
    const payloads = buildSeatPayloads(0, type, v.nr, v.sp, rowStartChar);
    payloads.forEach((p) => {
      out.push({ row_label: p.row_label, number: p.number, type: p.type });
    });
    rowCursor += v.nr;
  }
  return out;
};
