import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./components/navbar/navbar";
import { TopMenu } from './components/top-menu/top-menu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, TopMenu],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('client');
}
