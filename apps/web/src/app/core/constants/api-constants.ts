export const API_CONSTANTS = {
  BASE_URL: 'https://localhost:7184/api', // Replace with actual base URL
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update',
    INVITE_OWNER: '/user/invite-owner',
    RE_INVITE: '/user/re-invite',
    SET_PASSWORD: '/user/set-password',
    VALIDATE_INVITATION: '/user/validate-invitation'
  },
  GYM: {
    ONBOARD: '/gym/onboard',
  },
};
