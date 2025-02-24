import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-genres',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss']
})
export class GenresComponent implements OnInit {
  genres: any[] = [];
  genreForm: FormGroup;
  searchForm: FormGroup;

  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  searchQuery: string = '';
  sortField: string = 'name';

  isEditing = false;
  selectedGenreId: number | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.genreForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    });

    this.searchForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadGenres(1);
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  loadGenres(page: number = 1) {
    this.currentPage = page;

    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", this.pageSize.toString())
      .set("sort", this.sortField);

    if (this.searchQuery.trim()) {
      params = params.set("search", this.searchQuery.trim());
    } else {
      params = params.set("search", "");  // Если пусто, отправляем пустой запрос
    }

    this.http.get<{ genres: any[], totalPages: number, currentPage: number }>(
      'http://localhost:8080/api/admin/genres/filter', {
        headers: this.getAuthHeaders(),
        params: params
      }).subscribe({
        next: (response) => {
          this.genres = response.genres || [];
          this.totalPages = response.totalPages || 1;
          this.currentPage = response.currentPage || 1;
        },
        error: (err) => console.error('Ошибка загрузки жанров:', err)
      });
  }

  searchGenres() {
    this.searchQuery = this.searchForm.value.search.trim();
    this.loadGenres(1);
  }

  resetSearch() {
    this.searchForm.reset();
    this.searchQuery = '';
    this.loadGenres(1);
  }

  changeSort(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      this.sortField = target.value;
      this.loadGenres(1);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.loadGenres(page);
    }
  }

  submitForm() {
    if (this.genreForm.invalid) return;

    const genreData = { name: this.genreForm.value.name };

    if (this.isEditing && this.selectedGenreId !== null) {
      this.http.put(`http://localhost:8080/api/admin/genres/${this.selectedGenreId}`, genreData, {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: () => {
          this.loadGenres(this.currentPage);
          this.resetForm();
        },
        error: (err) => console.error('Ошибка обновления жанра:', err)
      });
    } else {
      this.http.post<{ id: number }>('http://localhost:8080/api/admin/genres', genreData, {
        headers: this.getAuthHeaders()
      }).subscribe({
        next: () => {
          this.loadGenres(1);
          this.resetForm();
        },
        error: (err) => console.error('Ошибка создания жанра:', err)
      });
    }
  }

  editGenre(genre: any) {
    this.isEditing = true;
    this.selectedGenreId = genre.id;
    this.genreForm.patchValue({ name: genre.name });
  }

  deleteGenre(genreId: number) {
    this.http.delete(`http://localhost:8080/api/admin/genres/${genreId}`, {
      headers: this.getAuthHeaders()
    }).subscribe({
      next: () => this.loadGenres(this.currentPage),
      error: (err) => console.error('Ошибка удаления жанра:', err)
    });
  }

  resetForm() {
    this.genreForm.reset();
    this.isEditing = false;
    this.selectedGenreId = null;
  }
}
