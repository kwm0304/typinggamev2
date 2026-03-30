import { Component, input } from '@angular/core';
import { Router } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faKeyboard, faCrown, faInfo, faGear, faBell, faUser, faComment, faPaperPlane, faUsers } from '@fortawesome/free-solid-svg-icons';

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
  private _router: Router;
  constructor(private faIconLibrary: FaIconLibrary, private router: Router) {
    this.faIconLibrary.addIcons(faKeyboard, faCrown, faInfo, faGear, faBell, faUser,faUsers, faPaperPlane,faComment);
    this._router = router;
  }

  navigateToAuth() {
    this._router.navigate(['/auth']);
  }
  navigateToSettings() {
    this._router.navigate(['/settings']);
  }
  navigateToLeaderboard() {
    this._router.navigate(['/leaderboard']);
  }
  navigateToInfo() {
    this._router.navigate(['/info']);
  }
  navigateToSinglePlayer() {
    this._router.navigate(['/']);
  }
  navigateToMultiplayer() {
    this._router.navigate(['/multiplayer']);
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
