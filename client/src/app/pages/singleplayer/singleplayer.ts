import { Component } from '@angular/core';
import { GameSettings, Navbar } from "../../components/navbar/navbar";
import { Gameclock } from "../../components/gameclock/gameclock";
import { Gameboard } from '../../components/gameboard/gameboard';
@Component({
  selector: 'app-singleplayer',
  imports: [Navbar, Gameclock, Gameboard],
  templateUrl: './singleplayer.html',
  styleUrl: './singleplayer.css',
})
export class Singleplayer {
  isGameActive = false;
  isGameOver = false;
  isGameStale = false;
  externalGameEnd = false;
  gameSettings: GameSettings = {
    hasPunctuation: false,
    hasNumbers: false,
    middleKey: 'time',
    rightModifier: '30'
  };
  textWall='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

/*Takes in gameSettings from navbar, fetches text and passes to gameboard
  If the current game is active and there is a change in settings, pass externalGameEnd to gameboard */
  onGameSettingsChange(settings: GameSettings) {
    if (this.isGameActive && !this.isGameOver) {
      this.externalGameEnd = true;
      queueMicrotask(() => {
        this.externalGameEnd = false;
      });
    }
    this.gameSettings = settings;
  }
/*onGame.. and onGameIs.. functions take in state of current game from gameboard */
  onGameStart() {
    this.isGameActive = true;
    this.isGameOver = false;
  }

  onGameEnd() {
    this.isGameActive = false;
    this.isGameOver = true;
  }

  onIsGameActiveChange(isGameActive: boolean) {
    this.isGameActive = isGameActive;
    if (isGameActive) {
      this.isGameOver = false;
    }
  }

  onIsGameStaleChange(isGameStale: boolean) {
    this.isGameStale = isGameStale;
  }
}
