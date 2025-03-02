import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userId: number | null = null;
  private userRole: 'USER' | 'ADMIN' | null = null;

  constructor() {
    this.loadAuthData();
  }

  private loadAuthData() {
    if (typeof localStorage !== 'undefined') {
      this.userId = Number(localStorage.getItem('userId'));
      this.userRole = localStorage.getItem('userRole') as 'USER' | 'ADMIN' | null;
    }
  }

  setToken(token: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  setRole(role: 'USER' | 'ADMIN') {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userRole', role);
    }
    this.userRole = role;
  }

  setUserId(userId: number) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userId', userId.toString());
    }
    this.userId = userId;
  }

  getToken(): string | null {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : null;
  }

  getUserId(): number | null {
    return this.userId;
  }

  getUserRole(): 'USER' | 'ADMIN' | null {
    return this.userRole;
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  isUser(): boolean {
    return this.getUserRole() === 'USER';
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
    }
    this.userId = null;
    this.userRole = null;
  }
}