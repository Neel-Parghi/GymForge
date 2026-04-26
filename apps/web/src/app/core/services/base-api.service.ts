import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseApiService {
  protected http = inject(HttpClient);
  protected baseUrl = API_CONSTANTS.BASE_URL;

  protected get<T>(url: string, params?: any): Observable<T> {
    const httpParams = this.createHttpParams(params);
    return this.http.get<T>(`${this.baseUrl}${url}`, { params: httpParams });
  }

  protected getBlob(url: string, params?: any): Observable<Blob> {
    const httpParams = this.createHttpParams(params);
    return this.http.get(`${this.baseUrl}${url}`, { 
      params: httpParams, 
      responseType: 'blob' 
    });
  }

  protected post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${url}`, body);
  }

  protected put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${url}`, body);
  }

  protected delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${url}`);
  }

  private createHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.append(key, params[key]);
        }
      });
    }
    return httpParams;
  }
}
