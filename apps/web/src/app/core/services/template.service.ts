import { Injectable } from '@angular/core';
import { Observable, shareReplay, tap } from 'rxjs';
import { API_CONSTANTS } from '../constants/api-constants';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class TemplateService extends BaseApiService {
  private templatesCache$: Observable<any> | null = null;

  constructor() {
    super();
  }

  getTemplates(): Observable<any> {
    if (!this.templatesCache$) {
      this.templatesCache$ = this.get(API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE).pipe(
        shareReplay(1)
      );
    }
    return this.templatesCache$;
  }

  clearCache(): void {
    this.templatesCache$ = null;
  }

  getTemplateById(id: string): Observable<any> {
    return this.get(`${API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE}/${id}`);
  }

  createTemplate(dto: any): Observable<any> {
    return this.post(API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  updateTemplate(id: string, dto: any): Observable<any> {
    return this.put(`${API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE}/${id}`, dto).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteTemplate(id: string): Observable<any> {
    return this.delete(`${API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE}/${id}`).pipe(
      tap(() => this.clearCache())
    );
  }

  testTemplate(id: string): Observable<any> {
    return this.post(`${API_CONSTANTS.ANNOUNCEMENT_TEMPLATES.BASE}/${id}/test`, {});
  }
}
