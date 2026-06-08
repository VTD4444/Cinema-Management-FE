/** Lọc suất chiếu đã qua thời gian (dùng trang chi tiết phim) */

export const parseShowtimeDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(String(dateStr).replace('Z', '').replace('.000', ''));
  return Number.isNaN(d.getTime()) ? null : d;
};

export const isUpcomingShowtime = (showtime, now = new Date()) => {
  const start = parseShowtimeDate(showtime?.start_time);
  if (!start) return false;
  return start.getTime() >= now.getTime();
};

export const filterUpcomingShowtimes = (showtimes, now = new Date()) => {
  if (!Array.isArray(showtimes)) return [];
  return showtimes.filter((st) => isUpcomingShowtime(st, now));
};

/** groupedByCinema: { [cinemaId]: { [format]: Showtime[] } } */
export const filterGroupedShowtimesByCinema = (groupedByCinema, now = new Date()) => {
  if (!groupedByCinema || typeof groupedByCinema !== 'object') return {};
  const out = {};
  Object.entries(groupedByCinema).forEach(([cinemaId, formatGroups]) => {
    if (!formatGroups || typeof formatGroups !== 'object') return;
    const filteredFormats = {};
    Object.entries(formatGroups).forEach(([format, list]) => {
      const upcoming = filterUpcomingShowtimes(list, now);
      if (upcoming.length > 0) filteredFormats[format] = upcoming;
    });
    if (Object.keys(filteredFormats).length > 0) out[cinemaId] = filteredFormats;
  });
  return out;
};
