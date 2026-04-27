export const API_CONSTANTS = {
  BASE_URL: 'https://gymforge-lx4w.onrender.com/api',

  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    INVITE_OWNER: '/users/invite-owner',
    RE_INVITE: '/users/re-invite',
    SET_PASSWORD: '/users/set-password',
    CHANGE_PASSWORD: '/users/change-password',
    VALIDATE_INVITATION: '/users/validate-invitation',
    UPLOAD_AVATAR: '/users/profile/upload-avatar'
  },
  GYM: {
    ONBOARD: '/gyms/onboard',
    UPDATE: '/gyms',
    LIST: '/gyms',
    DELETE: '/gyms',
    BRANCHES: '/gyms/{id}/branches'
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
  },
  SUPER_ADMIN: {
    DASHBOARD: '/superadmin/dashboard/stats',
    REVENUE: '/superadmin/payments/stats',
    CONFIG: '/superadmin/config',
    REPORTS: {
      EXPORT: '/superadmin/reports/export'
    }
  },
  PAYMENTS: {
    STATS: '/payments/stats',
    TRANSACTIONS: '/payments/transactions',
    INITIATE: '/payments/initiate',
    VERIFY: '/payments/verify',
    SETTINGS: '/payments/settings',
    UPDATE_SAAS_CONFIG: '/payments/settings/update'
  }
};
