import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthUser } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  firstName = '';
  lastName = '';
  email = '';
  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  isProfileLoading = signal(false);
  isPasswordLoading = signal(false);
  profileMessage = signal('');
  profileError = signal('');
  passwordMessage = signal('');
  passwordError = signal('');

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.firstName = user.firstName;
      this.lastName = user.lastName;
      this.email = user.email;
    }
  }

  updateProfile(): void {
    if (!this.firstName || !this.lastName || !this.email) {
      this.profileError.set('Please fill in all fields.');
      return;
    }

    this.isProfileLoading.set(true);
    this.profileError.set('');
    this.profileMessage.set('');

    this.authService
      .updateProfile({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
      })
      .subscribe({
        next: (res) => {
          this.isProfileLoading.set(false);
          this.profileMessage.set(res.data?.message ?? 'Profile updated successfully!');
        },
        error: (err) => {
          this.isProfileLoading.set(false);
          this.profileError.set(err?.error?.message ?? 'Failed to update profile.');
        },
      });
  }

  changePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      this.passwordError.set('Please fill in all fields.');
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError.set('New passwords do not match.');
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError.set('New password must be at least 6 characters.');
      return;
    }

    this.isPasswordLoading.set(true);
    this.passwordError.set('');
    this.passwordMessage.set('');

    this.authService
      .changePassword({
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.isPasswordLoading.set(false);
          this.passwordMessage.set('Password changed successfully!');
          this.currentPassword = '';
          this.newPassword = '';
          this.confirmNewPassword = '';
        },
        error: (err) => {
          this.isPasswordLoading.set(false);
          this.passwordError.set(err?.error?.message ?? 'Failed to change password.');
        },
      });
  }
}
