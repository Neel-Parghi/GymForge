export const API_CONSTANTS = {
  BASE_URL: 'https://gymforge-lx4w.onrender.com',

  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  USER: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    INVITE_OWNER: '/api/users/invite-owner',
    RE_INVITE: '/api/users/re-invite',
    SET_PASSWORD: '/api/users/set-password',
    CHANGE_PASSWORD: '/api/users/change-password',
    VALIDATE_INVITATION: '/api/users/validate-invitation',
    UPLOAD_AVATAR: '/api/users/profile/upload-avatar'
  },
  GYM: {
    ONBOARD: '/api/gyms/onboard',
    UPDATE: '/api/gyms',
    LIST: '/api/gyms',
    DELETE: '/api/gyms',
    BRANCHES: '/api/gyms/{id}/branches'
  },
  GYM_OWNER: {
    LIST: '/api/gym-owners',
    UPDATE: '/api/gym-owners',
    DELETE: '/api/gym-owners',
  },
  PRICING: {
    LIST: '/api/saas-plans',
    GET: '/api/saas-plans',
    ADD: '/api/saas-plans',
    UPDATE: '/api/saas-plans',
    DELETE: '/api/saas-plans',
  },
  SUPER_ADMIN: {
    DASHBOARD: '/api/superadmin/dashboard/stats',
    REVENUE: '/api/superadmin/payments/stats',
    CONFIG: '/api/superadmin/config',
    REPORTS: {
      EXPORT: '/api/superadmin/reports/export'
    }
  },
  PAYMENTS: {
    STATS: '/api/payments/stats',
    TRANSACTIONS: '/api/payments/transactions',
    INITIATE: '/api/payments/initiate',
    VERIFY: '/api/payments/verify',
    SETTINGS: '/api/payments/settings',
    UPDATE_SAAS_CONFIG: '/api/payments/settings/update'
  }
};
