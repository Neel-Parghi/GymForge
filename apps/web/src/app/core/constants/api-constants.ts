export const API_CONSTANTS = {
  BASE_URL: 'https://localhost:7184/api', // Replace with actual base URL
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/update',
    INVITE_OWNER: '/users/invite-owner',
    RE_INVITE: '/users/re-invite',
    SET_PASSWORD: '/users/set-password',
    VALIDATE_INVITATION: '/users/validate-invitation'
  },
  GYM: {
    ONBOARD: '/gyms/onboard',
    UPDATE: '/gyms',
    LIST: '/gyms',
    DELETE: '/gyms',
  },
  GYM_OWNER: {
    LIST: '/gym-owners',
    UPDATE: '/gym-owners',
    DELETE: '/gym-owners',
  },
  PRICING: {
    LIST: '/saas-plans',
    GET: '/saas-plans',
    ADD: '/saas-plans',
    UPDATE: '/saas-plans',
    DELETE: '/saas-plans',
  }
};
