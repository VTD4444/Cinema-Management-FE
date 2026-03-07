/**
 * Chạy JSON Server với custom routes /api/v1/* để khớp VITE_API_BASE_URL.
 * Chạy: npm run mock:api
 */
const jsonServer = require('json-server');
const path = require('path');

const getDb = require(path.join(__dirname, 'mockData.cjs'));
const db = typeof getDb === 'function' ? getDb() : getDb;

const server = jsonServer.create();
const router = jsonServer.router(db);
const rewriter = jsonServer.rewriter({
  '/api/v1/movies/:id': '/movies/:id',
  '/api/v1/movies': '/movies',
  '/api/v1/genres/:id': '/genres/:id',
  '/api/v1/genres': '/genres',
  '/api/v1/movieGenres': '/movieGenres',
  '/api/v1/cities/:id': '/cities/:id',
  '/api/v1/cities': '/cities',
  '/api/v1/cinemas/:id': '/cinemas/:id',
  '/api/v1/cinemas': '/cinemas',
  '/api/v1/rooms/:id': '/rooms/:id',
  '/api/v1/rooms': '/rooms',
  '/api/v1/seats/:id': '/seats/:id',
  '/api/v1/seats': '/seats',
});

const PORT = 8080;

server.use(jsonServer.defaults());
server.use(rewriter);
server.use(router);

server.listen(PORT, () => {
  console.log(`Mock API đang chạy: http://localhost:${PORT}/api/v1`);
  console.log('  - GET/POST   /api/v1/movies');
  console.log('  - GET/PUT/DELETE /api/v1/movies/:id');
  console.log('  - GET        /api/v1/genres');
  console.log('  - GET/POST   /api/v1/cities');
  console.log('  - GET/PUT/DELETE /api/v1/cities/:id');
  console.log('  - GET/POST   /api/v1/cinemas');
  console.log('  - GET/PUT/DELETE /api/v1/cinemas/:id');
  console.log('  - GET/POST   /api/v1/rooms');
  console.log('  - GET/PUT/DELETE /api/v1/rooms/:id');
  console.log('  - GET/POST   /api/v1/seats');
  console.log('  - GET/PUT/DELETE /api/v1/seats/:id');
});
