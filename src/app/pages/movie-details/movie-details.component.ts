import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';

interface Review {
  username: string;
  rating: number;
  createdAt: string;
  content: string;
}

interface MovieDto {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  language: string;
  avgRating: number;
  poster?: string | null;
  genres: string[];
  directors: string[];
  actors: string[];
  producers: string[];
}

interface MovieDetailsDto {
  userId: number;
  movie: MovieDto;
  averageRating: number;
  reviews: Review[];
  inList: boolean;
  userRating?: number;
  ratingId?: number;
}

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss'],
})
export class MovieDetailsComponent implements OnInit {
  movie: MovieDto | null = null;
  reviews: Review[] = [];
  selectedRating = 0;
  ratingId: number | null = null;
  inList = false;
  averageRating: number | null = null;
  reviewForm: FormGroup;
  defaultPoster = 'assets/defaultPoster.png';

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  constructor() {
    this.reviewForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(10)]],
      rating: [1, Validators.required],
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      console.error('Не передан ID фильма');
      return;
    }
    this.loadMovie(id);
  }

  loadMovie(movieId: number) {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.warn('Пользователь не авторизован, загрузка фильма прервана');
      return;
    }
    this.http
      .get<MovieDetailsDto>(
        `http://localhost:8080/api/user/movies/movie/${movieId}?userId=${userId}`
      )
      .subscribe({
        next: (data) => {
          this.movie = data.movie;

          if (this.movie.poster) {
            this.movie.poster = `http://localhost:8081/api/images/${this.movie.poster}`;
          } else {
            this.movie.poster = this.defaultPoster;
          }

          this.selectedRating = data.userRating || 0;
          this.reviews = data.reviews || [];
          this.inList = data.inList;
          this.ratingId = data.ratingId || 0;
          this.averageRating = data.averageRating; 
                },
        error: (err) => console.error('Ошибка загрузки фильма:', err),
      });
  }

  selectRating(star: number) {
    this.selectedRating = star;
  }

  submitRating() {
    if (!this.movie) return;
    const url = this.ratingId
      ? `http://localhost:8080/api/user/movies/rate/${this.ratingId}`
      : `http://localhost:8080/api/user/movies/rate`;

    this.http[this.ratingId != 0 ? 'patch' : 'post'](url, {
      rating: this.selectedRating,
    }).subscribe({
      next: () => {
        console.log('Рейтинг успешно отправлен');
        this.loadMovie(this.movie!.id);
      },
      error: (err) => console.error('Ошибка при отправке рейтинга:', err),
    });
  }

  addToWatchlist() {
    if (!this.movie) return;
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Ошибка: пользователь не авторизован или нет userId');
      return;
    }

    this.http
      .post(
        'http://localhost:8080/api/user/watchlist/add',
        { userId, movieId: this.movie.id },
        { responseType: 'text' as const }
      )
      .subscribe({
        next: (msg: string) => {
          console.log('Ответ сервера:', msg);
          this.inList = true;
        },
        error: (err) => console.error('Ошибка:', err),
      });
  }

  submitReview() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.warn('Пользователь не авторизован, загрузка фильма прервана');
      return;
    }
    if (!this.movie || this.reviewForm.invalid) return;

    const { content, rating } = this.reviewForm.value;
    this.http
      .post(`http://localhost:8080/api/user/movies/review`, {
        userId: userId,
        movieId: this.movie.id,
        content: content,
        rating: rating,
      })
      .subscribe({
        next: () => {
          this.reviewForm.reset({ content: '', rating: 1 });
          this.loadMovie(this.movie!.id);
        },
        error: (err) => console.error('Ошибка при добавлении отзыва:', err),
      });
  }
}
