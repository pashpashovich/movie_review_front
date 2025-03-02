import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Review {
  id: number;
  username: string; 
  movieName: string; 
  content: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
}

@Component({
  selector: 'app-review-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './review-management.component.html',
  styleUrls: ['./review-management.component.scss'],
})
export class ReviewManagementComponent implements OnInit {
  reviews: Review[] = [];
  statusOptions = [
    { value: 'APPROVED', label: 'Одобрено' },
    { value: 'REJECTED', label: 'Отклонено' },
  ];

  private http = inject(HttpClient);

  ngOnInit(): void {
    this.loadReviews();
  }

  loadReviews() {
    this.http.get<Review[]>('http://localhost:8080/api/admin/reviews').subscribe({
      next: (data) => {
        this.reviews = data.map((review) => ({
          id: review.id,
          username: review.username || 'Неизвестный пользователь', 
          movieName: review.movieName || 'Неизвестный фильм', 
          content: review.content,
          status: review.status || 'PENDING', 
        }));
      },
      error: (err) => console.error('Ошибка загрузки отзывов:', err),
    });
  }

  updateReviewStatus(reviewId: number, status: 'APPROVED' | 'REJECTED' | 'PENDING') {
    this.http
      .patch(`http://localhost:8080/api/admin/reviews/${reviewId}?status=${status}`, {})
      .subscribe({
        next: () => {
          console.log(`Статус отзыва ID ${reviewId} обновлен на ${status}`);
          this.reviews = this.reviews.map((review) =>
            review.id === reviewId ? { ...review, status } : review
          );
        },
        error: (err) => console.error('Ошибка обновления статуса отзыва:', err),
      });
  }
}
