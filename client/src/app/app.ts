import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopMenu } from './components/top-menu/top-menu';
import { AlertService } from './services/alert.service';
import { Alert } from "./components/alert/alert";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopMenu, Alert],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('client');
  notifications: string[] = [];
  announcements: string[] = [];
  constructor(public alertService: AlertService) {}
  ngOnInit(): void {
    // make call for notifications
    this.notifications.push('Welcome to the Typing Game!');
    this.announcements.push('Sidebar works!');
    this.announcements.push('Type faster!')
  }
}
