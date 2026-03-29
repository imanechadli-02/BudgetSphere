import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Need, PageResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NeedService {
  private apiUrl = `${environment.apiUrl}/api/user/needs`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 100): Observable<PageResponse<Need>> {
    return this.http.get<PageResponse<Need>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  create(data: any): Observable<Need> {
    return this.http.post<Need>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<Need> {
    return this.http.put<Need>(`${this.apiUrl}/${id}`, data);
  }

  updateStatus(id: number, status: string): Observable<Need> {
    return this.http.patch<Need>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
