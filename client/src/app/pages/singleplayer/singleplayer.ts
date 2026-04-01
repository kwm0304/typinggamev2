import { ChangeDetectorRef, Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Gameclock } from '../../components/gameclock/gameclock';
import { Gameboard } from '../../components/gameboard/gameboard';
import { CharState, CharStatus, GameSettings, PlayerResults, TestResults } from '../../types/gametypes';
import { Router } from '@angular/router';
import { GameService } from '../../services/game.service';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faEarthAfrica
} from '@fortawesome/free-solid-svg-icons';
import { HomeService } from '../../services/home.service';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-singleplayer',
  imports: [Navbar, Gameclock, Gameboard, FontAwesomeModule],
  templateUrl: './singleplayer.html',
  styleUrl: './singleplayer.css',
  host: {
    '(window:keydown)': 'onKeydown($event)',
  },
})
export class Singleplayer implements OnInit, OnDestroy {
  user: any;
  showLanguageModal = false;
  language: string = 'english';
   languages = [
    { label: 'english', value: 'english' },
    { label: 'spanish', value: 'spanish' },
    { label: 'french', value: 'french' }, 
    { label: 'german', value: 'german' },
    { label: 'italian', value: 'italian' },
  ];

  visibleText: string = '';
  visibleCharStates = signal<CharState[]>([]);
  isGameActive = false;
  isGameOver = false;
  isGameStale = signal(false);

  gameSettings: GameSettings = {
    hasPunctuation: false,
    hasNumbers: false,
    middleKey: 'time',
    rightModifier: '30',
  };

  textLoaded: boolean = false;

  textWall: string = '';
  charStates: CharState[] = [];
  userInput: (string | null)[] = [];
  currentIndex = 0;
  extraCount = 0;

