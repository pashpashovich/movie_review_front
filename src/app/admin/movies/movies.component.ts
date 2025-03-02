import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

// 🔹 Интерфейс для фильма (чтобы не было ошибок с типами)
interface Movie {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  language: string;
  genres: string[];
  actors: string[];
  directors: string[];
  producers: string[];
  poster?: string | null;
  posterUrl?: string;
}

@Component({
  selector: 'app-movies-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
})
export class MoviesComponent implements OnInit {
  movies: Movie[] = [];
  movieForm: FormGroup;
  genresList: string[] = [];
  actorsList: string[] = [];
  directorsList: string[] = [];
  producersList: string[] = [];
  isEditing = false;
  selectedMovieId: number | null = null;
  defaultPoster = 'assets/defaultPoster.png';

  totalPages: number = 1;
  currentPage: number = 1;
  pageSize: number = 5;
  pagesArray: number[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.movieForm = this.fb.group({
      id: [''],
      title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(300)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(600)]],
      releaseYear: [new Date().getFullYear(), [Validators.required, Validators.min(1895), Validators.max(2030)]],
      duration: [10, [Validators.required, Validators.min(10), Validators.max(600)]],
      language: ['', Validators.required],
      genres: [[], Validators.required],
      actors: [[], Validators.required],
      directors: [[], Validators.required],
      producers: [[], Validators.required],
      posterFile: [null],
    });
  }

  ngOnInit(): void {
    this.loadMovies();
    this.loadData();
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  loadMovies(page: number = 1): void {
    this.currentPage = page;
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', this.pageSize.toString());

    this.http.get<{ movies: Movie[], totalPages: number }>('http://localhost:8080/api/admin/movies', {
      headers: this.getAuthHeaders(),
      params
    }).subscribe({
      next: (data) => {
        console.log("Полученные фильмы:", data);

        this.movies = data.movies.map((movie: Movie) => ({
          ...movie,
          posterUrl: movie.poster ? `http://localhost:8081/api/images/${movie.poster}` : this.defaultPoster
        }));

        this.totalPages = data.totalPages || 1;
        this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      },
      error: (err) => console.error('Ошибка загрузки фильмов:', err),
    });
  }

  loadData(): void {
    this.http.get<string[]>('http://localhost:8080/api/admin/genres', { headers: this.getAuthHeaders() })
      .subscribe(data => this.genresList = data);

    this.http.get<{ fullName: string }[]>('http://localhost:8080/api/admin/people/actors', { headers: this.getAuthHeaders() })
      .subscribe(data => this.actorsList = data.map(a => a.fullName));

    this.http.get<{ fullName: string }[]>('http://localhost:8080/api/admin/people/directors', { headers: this.getAuthHeaders() })
      .subscribe(data => this.directorsList = data.map(d => d.fullName));

    this.http.get<{ fullName: string }[]>('http://localhost:8080/api/admin/people/producers', { headers: this.getAuthHeaders() })
      .subscribe(data => this.producersList = data.map(p => p.fullName));
  }

  submitForm(): void {
    if (this.movieForm.invalid) return;

    const movieData = { ...this.movieForm.value };
    delete movieData.posterFile;

    if (this.isEditing && this.selectedMovieId !== null) {
      this.http.put(`http://localhost:8080/api/admin/movies/${this.selectedMovieId}`, movieData, {
        headers: this.getAuthHeaders(),
      }).subscribe({
        next: () => {
          if (this.movieForm.value.posterFile) {
            this.uploadPoster(this.selectedMovieId!);
          } else {
            this.loadMovies();
            this.resetForm();
          }
        },
        error: (err) => console.error('Ошибка обновления фильма:', err),
      });
    } else {
      this.http.post<{ id: number }>('http://localhost:8080/api/admin/movies', movieData, {
        headers: this.getAuthHeaders(),
      }).subscribe({
        next: (response) => {
          if (this.movieForm.value.posterFile) {
            this.uploadPoster(response.id);
          } else {
            this.loadMovies();
            this.resetForm();
          }
        },
        error: (err) => console.error('Ошибка создания фильма:', err),
      });
    }
  }

  uploadPoster(movieId: number): void {
    const posterFile = this.movieForm.value.posterFile;
    if (!posterFile) return;

    const formData = new FormData();
    formData.append('posterFile', posterFile);

    this.http.post(`http://localhost:8080/api/admin/movies/${movieId}/poster`, formData, {
      headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('auth_token')}` }),
    }).subscribe({
      next: () => {
        this.loadMovies();
        this.resetForm();
      },
      error: (err) => console.error('Ошибка загрузки постера:', err),
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.movieForm.patchValue({ posterFile: file });
    }
  }

  resetForm(): void {
    this.movieForm.reset();
    this.isEditing = false;
    this.selectedMovieId = null;
  }

  editMovie(movie: Movie): void {
    this.isEditing = true;
    this.selectedMovieId = movie.id;
    this.movieForm.patchValue(movie);
  }

  deleteMovie(movieId: number): void {
    this.http.delete(`http://localhost:8080/api/admin/movies/${movieId}`, {
      headers: this.getAuthHeaders(),
    }).subscribe({
      next: () => this.loadMovies(),
      error: (err) => console.error('Ошибка удаления фильма:', err),
    });
  }

  goToPage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.loadMovies(page);
    }
  }
}