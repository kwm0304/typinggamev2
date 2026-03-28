import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faKeyboard, faCrown, faInfo, faGear, faBell, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-top-menu',
  imports: [FontAwesomeModule],
  templateUrl: './top-menu.html',
  styleUrl: './top-menu.css',
})
export class TopMenu {
  constructor(private faIconLibrary: FaIconLibrary, private router: Router) {
    this.faIconLibrary.addIcons(faKeyboard, faCrown, faInfo, faGear, faBell, faUser);
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
    
  }
}
