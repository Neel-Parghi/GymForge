export const API_CONSTANTS = {
  //BASE_URL: 'https://localhost:7184/api/',
  BASE_URL: 'https://gymforge-lx4w.onrender.com/api/',


  AUTH: {
    LOGIN: 'auth/login',
    REGISTER: 'auth/register',
    REGISTER_SUPERADMIN: 'auth/register-superadmin',
    LOGOUT: 'auth/logout',
    REFRESH: 'auth/refresh',
    ME: 'auth/me'
  },
  USER: {
    PROFILE: 'users/profile',
    UPDATE_PROFILE: 'users/profile',
    INVITE_OWNER: 'users/invite-owner',
    RE_INVITE: 'users/re-invite',
    SET_PASSWORD: 'users/set-password',
    CHANGE_PASSWORD: 'users/change-password',
    VALIDATE_INVITATION: 'users/validate-invitation',
    UPLOAD_AVATAR: 'users/profile/upload-avatar'
  },
  GYM: {
    ONBOARD: 'gyms/onboard',
    UPDATE: 'gyms',
    LIST: 'gyms',
    DELETE: 'gyms',
    BRANCHES: 'gyms/{id}/branches',
    MY_GYM: 'my-gym',
    MY_BRANCHES: 'my-gym/branches'
  },
  GYM_OWNER: {
    LIST: 'gym-owners',
    UPDATE: 'gym-owners',
    DELETE: 'gym-owners',
  },
  PRICING: {
    LIST: 'saas-plans',
    GET: 'saas-plans',
    ADD: 'saas-plans',
    UPDATE: 'saas-plans',
    DELETE: 'saas-plans',
  },
  SUPER_ADMIN: {
    DASHBOARD: 'superadmin/dashboard/stats',
    REVENUE: 'superadmin/payments/stats',
    CONFIG: 'superadmin/config',
    REPORTS: {
      EXPORT: 'superadmin/reports/export'
    }
  },
  MEMBERS: {
    ONBOARD: 'members',
    LIST: 'members',
    GET: 'members',
    UPDATE: 'members',
    TOGGLE_STATUS: 'members/{id}/status/toggle',
    FREEZE: 'members/{id}/status/freeze',
    UNFREEZE: 'members/{id}/status/unfreeze',
    RENEW: 'members/{id}/subscriptions',
    DELETE: 'members',
    SUBSCRIPTION_HISTORY: 'members/{id}/subscriptions',
    EXPORT: 'members/export',
    MEASUREMENTS: 'members/{memberId}/measurements',
  },
  STAFF: {
    BASE: 'staff',
    LIST: 'staff',
  },
  INVENTORY: {
    PRODUCTS: 'inventory/products',
    EQUIPMENT: 'equipment',
    SALES: 'inventory/sales',
    SALES_HISTORY: 'inventory/sales/history',
    MAINTENANCE: 'maintenance',
    MAINTENANCE_HISTORY: 'maintenance/history',
    STATS: 'inventory/stats'
  },
  PAYMENTS: {
    STATS: 'payments/stats',
    TRANSACTIONS: 'payments/transactions',
    INITIATE: 'payments/initiate',
    VERIFY: 'payments/verify',
    SETTINGS: 'payments/settings',
    UPDATE_SAAS_CONFIG: 'payments/settings/update'
  },
  GYM_PLAN: {
    GET: 'gym-plans',
    LIST: 'gym-plans',
    ADD: 'gym-plans',
    UPDATE: 'gym-plans',
    DELETE: 'gym-plans',
  },
  COMMON: {
    UPLOAD: 'fileupload'
  }
};
