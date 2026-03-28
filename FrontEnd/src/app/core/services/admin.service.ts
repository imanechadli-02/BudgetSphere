import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  toggleUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/toggle`, {});
  }

  createAdmin(data: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, data);
  }

  changeRole(id: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${id}/role?role=${role}`, {});
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}
