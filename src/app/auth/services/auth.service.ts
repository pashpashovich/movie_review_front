import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private tokenKey = 'auth_token';
  private roleKey = 'user_role';

  setToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  clearToken() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
  }

  setRole(role: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.roleKey, role);
    }
  }

  getRole(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.roleKey);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout() {
    this.clearToken();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.roleKey);
    }
  }
}
