import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageResponse, SavingGoal } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SavingGoalService {
  private apiUrl = 'http://localhost:8080/api/user/saving-goals';

  constructor(private http: HttpClient) {}

  getAll(page = 0, size = 5): Observable<PageResponse<SavingGoal>> {
    return this.http.get<PageResponse<SavingGoal>>(`${this.apiUrl}?page=${page}&size=${size}`);
  }
}
