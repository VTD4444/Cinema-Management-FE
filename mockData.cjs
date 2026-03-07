/**
 * Mock data cho JSON Server (CommonJS - dùng khi project có "type": "module")
 *
 * Cài đặt: npm i -D json-server
 * Chạy:     npm run mock:api
 * Hoặc:     npx json-server mockData.cjs --port 8080 --routes json-server-routes.json
 *
 * Đảm bảo .env có VITE_API_BASE_URL=http://localhost:8080/api/v1
 *
 * Endpoints (qua routes): /api/v1/movies, /api/v1/genres, /api/v1/movieGenres
 * JSON Server trả về mảng/object trực tiếp (frontend đã hỗ trợ). Phân trang: ?_page=1&_limit=8 (header X-Total-Count).
 * Schema theo thiết kế DB: Movies, Genres, MovieGenres
 */

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

const genres = [
  { id: 1, name: 'Hành động', created_at: now(), updated_at: now() },
  { id: 2, name: 'Khoa học viễn tưởng', created_at: now(), updated_at: now() },
  { id: 3, name: 'Tình cảm', created_at: now(), updated_at: now() },
  { id: 4, name: 'Hoạt hình', created_at: now(), updated_at: now() },
  { id: 5, name: 'Kinh dị', created_at: now(), updated_at: now() },
  { id: 6, name: 'Phiêu lưu', created_at: now(), updated_at: now() },
  { id: 7, name: 'Tâm lý', created_at: now(), updated_at: now() },
  { id: 8, name: 'Gia đình', created_at: now(), updated_at: now() },
  { id: 9, name: 'Hài', created_at: now(), updated_at: now() },
  { id: 10, name: 'Âm nhạc', created_at: now(), updated_at: now() },
  { id: 11, name: 'Viễn tây', created_at: now(), updated_at: now() },
  { id: 12, name: 'Tài liệu', created_at: now(), updated_at: now() },
];

const movies = [
  {
    id: 1,
    title: 'Dune: Part Two',
    duration: 166,
    directors_name: 'Denis Villeneuve',
    release_date: '2024-03-01',
    description: 'Paul Atreides đoàn kết với người Fremen trên hành tinh Arrakis để chiến đấu chống lại những kẻ thù đe dọa tương lai của gia tộc.',
    poster_urls: ['https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nwn1T.jpg'],
    trailer_url: 'https://www.youtube.com/watch?v=8g18jFHCLXk',
    status: 'showing',
    created_at: now(),
    updated_at: now(),
  },
  {
    id: 2,
    title: 'Kung Fu Panda 4',
    duration: 94,
    directors_name: 'Mike Mitchell',
    release_date: '2024-03-08',
    description: 'Po phải tìm người kế vị làm Rồng Chiến binh và đối mặt với kẻ phản diện mới - The Chameleon.',
    poster_urls: ['https://image.tmdb.org/t/p/w500/kDp1vQBn7cRZ7Zq7e4bT6K3yQmN.jpg'],
    trailer_url: 'https://www.youtube.com/watch?v=_inKs4eeHiI',
    status: 'showing',
    created_at: now(),
    updated_at: now(),
  },
  {
    id: 3,
    title: 'Godzilla x Kong: The New Empire',
    duration: 115,
    directors_name: 'Adam Wingard',
    release_date: '2024-03-29',
    description: 'Godzilla và Kong phải hợp sức chống lại mối đe dọa khổng lồ ẩn sâu trong thế giới Hollow Earth.',
    poster_urls: ['https://image.tmdb.org/t/p/w500/z1p34vh7dEOnLDmyCrlUVLuoDzd.jpg'],
    trailer_url: 'https://www.youtube.com/watch?v=lm1WFgNWh8U',
    status: 'coming_soon',
    created_at: now(),
    updated_at: now(),
  },
  {
    id: 4,
    title: 'Mai',
    duration: 131,
    directors_name: 'Trấn Thành',
    release_date: '2024-02-10',
    description: 'Mai - người phụ nữ với quá khứ đau thương, tìm cách hàn gắn và đối mặt với hiện tại.',
    poster_urls: ['https://image.tmdb.org/t/p/w500/wuOMZ1yndf8VbAeW0uayX0FjfM.jpg'],
    trailer_url: 'https://www.youtube.com/watch?v=uR0xM0y4F94',
    status: 'passed',
    created_at: now(),
    updated_at: now(),
  },
  {
    id: 5,
    title: 'Đào, Phở và Piano',
    duration: 108,
    directors_name: 'Phan Gia Nhật Linh',
    release_date: '2024-01-12',
    description: 'Câu chuyện về gia đình, ẩm thực và âm nhạc tại một quán phở nhỏ ở Sài Gòn.',
    poster_urls: ['https://image.tmdb.org/t/p/w500/placeholder-poster.jpg'],
    trailer_url: '',
    status: 'passed',
    created_at: now(),
    updated_at: now(),
  },
];

