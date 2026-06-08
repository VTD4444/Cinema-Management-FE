/** Dùng chung RoomModals, SeatModals, AdminSeatMapEditor */

import { normalizeSeatTypeForUi } from '../api/seatApi';

export const SEAT_CELL_EMPTY = null;

export const SEAT_BRUSH_TYPES = ['standard', 'vip', 'couple'];

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

export const validateSeatMapDimensions = (numRows, seatsPerRow, rowStart = 'A') => {
  const nr = parseInt(String(numRows ?? '').trim(), 10);
  const sp = parseInt(String(seatsPerRow ?? '').trim(), 10);
  if (!nr && !sp) return { skip: true };
  if (!nr || !sp) {
    return { error: 'Nhập đủ số hàng và ghế mỗi hàng, hoặc để trống cả hai nếu chỉ tạo phòng.' };
  }
  if (Number.isNaN(nr) || nr < 1 || nr > 26) return { error: 'Số hàng phải từ 1 đến 26.' };
  if (Number.isNaN(sp) || sp < 1 || sp > 99) return { error: 'Ghế mỗi hàng phải từ 1 đến 99.' };

  const letter = String(rowStart || 'A').trim();
  if (!/^[A-Za-z]$/.test(letter)) return { error: 'Dãy bắt đầu: một chữ cái A–Z.' };
  const base = letter.toUpperCase().charCodeAt(0);
  if (base + nr - 1 > 90) return { error: 'Tổng số hàng vượt quá Z. Giảm số hàng hoặc đổi dãy đầu.' };

  return { skip: false, nr, sp };
};

/** Ma trận 2D: mỗi ô = 'standard' | 'vip' | 'couple' | null */
export const createSeatMatrix = (numRows, seatsPerRow, fillType = 'standard') => {
  const nr = Math.max(0, parseInt(numRows, 10) || 0);
  const sp = Math.max(0, parseInt(seatsPerRow, 10) || 0);
  return Array.from({ length: nr }, () =>
    Array.from({ length: sp }, () => (fillType === SEAT_CELL_EMPTY ? SEAT_CELL_EMPTY : fillType)),
  );
};

export const resizeSeatMatrix = (prevMatrix, numRows, seatsPerRow, fillType = 'standard') => {
  const nr = Math.max(0, parseInt(numRows, 10) || 0);
  const sp = Math.max(0, parseInt(seatsPerRow, 10) || 0);
  const next = createSeatMatrix(nr, sp, fillType);
  const prev = Array.isArray(prevMatrix) ? prevMatrix : [];

  for (let r = 0; r < nr; r += 1) {
    for (let c = 0; c < sp; c += 1) {
      if (prev[r]?.[c] != null) {
        next[r][c] = prev[r][c];
      }
    }
  }
  return next;
};

export const fillSeatMatrix = (matrix, fillType = 'standard') => {
  if (!Array.isArray(matrix)) return [];
  return matrix.map((row) => row.map(() => fillType));
};

export const clearSeatMatrix = (matrix) => fillSeatMatrix(matrix, SEAT_CELL_EMPTY);

export const countSeatMatrix = (matrix) => {
  if (!Array.isArray(matrix)) return 0;
  return matrix.reduce(
    (sum, row) => sum + (Array.isArray(row) ? row.filter((cell) => cell != null).length : 0),
    0,
  );
};

export const matrixToPreviewSeats = (matrix, rowStart = 'A') => {
  const seats = [];
  if (!Array.isArray(matrix)) return seats;

  matrix.forEach((row, rowIndex) => {
    const rowLabel = rowLabelFromIndex(rowStart, rowIndex);
    if (!rowLabel || !Array.isArray(row)) return;
    row.forEach((type, colIndex) => {
      if (type == null) return;
      seats.push({
        row_label: rowLabel,
        number: colIndex + 1,
        type,
      });
    });
  });
  return seats;
};

export const matrixToSeatPayloads = (matrix, roomId, rowStart = 'A') => {
  return matrixToPreviewSeats(matrix, rowStart).map((seat) => ({
    room_id: Number(roomId),
    row_label: seat.row_label,
    number: seat.number,
    type: seat.type,
  }));
};

const seatPositionKey = (rowLabel, number) =>
  `${String(rowLabel ?? '').toUpperCase()}#${Number(number) || 0}`;

/** Suy ra kích thước sơ đồ từ danh sách ghế hiện có */
export const deriveSeatMapDimensionsFromSeats = (seats, defaultRowStart = 'A') => {
  if (!Array.isArray(seats) || seats.length === 0) {
    return { rowStart: defaultRowStart, numRows: '', seatsPerRow: '' };
  }
  const rowLabels = [
    ...new Set(seats.map((s) => String(s.row_label ?? '').toUpperCase()).filter(Boolean)),
  ].sort();
  const rowStart = rowLabels[0] || defaultRowStart;
  const firstCode = rowStart.charCodeAt(0);
  const lastCode = rowLabels[rowLabels.length - 1].charCodeAt(0);
  const numRows = Math.max(1, lastCode - firstCode + 1);
  const seatsPerRow = Math.max(...seats.map((s) => Number(s.number) || 0), 1);
  return { rowStart, numRows, seatsPerRow };
};

/** Chuyển ghế DB → ma trận editor (ô trống = null) */
export const seatsToSeatMatrix = (seats, rowStart = 'A', numRows, seatsPerRow) => {
  const nr = Math.max(0, parseInt(numRows, 10) || 0);
  const sp = Math.max(0, parseInt(seatsPerRow, 10) || 0);
  const matrix = createSeatMatrix(nr, sp, SEAT_CELL_EMPTY);
  const base = String(rowStart || 'A').toUpperCase().charCodeAt(0);

  if (!Array.isArray(seats)) return matrix;

  seats.forEach((seat) => {
    const row = String(seat.row_label ?? '').toUpperCase();
    const rowIndex = row.charCodeAt(0) - base;
    const colIndex = (Number(seat.number) || 0) - 1;
    if (rowIndex < 0 || rowIndex >= nr || colIndex < 0 || colIndex >= sp) return;
    matrix[rowIndex][colIndex] = normalizeSeatTypeForUi(seat.type);
  });
  return matrix;
};

/** So sánh ghế hiện tại với ma trận mới → tạo / cập nhật / xóa */
export const buildSeatSyncPlan = (existingSeats, matrix, roomId, rowStart = 'A') => {
  const desired = matrixToSeatPayloads(matrix, roomId, rowStart);
  const desiredMap = new Map(
    desired.map((seat) => [seatPositionKey(seat.row_label, seat.number), seat]),
  );
  const existingMap = new Map(
    (Array.isArray(existingSeats) ? existingSeats : []).map((seat) => [
      seatPositionKey(seat.row_label, seat.number),
      seat,
    ]),
  );

  const toCreate = [];
  const toUpdate = [];
  const toDelete = [];

  desired.forEach((seat) => {
    const key = seatPositionKey(seat.row_label, seat.number);
    const current = existingMap.get(key);
    if (!current) {
      toCreate.push(seat);
      return;
    }
    if (normalizeSeatTypeForUi(current.type) !== seat.type) {
      toUpdate.push({ id: current.id, type: seat.type });
    }
  });

  (Array.isArray(existingSeats) ? existingSeats : []).forEach((seat) => {
    const key = seatPositionKey(seat.row_label, seat.number);
    if (!desiredMap.has(key)) {
      toDelete.push(seat.id);
    }
  });

  return { toCreate, toUpdate, toDelete };
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

/** Legacy: 3 khối xếp nối tiếp — vẫn dùng ở SeatModals */
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
