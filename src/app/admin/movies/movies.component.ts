import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-movies-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
})
export class MoviesComponent implements OnInit {
  movies: any[] = [];
  movieForm: FormGroup;
  genresList: string[] = [];
  actorsList: string[] = [];
  directorsList: string[] = [];
  producersList: string[] = [];
  isEditing = false;
  selectedMovieId: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.movieForm = this.fb.group({
      id: [''],
      title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
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

  loadMovies() {
    this.http
      .get<any[]>('http://localhost:8080/api/admin/movies', {
        headers: this.getAuthHeaders(),
      })
      .subscribe({
        next: (data) => {
          console.log("Полученные фильмы:", data); 
          this.movies = data.map(movie => ({
            ...movie,
            posterUrl: movie.poster ? `http://localhost:8081/api/images/${movie.poster}` : null
          }));
        },
        error: (err) => console.error('Ошибка загрузки фильмов:', err),
      });
  }

  loadData() {
    this.http
      .get<any[]>('http://localhost:8080/api/admin/genres', { headers: this.getAuthHeaders() })
      .subscribe(data => this.genresList = data.map(g => g.name));

    this.http
      .get<any[]>('http://localhost:8080/api/admin/people/actors', { headers: this.getAuthHeaders() })
      .subscribe(data => this.actorsList = data.map(a => a.fullName));

    this.http
      .get<any[]>('http://localhost:8080/api/admin/people/directors', { headers: this.getAuthHeaders() })
      .subscribe(data => this.directorsList = data.map(d => d.fullName));

    this.http
      .get<any[]>('http://localhost:8080/api/admin/people/producers', { headers: this.getAuthHeaders() })
      .subscribe(data => this.producersList = data.map(p => p.fullName));
  }

  submitForm() {
    if (this.movieForm.invalid) return;

    const movieData = {
      title: this.movieForm.value.title,
      description: this.movieForm.value.description,
      releaseYear: this.movieForm.value.releaseYear,
      duration: this.movieForm.value.duration,
      language: this.movieForm.value.language,
      genres: this.movieForm.value.genres,
      actors: this.movieForm.value.actors,
      directors: this.movieForm.value.directors,
      producers: this.movieForm.value.producers,
    };

    if (this.isEditing && this.selectedMovieId !== null) {
      this.http.put(`http://localhost:8080/api/admin/movies/${this.selectedMovieId}`, movieData, {
        headers: this.getAuthHeaders(),
      }).subscribe({
        next: () => {
          if (this.movieForm.value.posterFile) {
            this.uploadPoster(this.selectedMovieId);
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

  uploadPoster(movieId: number | null) {
    if (!movieId) {
      console.error("Ошибка: movieId не может быть null");
      return;
    }

    const posterFile = this.movieForm.value.posterFile;
    if (!posterFile) {
      console.warn("Нет файла для загрузки");
      return;
    }

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.movieForm.patchValue({ posterFile: file });
    }
  }

  resetForm() {
    this.movieForm.reset();
    this.isEditing = false;
    this.selectedMovieId = null;
  }

  editMovie(movie: any) {
    this.isEditing = true;
    this.selectedMovieId = movie.id;
    this.movieForm.patchValue(movie);
  }

  deleteMovie(movieId: number) {
    this.http.delete(`http://localhost:8080/api/admin/movies/${movieId}`, {
      headers: this.getAuthHeaders(),
    }).subscribe({
      next: () => this.loadMovies(),
      error: (err) => console.error('Ошибка удаления фильма:', err),
    });
  }
}
