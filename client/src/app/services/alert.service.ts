import { Injectable, signal } from '@angular/core';
import { AlertDTO, AlertType } from '../types/usertypes';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  alert = signal<AlertDTO | null>(null);

  show(message: string, type: AlertType, duration = 3000) {
    this.alert.set({ message, type });
    if (duration) {
      setTimeout(() => this.clear(), duration);
    }
  }

  clear() {
    this.alert.set(null);
  }
}
