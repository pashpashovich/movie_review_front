import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  loadUsers() {
    this.http.get<any[]>('http://localhost:8080/api/admin/users', { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => this.users = data,
        error: (err) => console.error('Ошибка загрузки пользователей:', err),
      });
  }

  deleteUser(userId: number) {
    this.http.delete(`http://localhost:8080/api/admin/users/${userId}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => {
          this.loadUsers(); 
        },
        error: (err) => console.error('Ошибка удаления пользователя:', err),
      });
  }

  updateUserStatus(userId: number, action: string) {
    this.http.patch(`http://localhost:8080/api/admin/users/${userId}?action=${action}`, {}, { headers: this.getAuthHeaders() })
      .subscribe({
        next: () => {
          this.loadUsers(); 
        },
        error: (err) => console.error(`Ошибка при выполнении действия '${action}' для пользователя:`, err),
      });
  }
}