const movieGenres = [
  { movie_id: 1, genre_id: 2, created_at: now(), updated_at: now() },
  { movie_id: 1, genre_id: 4, created_at: now(), updated_at: now() },
  { movie_id: 2, genre_id: 3, created_at: now(), updated_at: now() },
  { movie_id: 2, genre_id: 6, created_at: now(), updated_at: now() },
  { movie_id: 3, genre_id: 1, created_at: now(), updated_at: now() },
  { movie_id: 3, genre_id: 2, created_at: now(), updated_at: now() },
  { movie_id: 4, genre_id: 5, created_at: now(), updated_at: now() },
  { movie_id: 5, genre_id: 5, created_at: now(), updated_at: now() },
  { movie_id: 5, genre_id: 6, created_at: now(), updated_at: now() },
];

// Provinces (Cities): schema DB = id, name, created_at, updated_at. code, cinema_complex_count dùng cho UI.
const cities = [
  { id: 1, code: 'HCM', name: 'TP. Hồ Chí Minh', cinema_complex_count: 8, created_at: now(), updated_at: now() },
  { id: 2, code: 'HNI', name: 'Hà Nội', cinema_complex_count: 6, created_at: now(), updated_at: now() },
  { id: 3, code: 'DNG', name: 'Đà Nẵng', cinema_complex_count: 3, created_at: now(), updated_at: now() },
  { id: 4, code: 'CTO', name: 'Cần Thơ', cinema_complex_count: 2, created_at: now(), updated_at: now() },
  { id: 5, code: 'HPH', name: 'Hải Phòng', cinema_complex_count: 1, created_at: now(), updated_at: now() },
  { id: 6, code: 'BDO', name: 'Bình Dương', cinema_complex_count: 2, created_at: now(), updated_at: now() },
  { id: 7, code: 'DNO', name: 'Đồng Nai', cinema_complex_count: 2, created_at: now(), updated_at: now() },
  { id: 8, code: 'KHA', name: 'Khánh Hòa', cinema_complex_count: 1, created_at: now(), updated_at: now() },
  { id: 9, code: 'QNA', name: 'Quảng Nam', cinema_complex_count: 1, created_at: now(), updated_at: now() },
  { id: 10, code: 'QNG', name: 'Quảng Ninh', cinema_complex_count: 1, created_at: now(), updated_at: now() },
  { id: 11, code: 'HUE', name: 'Thừa Thiên Huế', cinema_complex_count: 1, created_at: now(), updated_at: now() },
  { id: 12, code: 'VTU', name: 'Vũng Tàu', cinema_complex_count: 1, created_at: now(), updated_at: now() },
  { id: 13, code: 'NAN', name: 'Nghệ An', cinema_complex_count: 1, created_at: now(), updated_at: now() },
  { id: 14, code: 'THA', name: 'Thanh Hóa', cinema_complex_count: 1, created_at: now(), updated_at: now() },
  { id: 15, code: 'BDI', name: 'Bình Định', cinema_complex_count: 1, created_at: now(), updated_at: now() },
  { id: 16, code: 'LDO', name: 'Lâm Đồng', cinema_complex_count: 1, created_at: now(), updated_at: now() },
  { id: 17, code: 'AGI', name: 'An Giang', cinema_complex_count: 1, created_at: now(), updated_at: now() },
  { id: 18, code: 'TNG', name: 'Tiền Giang', cinema_complex_count: 1, created_at: now(), updated_at: now() },
];

