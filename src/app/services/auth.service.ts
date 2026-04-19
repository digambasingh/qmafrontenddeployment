import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError } from 'rxjs';

/* ─── Interfaces matching backend DTOs ─── */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponseData {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  message: string;
}

export interface ProfileUpdateRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RestResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* Google Client ID — MUST match backend's google.client-id */
export const GOOGLE_CLIENT_ID = '127502197321-asmrb0h36b23sb0dac5t3gempn5t8p2e.apps.googleusercontent.com';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // private readonly API_URL = 'http://3.108.135.101:8080/api/auth';
  // private readonly API_URL = 'http://localhost:8080/api/auth';
  private readonly API_URL = '/api/auth';
  private readonly TOKEN_KEY = 'quanment_token';
  private readonly USER_KEY = 'quanment_user';

  isAuthenticated = signal<boolean>(this.hasToken());
  currentUser = signal<AuthUser | null>(this.getStoredUser());

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: LoginRequest): Observable<RestResponse<AuthResponseData>> {
    return this.http
      .post<RestResponse<AuthResponseData>>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap((response) => this.handleAuth(response)),
        catchError((error) => {
          console.error('Login failed:', error);
          throw error;
        })
      );
  }

  signup(data: SignupRequest): Observable<RestResponse<AuthResponseData>> {
    return this.http
      .post<RestResponse<AuthResponseData>>(`${this.API_URL}/signup`, data)
      .pipe(
        tap((response) => this.handleAuth(response)),
        catchError((error) => {
          console.error('Signup failed:', error);
          throw error;
        })
      );
  }

  googleLogin(credential: string): Observable<RestResponse<AuthResponseData>> {
    return this.http
      .post<RestResponse<AuthResponseData>>(`${this.API_URL}/google`, { credential })
      .pipe(
        tap((response) => this.handleAuth(response)),
        catchError((error) => {
          console.error('Google login failed:', error);
          throw error;
        })
      );
  }

  getProfile(): Observable<RestResponse<AuthResponseData>> {
    return this.http.get<RestResponse<AuthResponseData>>(`${this.API_URL}/profile`);
  }

  updateProfile(data: ProfileUpdateRequest): Observable<RestResponse<AuthResponseData>> {
    return this.http
      .put<RestResponse<AuthResponseData>>(`${this.API_URL}/profile`, data)
      .pipe(tap((response) => this.handleAuth(response)));
  }

  changePassword(data: PasswordChangeRequest): Observable<RestResponse<string>> {
    return this.http.put<RestResponse<string>>(`${this.API_URL}/profile/password`, data);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  handleAuth(response: RestResponse<AuthResponseData>): void {
    const data = response.data;
    if (data.token) {
      localStorage.setItem(this.TOKEN_KEY, data.token);
    }
    const user: AuthUser = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
}
