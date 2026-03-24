import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, SavingGoal } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SavingGoalService {
  private apiUrl = 'http://localhost:8080/api/user/saving-goals';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 100): Observable<PageResponse<SavingGoal>> {
    return this.http.get<PageResponse<SavingGoal>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  create(data: any): Observable<SavingGoal> {
    return this.http.post<SavingGoal>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<SavingGoal> {
    return this.http.put<SavingGoal>(`${this.apiUrl}/${id}`, data);
  }

  addContribution(id: number, amount: number): Observable<SavingGoal> {
    return this.http.patch<SavingGoal>(`${this.apiUrl}/${id}/contribute?amount=${amount}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
