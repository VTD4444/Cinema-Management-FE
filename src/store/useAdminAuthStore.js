import { AUTH_REALM } from './authSession';
import { createAuthStore } from './createAuthStore';

const useAdminAuthStore = createAuthStore(AUTH_REALM.ADMIN);

export default useAdminAuthStore;
