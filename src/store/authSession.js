export const AUTH_REALM = {
  USER: 'user',
  ADMIN: 'admin',
};

export const TOKEN_KEYS = {
  [AUTH_REALM.USER]: 'userAccessToken',
  [AUTH_REALM.ADMIN]: 'adminAccessToken',
};

export const STORAGE_KEYS = {
  [AUTH_REALM.USER]: 'user-auth-storage',
  [AUTH_REALM.ADMIN]: 'admin-auth-storage',
};

const LEGACY_TOKEN_KEY = 'accessToken';
const LEGACY_ROLE_KEY = 'userRole';
const LEGACY_STORAGE_KEY = 'auth-storage';

export const getAuthRealmFromPath = (pathname = '') =>
  pathname.startsWith('/admin') ? AUTH_REALM.ADMIN : AUTH_REALM.USER;

export const getAccessToken = (realm) => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEYS[realm]);
};

export const setAccessToken = (realm, token) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEYS[realm], token);
};

export const clearAccessToken = (realm) => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEYS[realm]);
};

export const hasSession = (realm) => Boolean(getAccessToken(realm));

export const hasUserSession = () => hasSession(AUTH_REALM.USER);

export const hasAdminSession = () => hasSession(AUTH_REALM.ADMIN);

/** Chuyển session cũ (accessToken + auth-storage) sang user/admin riêng biệt */
export const migrateLegacyAuth = () => {
  if (typeof window === 'undefined') return;

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  const legacyStorage = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!legacyToken && !legacyStorage) return;

  const role = localStorage.getItem(LEGACY_ROLE_KEY);
  const realm = role === 'ADMIN' ? AUTH_REALM.ADMIN : AUTH_REALM.USER;

  if (legacyToken && !getAccessToken(realm)) {
    setAccessToken(realm, legacyToken);
  }

  if (legacyStorage && !localStorage.getItem(STORAGE_KEYS[realm])) {
    localStorage.setItem(STORAGE_KEYS[realm], legacyStorage);
  }

  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_ROLE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
};
