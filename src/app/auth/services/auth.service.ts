import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private tokenKey = 'auth_token';
  private roleKey = 'user_role';
  private userIdKey = 'user_id';  

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

  setUserId(userId: number) { 
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userIdKey, userId.toString());
    }
  }

  getUserId(): number | null {  
    if (isPlatformBrowser(this.platformId)) {
      const id = localStorage.getItem(this.userIdKey);
      return id ? Number(id) : null;
    }
    return null;
  }

  logout() {
    this.clearToken();
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.roleKey);
      localStorage.removeItem(this.userIdKey);
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
