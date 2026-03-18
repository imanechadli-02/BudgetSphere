import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, Transaction } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = 'http://localhost:8080/api/user/transactions';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 10, type?: string, category?: string): Observable<PageResponse<Transaction>> {
    let params = `page=${page}&size=${size}`;
    if (type) params += `&type=${type}`;
    if (category) params += `&category=${category}`;
    return this.http.get<PageResponse<Transaction>>(`${this.apiUrl}?${params}`);
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
