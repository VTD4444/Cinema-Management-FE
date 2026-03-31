/**
 * Ẩn bản ghi đã xóa mềm (chỉ khi is_deleted === true).
 * undefined / false / null vẫn hiển thị.
 */
export function withoutSoftDeleted(items) {
  if (!Array.isArray(items)) return [];
  return items.filter((row) => row != null && row.is_deleted !== true);
}
