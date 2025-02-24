import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
})
export class PeopleComponent implements OnInit {
  people: any[] = [];
  roles: string[] = ['PRODUCER', 'DIRECTOR', 'ACTOR'];
  totalPages: number = 1;
  currentPage: number = 1;
  searchQuery: string = '';
  roleFilter: string = '';
  personForm: FormGroup;
  isEditing = false;
  selectedPersonId: number | null = null;
  errorMessage: string = ''; 

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.personForm = this.fb.group({
      id: [''],
      fullName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      role: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadPeople();
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  loadPeople() {
    const params = new HttpParams()
      .set('search', this.searchQuery)
      .set('role', this.roleFilter || '')
      .set('page', this.currentPage.toString())
      .set('size', '10');

    this.http.get<any>('http://localhost:8080/api/admin/people', { headers: this.getAuthHeaders(), params })
      .subscribe({
        next: (data) => {
          this.people = data.content;
          this.totalPages = data.totalPages;
          this.currentPage = data.number + 1;
        },
        error: (err) => console.error('Ошибка загрузки людей:', err),
      });
  }

  searchPeople() {
    this.currentPage = 1;
    this.loadPeople();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPeople();
    }
  }

  submitForm() {
    if (this.personForm.invalid) {
      this.errorMessage = 'Пожалуйста, исправьте ошибки в форме.';
      return;
    }

    this.errorMessage = ''; 

    const personData = {
      fullName: this.personForm.value.fullName,
      role: this.personForm.value.role,
    };

    if (this.isEditing && this.selectedPersonId !== null) {
      this.http.put(`http://localhost:8080/api/admin/people/${this.selectedPersonId}`, personData, {
        headers: this.getAuthHeaders(),
      }).subscribe({
        next: () => {
          this.loadPeople();
          this.resetForm();
        },
        error: (err) => this.handleError(err),
      });
    } else {
      this.http.post('http://localhost:8080/api/admin/people', personData, {
        headers: this.getAuthHeaders(),
      }).subscribe({
        next: () => {
          this.loadPeople();
          this.resetForm();
        },
        error: (err) => this.handleError(err),
      });
    }
  }

  handleError(err: any) {
    if (err.status === 400 && err.error) {
      this.errorMessage = err.error.message || 'Ошибка валидации. Проверьте введенные данные.';
    } else {
      this.errorMessage = 'Произошла ошибка. Попробуйте снова.';
    }
  }

  editPerson(person: any) {
    this.isEditing = true;
    this.selectedPersonId = person.id;
    this.personForm.patchValue({ fullName: person.fullName, role: person.role });
  }

  deletePerson(personId: number) {
    this.http.delete(`http://localhost:8080/api/admin/people/${personId}`, {
      headers: this.getAuthHeaders(),
    }).subscribe({
      next: () => this.loadPeople(),
      error: (err) => console.error('Ошибка удаления человека:', err),
    });
  }

  resetForm() {
    this.personForm.reset();
    this.isEditing = false;
    this.selectedPersonId = null;
    this.errorMessage = ''; 
  }
}
