import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly USER_KEY = 'user';

  private _user = signal<any>(this.loadFromStorage());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());
  readonly username = computed(() => this._user()?.username ?? '');

  private loadFromStorage() {
    const stored = localStorage.getItem(this.USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  setUser(userData: any) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    this._user.set(userData);
  }

  logout() {
    localStorage.removeItem(this.USER_KEY);
    this._user.set(null);
  }
}