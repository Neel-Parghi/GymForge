export interface ApiResponse<T = any> {
  Success: boolean;
  Message: string;
  Data: T;
  Error: string | null;
  StatusCode: number;
  Timestamp: string;
}
