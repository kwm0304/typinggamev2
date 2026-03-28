import { Component, OnInit } from '@angular/core';
import { Navbar } from "../../components/navbar/navbar";
import { Gameclock } from "../../components/gameclock/gameclock";
import { Gameboard } from '../../components/gameboard/gameboard';
import { GameSettings } from '../../types/gametypes';
@Component({
  selector: 'app-singleplayer',
  imports: [Navbar, Gameclock, Gameboard],
  templateUrl: './singleplayer.html',
  styleUrl: './singleplayer.css',
})
export class Singleplayer implements OnInit{
  isGameActive = false;
  isGameOver = false;
  isGameStale = false;
  externalGameEnd = false;
  gameSettings: GameSettings ={
    hasPunctuation: false,
    hasNumbers: false,
    middleKey: 'time',
    rightModifier: '30'
  }
  canStartTime: boolean = false;
  pausedGameTime: number | null = null;
  gameTime: number = 30;
  textWall='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  ngOnInit(): void {
    //fetch text from api
    if (this.gameSettings.middleKey === 'time') {
      this.gameTime = this.convertTime(this.gameSettings.rightModifier);
    }
  }
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
  convertTime(modifier: string): number {
    switch (modifier) {
      case '10':
        return 10;
      case '30':
        return 30;
      case '60':
        return 60;
      default:
        return 30;
    }
  }
/*onGame.. and onGameIs.. functions take in state of current game from gameboard */
  onGameStart() {
    this.isGameActive = true;
    this.isGameOver = false;

    if (this.gameSettings.middleKey === 'time') {
      if (!this.isGameStale) {
        this.gameTime = this.convertTime(this.gameSettings.rightModifier);
        this.pausedGameTime = null;
      }

      this.canStartTime = false;
      queueMicrotask(() => {
        this.canStartTime = true;
      });
    }
  }

  onGameEnd() {
    this.isGameActive = false;
    this.isGameOver = true;
    this.canStartTime = false;
  }

  onIsGameActiveChange(isGameActive: boolean) {
    this.isGameActive = isGameActive;
    if (isGameActive) {
      this.isGameOver = false;
      return;
    }

    this.canStartTime = false;
  }

  onIsGameStaleChange(isGameStale: boolean) {
    this.isGameStale = isGameStale;
  }

  onPausedGameTimeChange(pausedGameTime: number) {
    this.pausedGameTime = pausedGameTime;
  }
}
