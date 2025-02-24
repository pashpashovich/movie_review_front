import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './guards/auth.guard';
import { MoviesComponent } from './admin/movies/movies.component';
import { GenresComponent } from './pages/genres/genres.component';
import { PeopleComponent } from './pages/people/people.component';
import { UsersComponent } from './pages/users/users.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin/movies', component: MoviesComponent, canActivate: [AuthGuard]},
  { path: 'admin/genres', component: GenresComponent, canActivate: [AuthGuard]},
  { path: 'admin/people', component: PeopleComponent, canActivate: [AuthGuard]},
  { path: 'admin/users', component: UsersComponent, canActivate: [AuthGuard]},
  { path: 'user/profile', component: ProfileComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: 'login' }
];