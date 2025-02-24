import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  user: any = {};
  recentReviews: any[] = [];

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadProfile();
    this.loadRecentReviews();
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  loadProfile() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Ошибка: ID пользователя не найден.');
      return;
    }

    this.http
      .get<any>(`http://localhost:8080/api/user/profile/${userId}`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => (this.user = data),
        error: (err) => console.error('Ошибка загрузки профиля:', err),
      });
  }

  loadRecentReviews() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Ошибка: ID пользователя не найден.');
      return;
    }

    this.http
      .get<any[]>(`http://localhost:8080/api/user/${userId}/reviews`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (data) => (this.recentReviews = data),
        error: (err) => console.error('Ошибка загрузки отзывов:', err),
      });
  }

  formatDateTime(dateString: string): string {
    return formatDate(dateString, 'dd.MM.yyyy HH:mm', 'ru-RU');
  }
}