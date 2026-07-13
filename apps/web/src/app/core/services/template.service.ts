import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { ApiResponse } from '../../shared/models/api-response.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class TemplateService extends BaseApiService {
  private templatesCache$: Observable<ApiResponse<unknown>> | null = null;

  constructor() {
    super();
  }

  getTemplates(): Observable<ApiResponse<unknown>> {
    if (!this.templatesCache$) {
      this.templatesCache$ = this.get<ApiResponse<unknown>>(API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE).pipe(
        shareReplay(1)
      );
    }
    return this.templatesCache$;
  }

  clearCache(): void {
    this.templatesCache$ = null;
  }

  getTemplateById(id: string): Observable<ApiResponse<unknown>> {
    return this.get<ApiResponse<unknown>>(`${API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE}/${id}`);
  }

  createTemplate(dto: unknown): Observable<ApiResponse<unknown>> {
    return this.post<ApiResponse<unknown>>(API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  updateTemplate(id: string, dto: unknown): Observable<ApiResponse<unknown>> {
    return this.put<ApiResponse<unknown>>(`${API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE}/${id}`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteTemplate(id: string): Observable<ApiResponse<unknown>> {
    return this.delete<ApiResponse<unknown>>(`${API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  testTemplate(id: string): Observable<ApiResponse<unknown>> {
    return this.post<ApiResponse<unknown>>(`${API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE}/${id}/test`, {});
  }
}
