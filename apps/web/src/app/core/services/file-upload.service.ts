import { Injectable } from '@angular/core';
import { BaseApiService } from './base-api.service';
import { API_CONSTANTS } from '../constants/api-constants';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService extends BaseApiService {

  uploadFile(file: File, folder: string = 'general'): Observable<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.post<ApiResponse<{ url: string }>>(`${API_CONSTANTS.COMMON.UPLOAD}?folder=${folder}`, formData);
  }
}
