import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';
import { RouterModule } from '@angular/router';

interface WatchlistItem {
  movieId: number;
  movieTitle: string;
  poster?: string;
  posterUrl?: string;
  addedAt: string;
}

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
export class WatchlistComponent implements OnInit {
  watchlist: WatchlistItem[] = [];
  defaultPoster = 'assets/defaultPoster.png'; // ✅
  imageServiceUrl = 'http://localhost:8081/api/images/';

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadWatchlist();
  }

  loadWatchlist() {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Ошибка: пользователь не авторизован');
      return;
    }

    this.http
      .get<WatchlistItem[]>(
        `http://localhost:8080/api/user/watchlist/${userId}`
      )
      .subscribe({
        next: (data) => {
          this.watchlist = data.map((item) => ({
            ...item,
            posterUrl: item.poster
              ? `${this.imageServiceUrl}${item.poster}`
              : this.defaultPoster,
          }));
        },
        error: (err) => console.error('Ошибка загрузки избранного:', err),
      });
  }

  removeFromWatchlist(movieId: number) {
    const userId = this.authService.getUserId();
    if (!userId) {
      console.error('Ошибка: пользователь не авторизован');
      return;
    }

    this.http
      .delete(
        `http://localhost:8080/api/user/watchlist?userId=${userId}&movieId=${movieId}`,
        {
          responseType: 'text',
        }
      )
      .subscribe({
        next: () => {
          console.log('✅ Фильм удалён из избранного');
          this.watchlist = this.watchlist.filter(
            (item) => item.movieId !== movieId
          );
        },
        error: (err) =>
          console.error('❌ Ошибка при удалении фильма из избранного:', err),
      });
  }

  formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}