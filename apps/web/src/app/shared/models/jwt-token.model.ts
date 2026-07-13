export interface JwtToken {
  role?: string;
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  userId?: string;
  nameid?: string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'?: string;
  sub?: string;
  id?: string;
  gymId?: string;
  branchId?: string;
  isOnboarded?: boolean;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}