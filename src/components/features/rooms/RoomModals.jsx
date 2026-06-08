import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../../ui';
import { createRoom, updateRoom, deleteRoom, getRoomById } from '../../../api/roomApi';
import { createSeat, deleteSeat, getSeats, updateSeat } from '../../../api/seatApi';
import { handleApiError } from '../../../utils/errorHandling';
import { withoutSoftDeleted } from '../../../utils/withoutSoftDeleted';
import {
  buildSeatSyncPlan,
  countSeatMatrix,
  deriveSeatMapDimensionsFromSeats,
  matrixToSeatPayloads,
  resizeSeatMatrix,
  seatsToSeatMatrix,
  validateSeatMapDimensions,
} from '../../../utils/roomSeatGrid';
import AdminSeatMapEditor from './AdminSeatMapEditor';

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
  const [mapNumRows, setMapNumRows] = useState('');
  const [mapSeatsPerRow, setMapSeatsPerRow] = useState('');
  const [seatMatrix, setSeatMatrix] = useState([]);
  const [roomSeats, setRoomSeats] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const isDelete = state.type === 'delete';
  const isAddOrEdit = state.type === 'add' || state.type === 'edit';
  const data = state.data;

  useEffect(() => {
    if (state.type === 'edit' && data) {
      setFormData({
        name: data.name ?? '',
        room_type: data.room_type ?? 'standard',
        seat_count: data.seat_count ?? '',
        format: data.format ?? '2d',
        status: data.status ?? 'active',
      });
      setSharedSeatRowStart('A');
      setMapNumRows('');
      setMapSeatsPerRow('');
      setSeatMatrix([]);
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
      setMapNumRows('');
      setMapSeatsPerRow('');
      setSeatMatrix([]);
      setRoomSeats([]);
    }
    setError('');
  }, [state.type, data]);

  useEffect(() => {
    const v = validateSeatMapDimensions(mapNumRows, mapSeatsPerRow, sharedSeatRowStart);
    if (v.skip) {
      setSeatMatrix([]);
      return;
    }
    if (v.error) return;
    setSeatMatrix((prev) => resizeSeatMatrix(prev, v.nr, v.sp, 'standard'));
  }, [mapNumRows, mapSeatsPerRow]);

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
          seat_count: cleaned.length || (r?.seat_count ?? data.seat_count ?? prev.seat_count ?? ''),
          format: r?.format ?? data.format ?? prev.format ?? '2d',
          status: r?.status ?? data.status ?? prev.status ?? 'active',
        }));
        setRoomSeats(cleaned);
        const dims = deriveSeatMapDimensionsFromSeats(cleaned);
        setSharedSeatRowStart(dims.rowStart);
        setMapNumRows(cleaned.length ? String(dims.numRows) : '');
        setMapSeatsPerRow(cleaned.length ? String(dims.seatsPerRow) : '');
        setSeatMatrix(
          cleaned.length
            ? seatsToSeatMatrix(cleaned, dims.rowStart, dims.numRows, dims.seatsPerRow)
            : [],
        );
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

      const dimValidation = validateSeatMapDimensions(mapNumRows, mapSeatsPerRow, sharedSeatRowStart);
      if (dimValidation.error) {
        setError(dimValidation.error);
        setLoading(false);
        return;
      }

      const seatCount = countSeatMatrix(seatMatrix);
      if (!dimValidation.skip && seatCount === 0) {
        setError('Vẽ ít nhất một ghế trên sơ đồ, hoặc để trống kích thước nếu chỉ tạo phòng.');
        setLoading(false);
        return;
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

          if (seatCount === 0) {
            onSuccess?.();
            onClose();
            return;
          }

          const payloads = matrixToSeatPayloads(seatMatrix, roomId, sharedSeatRowStart);
          const results = await Promise.allSettled(payloads.map((p) => createSeat(p)));
          const failed = results.filter((x) => x.status === 'rejected').length;
          if (failed > 0) {
            setError(
              `Phòng đã tạo. ${payloads.length - failed}/${payloads.length} ghế tạo thành công. Kiểm tra và thêm tay nếu cần.`,
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

    if (state.type === 'edit') {
      const name = formData.name.trim();
      if (!name) {
        setError('Nhập tên phòng.');
        setLoading(false);
        return;
      }

      const dimValidation = validateSeatMapDimensions(mapNumRows, mapSeatsPerRow, sharedSeatRowStart);
      if (dimValidation.error) {
        setError(dimValidation.error);
        setLoading(false);
        return;
      }

      updateRoom(data.id, { name })
        .then(async (res) => {
          if (res?.success === false) {
            setError(res?.message || 'Có lỗi xảy ra');
            return;
          }

          if (dimValidation.skip) {
            onSuccess?.();
            onClose();
            return;
          }

          const { toCreate, toUpdate, toDelete } = buildSeatSyncPlan(
            roomSeats,
            seatMatrix,
            data.id,
            sharedSeatRowStart,
          );

          const ops = [
            ...toCreate.map((payload) => createSeat(payload)),
            ...toUpdate.map(({ id, type }) => updateSeat(id, { type })),
            ...toDelete.map((id) => deleteSeat(id)),
          ];

          if (ops.length === 0) {
            onSuccess?.();
            onClose();
            return;
          }

          const results = await Promise.allSettled(ops);
          const failed = results.filter((x) => x.status === 'rejected').length;
          if (failed > 0) {
            setError(
              `Đã lưu tên phòng. ${ops.length - failed}/${ops.length} thao tác ghế thành công. Kiểm tra lại sơ đồ nếu cần.`,
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

          <div className="space-y-4">
            <p className="text-xs text-zinc-500 leading-relaxed">
              {isAdd
                ? (
                  <>
                    Nhập kích thước sơ đồ, chọn loại ghế (Thường / VIP / Sweetbox) rồi{' '}
                    <strong className="text-zinc-400">click hoặc kéo</strong> trên từng ô. Để trống kích thước nếu chỉ tạo phòng.
                  </>
                )
                : (
                  <>
                    Chỉnh số hàng, ghế mỗi hàng và loại ghế giống khi thêm mới. Ghế bị xóa khỏi sơ đồ sẽ được gỡ khỏi hệ thống khi lưu.
                  </>
                )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Dãy bắt đầu"
                placeholder="A"
                value={sharedSeatRowStart}
                onChange={(e) => {
                  const v = e.target.value.toUpperCase().slice(0, 1);
                  setSharedSeatRowStart(v || 'A');
                  setError('');
                }}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11 uppercase"
                maxLength={1}
                disabled={!isAdd && detailLoading}
              />
              <Input
                label="Số hàng"
                type="number"
                min="1"
                max="26"
                placeholder="VD: 8"
                value={mapNumRows}
                onChange={(e) => { setMapNumRows(e.target.value); setError(''); }}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                disabled={!isAdd && detailLoading}
              />
              <Input
                label="Ghế mỗi hàng"
                type="number"
                min="1"
                max="99"
                placeholder="VD: 10"
                value={mapSeatsPerRow}
                onChange={(e) => { setMapSeatsPerRow(e.target.value); setError(''); }}
                className="bg-zinc-900/50 border-zinc-800 rounded-xl h-11"
                disabled={!isAdd && detailLoading}
              />
            </div>
            <div className="relative">
              {!isAdd && detailLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-zinc-950/70 text-sm text-zinc-400">
                  Đang tải sơ đồ ghế…
                </div>
              )}
              <AdminSeatMapEditor
                matrix={seatMatrix}
                onMatrixChange={setSeatMatrix}
                rowStart={sharedSeatRowStart}
                numRows={mapNumRows}
                seatsPerRow={mapSeatsPerRow}
                disabled={loading || (!isAdd && detailLoading)}
                countLabel={isAdd ? 'ghế sẽ được tạo' : 'ghế trên sơ đồ'}
              />
            </div>
          </div>

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
