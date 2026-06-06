import { AUTH_REALM } from './authSession';
import { createAuthStore } from './createAuthStore';

const useUserAuthStore = createAuthStore(AUTH_REALM.USER);

export default useUserAuthStore;
