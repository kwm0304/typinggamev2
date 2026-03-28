import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopMenu } from './components/top-menu/top-menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopMenu],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('client');
  notifications: string[] = [];
  announcements: string[] = [];
  ngOnInit(): void {
    // make call for notifications
    this.notifications.push('Welcome to the Typing Game!');
    this.announcements.push('Sidebar works!');
    this.announcements.push('Type faster!')
  }
}