// Cinemas: schema DB = id, name, address, image_urls (json), province_id (FK). Trong mock dùng city_id (= province_id), code, city_name, room_count cho UI.
const cinemas = [
  { id: 1, code: 'CG001', name: 'CineGo Aeon Hà Đông', address: 'Tầng 3, AEON MALL Hà Đông, P. Dương Nội, Q. Hà Đông', city_id: 2, city_name: 'Hà Nội', room_count: 9, image_urls: [], created_at: now(), updated_at: now() },
  { id: 2, code: 'CG002', name: 'CineGo Landmark 81', address: 'Tầng B1, Vincom Center Landmark 81, Q. Bình Thạnh', city_id: 1, city_name: 'Hồ Chí Minh', room_count: 7, created_at: now(), updated_at: now() },
  { id: 3, code: 'CG003', name: 'CineGo Vincom Đà Nẵng', address: 'Tầng 4, Vincom Plaza Ngô Quyền, Q. Sơn Trà', city_id: 3, city_name: 'Đà Nẵng', room_count: 5, created_at: now(), updated_at: now() },
  { id: 4, code: 'CG004', name: 'CineGo Royal City', address: 'Tầng B2, Vincom Mega Mall Royal City, Q. Thanh Xuân', city_id: 2, city_name: 'Hà Nội', room_count: 10, created_at: now(), updated_at: now() },
  { id: 5, code: 'CG005', name: 'CineGo Xuân Diệu', address: 'Đường Xuân Diệu, TP. Quy Nhơn, Bình Định', city_id: 15, city_name: 'Quy Nhơn', room_count: 4, created_at: now(), updated_at: now() },
  { id: 6, code: 'CG006', name: 'CineGo Crescent Mall', address: 'Tầng 4, Crescent Mall, Q. 7', city_id: 1, city_name: 'Hồ Chí Minh', room_count: 8, created_at: now(), updated_at: now() },
  { id: 7, code: 'CG007', name: 'CineGo Lotte Hà Nội', address: 'Tầng 5, Lotte Center Hà Nội, Liễu Giai', city_id: 2, city_name: 'Hà Nội', room_count: 6, created_at: now(), updated_at: now() },
  { id: 8, code: 'CG008', name: 'CineGo Big C Đà Nẵng', address: 'Tầng 3, Big C Đà Nẵng, Q. Cẩm Lệ', city_id: 3, city_name: 'Đà Nẵng', room_count: 4, created_at: now(), updated_at: now() },
  { id: 9, code: 'CG009', name: 'CineGo Vincom Cần Thơ', address: 'Tầng 3, Vincom Plaza Xuân Khánh, Ninh Kiều', city_id: 4, city_name: 'Cần Thơ', room_count: 6, created_at: now(), updated_at: now() },
  { id: 10, code: 'CG010', name: 'CineGo Hải Phòng', address: 'Tầng 2, Vincom Imperia, Q. Hồng Bàng', city_id: 5, city_name: 'Hải Phòng', room_count: 5, created_at: now(), updated_at: now() },
  { id: 11, code: 'CG011', name: 'CineGo Aeon Bình Dương', address: 'Tầng 2, AEON Mall Bình Dương Canary', city_id: 6, city_name: 'Bình Dương', room_count: 6, created_at: now(), updated_at: now() },
  { id: 12, code: 'CG012', name: 'CineGo Vincom Đồng Nai', address: 'Tầng 3, Vincom Plaza Đồng Nai, Biên Hòa', city_id: 7, city_name: 'Đồng Nai', room_count: 5, created_at: now(), updated_at: now() },
  { id: 13, code: 'CG013', name: 'CineGo Nha Trang Center', address: 'Tầng 4, Nha Trang Center, Khánh Hòa', city_id: 8, city_name: 'Khánh Hòa', room_count: 4, created_at: now(), updated_at: now() },
  { id: 14, code: 'CG014', name: 'CineGo Huế', address: 'Tầng 3, Vincom Plaza Huế', city_id: 11, city_name: 'Thừa Thiên Huế', room_count: 4, created_at: now(), updated_at: now() },
  { id: 15, code: 'CG015', name: 'CineGo Vũng Tàu', address: 'Tầng 2, Lotte Mart Vũng Tàu', city_id: 12, city_name: 'Vũng Tàu', room_count: 3, created_at: now(), updated_at: now() },
  { id: 16, code: 'CG016', name: 'CineGo Thanh Hóa', address: 'Tầng 3, Vincom Plaza Thanh Hóa', city_id: 14, city_name: 'Thanh Hóa', room_count: 4, created_at: now(), updated_at: now() },
  { id: 17, code: 'CG017', name: 'CineGo Đà Lạt', address: 'Tầng 2, Lotte Mart Đà Lạt', city_id: 16, city_name: 'Lâm Đồng', room_count: 4, created_at: now(), updated_at: now() },
  { id: 18, code: 'CG018', name: 'CineGo Long Xuyên', address: 'Tầng 3, Co.op Mart Long Xuyên', city_id: 17, city_name: 'An Giang', room_count: 3, created_at: now(), updated_at: now() },
  { id: 19, code: 'CG019', name: 'CineGo SC VivoCity', address: 'Tầng 4, SC VivoCity, Q. 7', city_id: 1, city_name: 'Hồ Chí Minh', room_count: 9, created_at: now(), updated_at: now() },
  { id: 20, code: 'CG020', name: 'CineGo Tràng Tiền', address: 'Tầng 2, Tràng Tiền Plaza, Hoàn Kiếm', city_id: 2, city_name: 'Hà Nội', room_count: 5, created_at: now(), updated_at: now() },
  { id: 21, code: 'CG021', name: 'CineGo Pandora', address: 'Tầng 5, Pandora City, Q. Tân Phú', city_id: 1, city_name: 'Hồ Chí Minh', room_count: 6, created_at: now(), updated_at: now() },
  { id: 22, code: 'CG022', name: 'CineGo Hùng Vương', address: 'Tầng 3, Lotte Mart Hùng Vương, Q. 11', city_id: 1, city_name: 'Hồ Chí Minh', room_count: 5, created_at: now(), updated_at: now() },
  { id: 23, code: 'CG023', name: 'CineGo Quảng Ninh', address: 'Tầng 2, Vincom Hạ Long', city_id: 10, city_name: 'Quảng Ninh', room_count: 4, created_at: now(), updated_at: now() },
  { id: 24, code: 'CG024', name: 'CineGo Mỹ Đình', address: 'Tầng B1, Vincom Mega Mall Mỹ Đình', city_id: 2, city_name: 'Hà Nội', room_count: 8, created_at: now(), updated_at: now() },
  { id: 25, code: 'CG025', name: 'CineGo Nguyễn Trãi', address: 'Số 1 Nguyễn Trãi, Thanh Xuân', city_id: 2, city_name: 'Hà Nội', room_count: 3, created_at: now(), updated_at: now() },
];

