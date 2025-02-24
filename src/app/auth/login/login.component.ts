import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, RouterModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  submitForm() {
    if (this.loginForm.invalid) {
      return;
    }

    this.http.post<{ token: string, role: string, id: number }>('http://localhost:8080/api/auth/authenticate', this.loginForm.value)
      .subscribe({
        next: (response) => {
          this.authService.setToken(response.token);
          this.authService.setRole(response.role);
          this.authService.setUserId(response.id);  
          
          if (response.role === 'ADMIN') {
            this.router.navigate(['/admin/movies']);
          } else {
            this.router.navigate(['/user/profile']);  
          }
        },
        error: err => {
          this.errorMessage = err.error.message || 'Ошибка входа. Попробуйте снова.';
        }
      });
  }
}