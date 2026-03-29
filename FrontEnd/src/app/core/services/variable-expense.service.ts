import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VariableExpense, PageResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VariableExpenseService {
  private apiUrl = `${environment.apiUrl}/api/user/expenses/variable`;

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 200): Observable<PageResponse<VariableExpense>> {
    return this.http.get<PageResponse<VariableExpense>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  create(data: any): Observable<VariableExpense> {
    return this.http.post<VariableExpense>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<VariableExpense> {
    return this.http.put<VariableExpense>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
