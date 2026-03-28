import { Component, OnDestroy, OnInit } from '@angular/core';
import { Navbar } from "../../components/navbar/navbar";
import { Gameclock } from "../../components/gameclock/gameclock";
import { Gameboard } from '../../components/gameboard/gameboard';
import { GameSettings, TestCharacters, TestResults } from '../../types/gametypes';
import { Router } from '@angular/router';
@Component({
  selector: 'app-singleplayer',
  imports: [Navbar, Gameclock, Gameboard],
  templateUrl: './singleplayer.html',
  styleUrl: './singleplayer.css',
})
export class Singleplayer implements OnInit, OnDestroy {
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
  timeElapsed: number = 0;
  private internalTimerId: ReturnType<typeof setInterval> | null = null;
  canStartTime: boolean = false;
  pausedGameTime: number | null = null;
  gameTime: number = 30;
  gameStats: TestCharacters | null = null;
  textWall='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    //fetch text from api
    if (this.gameSettings.middleKey === 'time') {
      this.gameTime = this.convertTime(this.gameSettings.rightModifier);
    }
  }

  ngOnDestroy(): void {
    this.stopInternalTimer();
  }
/*Takes in gameSettings from navbar, fetches text and passes to gameboard
  If the current game is active and there is a change in settings, pass externalGameEnd to gameboard */
  onGameStats(stats: TestCharacters) {
    this.gameStats = stats;
  }
  onGameSettingsChange(settings: GameSettings) {
    if (this.isGameActive && !this.isGameOver) {
      this.externalGameEnd = true;
      setTimeout(() => {
        this.externalGameEnd = false;
      }, 0);
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
  public startInternalTimer() {
    this.stopInternalTimer();
    this.timeElapsed = 0;
    this.internalTimerId = setInterval(() => {
      this.timeElapsed++;
    }, 1000);
  }

  public stopInternalTimer() {
    if (this.internalTimerId) {
      clearInterval(this.internalTimerId);
      this.internalTimerId = null;
    }
  }
/*onGame.. and onGameIs.. functions take in state of current game from gameboard */
getFinalStats() {
  console.log('finalStats: ', this.gameStats);
  const gameStats = this.gameStats ?? {
    correct: 0,
    incorrect: 0,
    extra: 0,
    missed: 0,
  };
  const elapsedSeconds = this.timeElapsed || this.convertTime(this.gameSettings.rightModifier);
  const testResults: TestResults = {
    rawWPM: elapsedSeconds > 0 ? gameStats.correct / 5 / (elapsedSeconds / 60) : 0,
    timeTaken: elapsedSeconds,
    TestType: {
      test: this.gameSettings.middleKey,
      modifier: this.gameSettings.rightModifier
  },
    TestCharacters: gameStats,
    hasPunctuation: this.gameSettings.hasPunctuation,
    hasNumbers: this.gameSettings.hasNumbers
  };
  return testResults;
}
  onGameStart() {
    console.log('[Singleplayer] onGameStart received', {
      middleKey: this.gameSettings.middleKey,
      rightModifier: this.gameSettings.rightModifier,
      isGameStale: this.isGameStale,
    });
    if (this.gameSettings.middleKey !== 'time') {
      this.startInternalTimer();
    }
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
    console.log('[Singleplayer] onGameEnd received; navigating to results', {
      isGameActive: this.isGameActive,
      isGameOver: this.isGameOver,
      pausedGameTime: this.pausedGameTime,
    });
    this.isGameActive = false;
    this.isGameOver = true;
    this.externalGameEnd = false;
    this.canStartTime = false;
    this.stopInternalTimer();
    this.router.navigate(['/results'], {state: {gameStats: this.getFinalStats()}});
  }

  onTimeOut() {
    console.log('[Singleplayer] onTimeOut received; delegating end to gameboard');
    this.externalGameEnd = true;
    setTimeout(() => {
      this.externalGameEnd = false;
    }, 0);
  }

  onIsGameActiveChange(isGameActive: boolean) {
    console.log('[Singleplayer] isGameActiveChange received', { isGameActive });
    this.isGameActive = isGameActive;
    if (isGameActive) {
      this.isGameOver = false;
      return;
    }

    this.canStartTime = false;
    this.stopInternalTimer();
  }

  onIsGameStaleChange(isGameStale: boolean) {
    console.log('[Singleplayer] isGameStaleChange received', { isGameStale });
    setTimeout(() => {
      this.isGameStale = isGameStale;
    }, 0);
  }

  onPausedGameTimeChange(pausedGameTime: number) {
    this.pausedGameTime = pausedGameTime;
  }
}
