import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, Transaction } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = 'http://localhost:8080/api/user/transactions';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 5): Observable<PageResponse<Transaction>> {
    return this.http.get<PageResponse<Transaction>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }
}
