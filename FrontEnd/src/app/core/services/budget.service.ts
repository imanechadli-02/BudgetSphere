import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, PageResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private apiUrl = 'http://localhost:8080/api/user/budgets';

  constructor(private http: HttpClient) {}

  getAll(): Observable<PageResponse<Budget>> {
    return this.http.get<PageResponse<Budget>>(`${this.apiUrl}?page=0&size=100`);
  }

  create(data: any): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
