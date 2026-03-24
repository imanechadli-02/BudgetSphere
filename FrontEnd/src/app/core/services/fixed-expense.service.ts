import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FixedExpense, PageResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FixedExpenseService {
  private apiUrl = 'http://localhost:8080/api/user/fixed-expenses';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 200): Observable<PageResponse<FixedExpense>> {
    return this.http.get<PageResponse<FixedExpense>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  create(data: any): Observable<FixedExpense> {
    return this.http.post<FixedExpense>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<FixedExpense> {
    return this.http.put<FixedExpense>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