  elapsedSeconds = 0;
  remainingSeconds = signal(30);
  private tickId: ReturnType<typeof setInterval> | null = null;
  private staleTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private router: Router,
    private gameService: GameService,
    private cdr: ChangeDetectorRef,
    private faIconLibrary: FaIconLibrary,
    private userService: UserService,
    private alertService: AlertService
  ) {
    this.faIconLibrary.addIcons(faEarthAfrica);
  }

  ngOnInit(): void {
    this.getGameText();
    if (this.userService.isLoggedIn()) {
      this.user = this.userService.user();
    }
  }

  getGameText() {
    this.gameService.getGameText(this.gameSettings).subscribe((data) => {
      this.textWall = data.text;
      this.textLoaded = true;
      this.resetRound();
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.clearStaleTimer();
  }

  isGameSettingsUnchanged(settings: GameSettings): boolean {
    return this.gameService.isGameSettingsUnchanged(this.gameSettings, settings);
  }

  onGameSettingsChange(settings: GameSettings) {
    const isUnchanged = this.isGameSettingsUnchanged(settings);
    if (isUnchanged) {
      return;
    }

    if (this.isGameActive) {
      this.resetRound();
    }
    this.gameSettings = settings;
    this.getGameText();
  }

  private resetRound() {
    this.stopTimer();
    this.clearStaleTimer();
    this.isGameActive = false;
    this.isGameOver = false;
    this.isGameStale.set(false);
    this.elapsedSeconds = 0;
    this.remainingSeconds.set(this.gameService.convertTime(this.gameSettings.rightModifier));
    this.currentIndex = 0;
    this.extraCount = 0;
    this.charStates = this.gameService.buildCharStates(this.textWall);
    this.userInput = new Array(this.charStates.length).fill(null);
    this.updateVisibleWindow();
  }

  onKeydown(event: KeyboardEvent) {
    if (this.isGameOver) return;
    const key = this.gameService.normalizeKey(event.key);
    if (!key) return;
    event.preventDefault();
    if (!this.isGameActive) {
      this.startGame();
    } else {
      if (this.isGameStale()) {
        this.isGameStale.set(false);
        this.startTimer();
      }
      this.startStaleTimer();
    }

    if (key === 'Backspace') {
      this.handleBackspace();
    } else {
      this.handleCharacter(key);
    }

    if (this.gameSettings.middleKey !== 'time' && this.currentIndex >= this.charStates.length) {
      this.endGame();
    }
  }

  private startGame() {
    this.isGameActive = true;
    this.isGameOver = false;
    this.isGameStale.set(false);
    this.startTimer();
    this.startStaleTimer();
  }

  private startTimer() {
    this.stopTimer();
    this.tickId = setInterval(() => {
      this.elapsedSeconds++;

      if (this.gameSettings.middleKey === 'time') {
        this.remainingSeconds.update((seconds) => Math.max(0, seconds - 1));
        if (this.remainingSeconds() === 0) {
          this.endGame();
        }
      }

      this.cdr.markForCheck();
    }, 1000);
  }

  private stopTimer() {
    if (this.tickId) {
      clearInterval(this.tickId);
      this.tickId = null;
    }
  }

  private startStaleTimer() {
    this.clearStaleTimer();

    this.staleTimeoutId = setTimeout(() => {
      if (this.isGameActive && !this.isGameOver) {
        this.isGameStale.set(true);
        this.stopTimer();
      }
    }, 3000);
  }



  private clearStaleTimer() {
    if (this.staleTimeoutId) {
      clearTimeout(this.staleTimeoutId);
      this.staleTimeoutId = null;
    }
  }

  private handleBackspace() {
    if (this.extraCount > 0) {
      this.extraCount--;
      return;
    }
    if (this.currentIndex === 0) return;

    this.currentIndex--;
    this.userInput[this.currentIndex] = null;
    this.charStates = this.charStates.map((state, i) =>
      i === this.currentIndex ? { ...state, status: 'pending' as CharStatus } : state,
    );
    this.updateCurrentMarker();
  }

  private handleCharacter(key: string) {
    if (this.currentIndex >= this.charStates.length) {
      this.extraCount++;
      return;
    }
    this.userInput[this.currentIndex] = key;
    const nextStatus: CharStatus = key === this.charStates[this.currentIndex].char ? 'correct' : 'incorrect';
    this.charStates = this.charStates.map((state, i) =>
      i === this.currentIndex ? { ...state, status: nextStatus } : state,
    );
    this.currentIndex++;
    this.updateCurrentMarker();
  }

  private updateCurrentMarker() {
    this.charStates = this.gameService.setCurrentIndex(this.charStates, this.currentIndex);
    this.updateVisibleWindow();
  }

  private updateVisibleWindow() {
    const visibleChars = this.gameService.getVisibleText(this.charStates, this.currentIndex);
    this.visibleCharStates.set(visibleChars);
    this.visibleText = this.gameService.getVisibleTextString(visibleChars);
    this.cdr.detectChanges();
  }
  
  private endGame() {
    if (this.isGameOver) return;

    this.isGameActive = false;
    this.isGameOver = true;
    this.isGameStale.set(false);
    this.stopTimer();
    this.clearStaleTimer();
    let playerResults: PlayerResults;
    if (!this.user) {
      playerResults = {
        username: 'Player 1',
        testResults: this.getFinalStats(),
      };
    } else {
      playerResults = {
        username: this.user.username,
        testResults: this.getFinalStats(),
      };
      const testCharacters = {
        Correct: playerResults.testResults.TestCharacters.correct,
        Incorrect: playerResults.testResults.TestCharacters.incorrect,
        Extra: playerResults.testResults.TestCharacters.extra,
        Missed: playerResults.testResults.TestCharacters.missed,
      }
      const testResultDTO = {
        UserId: this.user.userId,
        WPM: parseFloat(playerResults.testResults.wpm.toString()),
        RawWPM: playerResults.testResults.rawWPM,
        Accuracy: parseFloat(playerResults.testResults.accuracy?.toString() ?? '0'),
        TimeTaken: playerResults.testResults.timeTaken,
        TestType: playerResults.testResults.TestType.test,
        TestModifier: playerResults.testResults.TestType.modifier,
        TestCharacters: testCharacters,
      }
      this.gameService.saveSinglePlayerResult(testResultDTO).subscribe((data) => {
        this.alertService.show('Your result has been saved!', 'success');
      }, (error) => {
        this.alertService.show('Error saving result: ' + error.message, 'error');
      })
    }
    

    this.router.navigate(['/results'], { state: { playerResults: [playerResults] } });
  }

  private getFinalStats(): TestResults {
    const stats = this.gameService.getFinalChars(this.charStates, this.extraCount);
    const totalSeconds =
      this.gameSettings.middleKey === 'time'
        ? this.gameService.convertTime(this.gameSettings.rightModifier)
        : this.elapsedSeconds;
/*userName: string;
  rawWPM: number;
  wpm: number;
  timeTaken: number;
  TestType: TestType;
  TestCharacters: TestCharacters;
  hasPunctuation?: boolean;
  hasNumbers?: boolean;
  accuracy?: string; */
  const totalTyped = stats.correct + stats.incorrect;
    const accuracy = totalTyped > 0 ? ((stats.correct / totalTyped) * 100).toFixed(2) : '0.00';
    return {

      userName: this.user.username,
      rawWPM: this.gameService.getRawWPM(totalSeconds, stats.correct),
      wpm: this.gameService.getWPM(totalSeconds, stats),
      timeTaken: totalSeconds,
      TestType: {
        test: this.gameSettings.middleKey,
        modifier: this.gameSettings.rightModifier,
      },
      TestCharacters: stats,
      hasPunctuation: this.gameSettings.hasPunctuation,
      hasNumbers: this.gameSettings.hasNumbers,
      accuracy: accuracy,
    };
  }

  public toggleShowModal() {
    this.showLanguageModal = true;
  }
   public selectLanguage(language: string) {
    this.language = language;
    this.showLanguageModal = false;
  }
}