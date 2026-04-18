/**
 * URL gốc cho Socket.IO: cùng host với API nhưng không gắn path REST (vd /api).
 * Có thể set riêng VITE_SOCKET_URL khi socket và API lệch đường dẫn trên proxy.
 */
export function getSocketServerUrl() {
  const explicit = import.meta.env.VITE_SOCKET_URL;
  if (explicit != null && String(explicit).trim() !== '') {
    return String(explicit).trim().replace(/\/+$/, '');
  }

  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  const trimmed = base.trim().replace(/\/+$/, '');

  try {
    const u = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    return `${u.protocol}//${u.host}`;
  } catch {
    return trimmed.replace(/\/api\/?$/i, '');
  }
}

/** Tùy chọn client Socket.IO ổn định sau reverse proxy (polling trước, rồi upgrade). */
export const defaultSocketOptions = {
  transports: ['polling', 'websocket'],
  upgrade: true,
  reconnection: false,
  timeout: 20000,
};
