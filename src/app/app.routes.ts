import { Routes } from '@angular/router';
import { Converter } from './components/converter/converter';
import { History } from './components/history/history';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { Profile } from './components/profile/profile';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Converter },
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'history', component: History, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
