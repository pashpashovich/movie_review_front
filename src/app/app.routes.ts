import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { MoviesComponent } from './admin/movies/movies.component';
import { GenresComponent } from './pages/genres/genres.component';
import { PeopleComponent } from './pages/people/people.component';
import { UsersComponent } from './pages/users/users.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { UserMoviesComponent } from './pages/user-movies/user-movies.component';
import { MovieDetailsComponent } from './pages/movie-details/movie-details.component';
import { WatchlistComponent } from './pages/watchlist/watchlist.component';
import { ReviewManagementComponent } from './pages/review-management/review-management.component';
import { AdminGuard } from './guards/admin.guard';
import { UserGuard } from './guards/user.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin/movies',
    component: MoviesComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/genres',
    component: GenresComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'admin/people',
    component: PeopleComponent,
    canActivate: [AdminGuard],
  },
  { path: 'admin/users', component: UsersComponent, canActivate: [AdminGuard] },
  {
    path: 'user/profile',
    component: ProfileComponent,
    canActivate: [UserGuard],
  },
  {
    path: 'user/movies',
    component: UserMoviesComponent,
    canActivate: [UserGuard],
  },
  {
    path: 'user/watchlist',
    component: WatchlistComponent,
    canActivate: [UserGuard],
  },
  {
    path: 'user/movies/:id',
    component: MovieDetailsComponent,
    canActivate: [UserGuard],
  },
  {
    path: 'admin/reviews',
    component: ReviewManagementComponent,
    canActivate: [AdminGuard],
  },
  { path: 'access-denied', component: AccessDeniedComponent },
  { path: '**', redirectTo: 'login' },
];