import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faKeyboard, faCrown, faInfo, faGear, faBell, faUser, faComment, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-top-menu',
  imports: [FontAwesomeModule],
  templateUrl: './top-menu.html',
  styleUrl: './top-menu.css',
})
export class TopMenu {
  notifications = input<string[]>([]);
  announcements = input<string[]>([]);
  showSidebar: boolean = false;
  constructor(private faIconLibrary: FaIconLibrary, private router: Router) {
    this.faIconLibrary.addIcons(faKeyboard, faCrown, faInfo, faGear, faBell, faUser, faPaperPlane,faComment);
    this.router = router;
  }

  navigateToAuth() {
    this.router.navigate(['/auth']);
  }
  navigateToSettings() {
    this.router.navigate(['/settings']);
  }
  navigateToLeaderboard() {
    this.router.navigate(['/leaderboard']);
  }
  navigateToInfo() {
    this.router.navigate(['/info']);
  }
  navigateToSinglePlayer() {
    this.router.navigate(['/']);
  }
  toggleShowNotifications() {
    this.showSidebar = !this.showSidebar;
  }

  openSidebar() {
    this.showSidebar = true;
  }

  closeSidebar() {
    this.showSidebar = false;
  }

  onDrawerToggle(event: Event) {
    const target = event.target as HTMLInputElement | null;
    this.showSidebar = !!target?.checked;
  }
}
