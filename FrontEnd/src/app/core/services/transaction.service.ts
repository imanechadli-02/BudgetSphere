import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, Transaction } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = 'http://localhost:8080/api/user/transactions';

  constructor(private http: HttpClient) {}

  getStats(): Observable<{ totalIncome: number; totalExpense: number; balance: number; transactionCount: number }> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getAll(page = 0, size = 10, type?: string, category?: string, from?: string, to?: string): Observable<PageResponse<Transaction>> {
    const base = type ? `${this.apiUrl}/type/${type}` : this.apiUrl;
    let params = `page=${page}&size=${size}`;
    if (from) params += `&from=${from}`;
    if (to) params += `&to=${to}`;
    return this.http.get<PageResponse<Transaction>>(`${base}?${params}`);
  }

  create(data: any): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
