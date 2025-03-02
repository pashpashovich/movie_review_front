import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface Movie {
  id: number;
  title: string;
  genres: string[];
  language: string;
  releaseYear: number;
  duration: number;
  poster?: string | null;    
  posterUrl?: string;          
}

@Component({
  selector: 'app-user-movies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-movies.component.html',
  styleUrls: ['./user-movies.component.scss'],
})
export class UserMoviesComponent implements OnInit {
  movies: Movie[] = [];
  recommendations: Movie[] = [];
  genres: any[] = [];
  totalPages: number = 1;
  currentPage: number = 1;

  filterForm: FormGroup;

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  constructor() {
    this.filterForm = this.fb.group({
      searchQuery: [''],
      genre: [''],
      language: [''],
      year: [''],
      duration: [''],
    });
  }

  ngOnInit(): void {
    this.loadMovies();
    this.loadGenres();
  }

  loadMovies(page: number = 1) {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Ошибка: ID пользователя не найден.');
      return;
    }

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', '9');

    if (this.filterForm.value.searchQuery?.trim()) {
      params = params.set('searchQuery', this.filterForm.value.searchQuery.trim());
    }
    if (this.filterForm.value.genre) {
      params = params.set('genreId', this.filterForm.value.genre);
    }
    if (this.filterForm.value.language) {
      params = params.set('language', this.filterForm.value.language);
    }
    if (this.filterForm.value.year) {
      params = params.set('year', this.filterForm.value.year.toString());
    }
    if (this.filterForm.value.duration) {
      params = params.set('duration', this.filterForm.value.duration.toString());
    }

    console.log('Отправка запроса:', params.toString());

    this.http.get<any>(`http://localhost:8080/api/user/movies/${userId}`, {
      params: params,
    })
    .subscribe({
      next: (data) => {
        this.movies = data.movies.map((movie: Movie) => ({
          ...movie,
          posterUrl: movie.poster 
            ? `http://localhost:8081/api/images/${movie.poster}`
            : 'assets/defaultPoster.png',
        }));
        
        this.recommendations = data.recommendations.map((rec: Movie) => ({
          ...rec,
          posterUrl: rec.poster 
            ? `http://localhost:8081/api/images/${rec.poster}`
            : 'assets/defaultPoster.png',
        }));

        this.genres = data.genres;
        this.totalPages = data.totalPages;
        this.currentPage = page;
      },
      error: (err) => console.error('Ошибка загрузки фильмов:', err),
    });
  }

  loadGenres() {
    this.http.get<any[]>('http://localhost:8080/api/admin/genres', {
    }).subscribe({
      next: (data) => (this.genres = data),
      error: (err) => console.error('Ошибка загрузки жанров:', err),
    });
  }

  applyFilters() {
    this.loadMovies(1);
  }

  resetFilters() {
    this.filterForm.reset();
    this.loadMovies(1);
  }

  goToPage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.loadMovies(page);
    }
  }
}