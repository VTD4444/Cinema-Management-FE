import axiosClient from './axiosClient';

const SHOWTIMES_BASE = '/showtimes';

/**
 * Tạo suất chiếu mới
 * @param {{ movie_id: number, room_id: number, base_price: number, start_times: string|string[] }} payload
 */
export const createShowtime = (payload) => {
  return axiosClient.post(SHOWTIMES_BASE, payload);
};

/**
 * Cập nhật suất chiếu
 * @param {number|string} id
 * @param {{ movie_id?: number, room_id?: number, start_time?: string, base_price?: number }} payload
 */
export const updateShowtime = (id, payload) => {
  return axiosClient.put(`${SHOWTIMES_BASE}/${id}`, payload);
};

/**
 * Xóa suất chiếu
 * @param {number|string} id
 */
export const deleteShowtime = (id) => {
  return axiosClient.delete(`${SHOWTIMES_BASE}/${id}`);
};

/** Chuẩn hóa response GET /showtimes/filter */
export const getShowtimesFromResponse = (res) => {
  const raw = res?.data?.showtimes ?? res?.data?.items ?? res?.data ?? res?.showtimes ?? res;
  return Array.isArray(raw) ? raw : [];
};

/**
 * Lấy suất chiếu theo phim, rạp và ngày
 * @param {{ movie_id: number|string, cinema_id: number|string, date: string }} params
 */
export const getShowtimesByFilter = (params) => {
  return axiosClient.get(`${SHOWTIMES_BASE}/filter`, { params });
};

const runBatched = async (items, worker, concurrency = 6) => {
  if (!Array.isArray(items) || items.length === 0) return [];
  const results = new Array(items.length);
  let cursor = 0;

  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });

  await Promise.all(runners);
  return results;
};

/**
 * Lấy suất chiếu tất cả phim trong ngày (gọi /filter theo từng phim, giới hạn song song)
 * @param {{ cinema_id: number|string, date: string, movieIds: Array<number|string>, concurrency?: number }} params
 */
export const getShowtimesByCinemaDate = async ({
  cinema_id,
  date,
  movieIds = [],
  concurrency = 6,
}) => {
  if (!cinema_id || !date || !Array.isArray(movieIds) || movieIds.length === 0) {
    return [];
  }

  const batches = await runBatched(
    movieIds,
    async (movie_id) => {
      try {
        const res = await getShowtimesByFilter({ movie_id, cinema_id, date });
        return getShowtimesFromResponse(res);
      } catch {
        return [];
      }
    },
    concurrency,
  );

  const merged = batches.flat();
  const seen = new Set();
  const unique = merged.filter((st) => {
    if (st?.id == null) return true;
    const key = String(st.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.sort((a, b) => String(a.start_time || '').localeCompare(String(b.start_time || '')));
};
