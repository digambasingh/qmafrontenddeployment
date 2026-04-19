import { Component, signal, AfterViewInit, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, GOOGLE_CLIENT_ID } from '../../services/auth.service';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  ngAfterViewInit(): void {
    this.initializeGoogleButton();
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg =
          err?.error?.message || err?.error?.error || 'Login failed. Please check your credentials.';
        this.errorMessage.set(msg);
      },
    });
  }

  private initializeGoogleButton(): void {
    if (typeof google === 'undefined') {
      // Retry after script loads
      setTimeout(() => this.initializeGoogleButton(), 500);
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => this.handleGoogleCredential(response),
    });

    const btnContainer = document.getElementById('google-signin-btn-login');
    if (btnContainer) {
      google.accounts.id.renderButton(btnContainer, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: '100%',
      });
    }
  }

  private handleGoogleCredential(response: any): void {
    this.ngZone.run(() => {
      this.isLoading.set(true);
      this.errorMessage.set('');

      this.authService.googleLogin(response.credential).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err?.error?.message || 'Google login failed. Please try again.');
        },
      });
    });
  }
}