// CinemaRooms: schema DB = id, cinema_id, name, created_at, updated_at. room_type, seat_count, format, status cần thêm vào DB.
const rooms = [
  { id: 1, cinema_id: 25, name: 'Phòng 01', room_type: 'standard', seat_count: 80, format: 'imax', status: 'active', created_at: now(), updated_at: now() },
  { id: 2, cinema_id: 25, name: 'Phòng 02', room_type: 'gold_class', seat_count: 45, format: '2d', status: 'maintenance', created_at: now(), updated_at: now() },
  { id: 3, cinema_id: 25, name: 'Phòng 03', room_type: 'couple', seat_count: 30, format: '3d', status: 'pending', created_at: now(), updated_at: now() },
  { id: 4, cinema_id: 1, name: 'Phòng 01', room_type: 'standard', seat_count: 120, format: '2d', status: 'active', created_at: now(), updated_at: now() },
  { id: 5, cinema_id: 1, name: 'Phòng 02', room_type: 'standard', seat_count: 80, format: '3d', status: 'active', created_at: now(), updated_at: now() },
];

// Seats: schema DB = id, room_id (FK), row_label (varchar), number (int), type (enum: vip, couple, standard). is_active optional cho UI.
const seats = [];
let seatId = 1;
for (let row = 0; row < 10; row++) {
  const rowLabel = String.fromCharCode(65 + row);
  for (let num = 1; num <= 10; num++) {
    let type = 'standard';
    if (row < 2) type = 'vip';
    else if (row >= 8) type = 'couple';
    seats.push({ id: seatId++, room_id: 1, row_label: rowLabel, number: num, type, is_active: true });
  }
}
for (let row = 0; row < 5; row++) {
  const rowLabel = String.fromCharCode(75 + row);
  for (let num = 1; num <= 10; num++) {
    seats.push({ id: seatId++, room_id: 25, row_label: rowLabel, number: num, type: row === 0 ? 'vip' : row === 4 ? 'couple' : 'standard', is_active: true });
  }
}

// JSON Server cần export function trả về db (để hỗ trợ --watch)
module.exports = () => ({
  movies,
  genres,
  movieGenres,
  cities,
  cinemas,
  rooms,
  seats,
});
