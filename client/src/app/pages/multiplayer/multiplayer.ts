import { Component, OnInit, OnDestroy, signal, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Gameboard } from '../../components/gameboard/gameboard';
import { Gameclock } from '../../components/gameclock/gameclock';
import { HubService } from '../../services/hub.service';
import { GameService } from '../../services/game.service';
import { UserService } from '../../services/user.service';
import { AlertService } from '../../services/alert.service';
import { CharState, CharStatus, GameSettings, PlayerResults, TestResults, TestCharacters } from '../../types/gametypes';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CountdownWindow } from "../../components/countdown-window/countdown-window";

@Component({
  selector: 'app-multiplayer',
  imports: [CommonModule, Gameboard, Gameclock, CountdownWindow],
  templateUrl: './multiplayer.html',
  styleUrl: './multiplayer.css',
  host: {
    '(window:keydown)': 'onKeydown($event)',
  },
})
export class Multiplayer implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Game state
  gameId: string | null = null;
  isGameActive = false;
  isGameOver = false;

  // Player data
  playerOne = signal<any>(null);
  playerTwo = signal<any>(null);
  currentPlayer: 'p1' | 'p2' = 'p1';

  // Game mechanics
  gameSettings: GameSettings = {
    hasPunctuation: false,
    hasNumbers: false,
    middleKey: 'time',
    rightModifier: '30',
  };

  // Text and char states
  textWall: string = '';
  playerOneCharStates: CharState[] = [];
  playerTwoCharStates: CharState[] = [];
  playerOneVisibleCharStates = signal<CharState[]>([]);
  playerTwoVisibleCharStates = signal<CharState[]>([]);

  // Tracking
  playerOneInput: (string | null)[] = [];
  playerTwoInput: (string | null)[] = [];
  playerOneIndex = 0;
  playerTwoIndex = 0;
  playerOneExtra = 0;
  playerTwoExtra = 0;

  // Timers
  elapsedSeconds = 0;
  remainingSeconds = signal(30);

  bothPlayersPresent: boolean = false;
  displayInstructions: boolean = false;
  countdownComplete = signal(false);

  @ViewChild('countdownModal') countdownModal!: ElementRef<HTMLDialogElement>;
  @ViewChild(CountdownWindow) countdownWindow?: CountdownWindow;
  private tickId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private hubService: HubService,
    private gameService: GameService,
    private userService: UserService,
    private alertService: AlertService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Subscribe to game match found
    this.hubService.game$
      .pipe(takeUntil(this.destroy$))
      .subscribe((game) => {
        if (game) {
          this.bothPlayersPresent = true;
          this.displayInstructions = true;
          this.countdownComplete.set(false);
          this.initializeGame(game);
          // Open modal after Angular renders it
          setTimeout(() => {
            this.countdownModal?.nativeElement.showModal();
            setTimeout(() => this.countdownWindow?.startCountdown(), 0);
          });
        }
      });

    // Start connection first
    this.hubService.startConnection().then(() => {
      // Register listeners AFTER connection is established
      this.hubService.onReceiveKeyUpdate((update) => {
        this.handleOpponentUpdate(update);
      });

      this.hubService.hubConnection.on('ReceiveVisibleTextUpdate', (payload: string) => {
        try {
          const charStates: CharState[] = JSON.parse(payload);
          if (this.currentPlayer === 'p1') {
            this.playerTwoVisibleCharStates.set(charStates);
          } else {
            this.playerOneVisibleCharStates.set(charStates);
          }
        } catch { 
          this.alertService.show('Error parsing opponent update', 'error');
         }
      });

      // P2 listens for game text from P1
      this.hubService.onReceiveGameText((text: string) => {
        this.textWall = text;
        this.resetGame();
      });

      this.startMatchmaking();
    });
  }

  private startMatchmaking(): void {
    const currentUser = this.userService.user();
    if (!currentUser) {
      this.alertService.show('User not logged in', 'error');
      this.router.navigate(['/auth']);
      return;
    }
    this.hubService.findMatch().catch((err) => {
      this.alertService.show('Error finding match: ' + err, 'error');
    });
  }

  private initializeGame(game: any): void {
    this.gameId = this.hubService.gameId$.getValue();
    this.playerOne.set(game.playerOne);
    this.playerTwo.set(game.playerTwo);

    // Determine which player is current user
    const currentUser = this.userService.user();
    const currentUsername = (currentUser?.username ?? currentUser?.Username ?? '').toLowerCase();
    this.currentPlayer = currentUsername === String(game.playerOne.username ?? '').toLowerCase() ? 'p1' : 'p2';

    if (this.currentPlayer === 'p1') {
      // P1 fetches text and sends it to P2 so both play the same text
      this.gameService.getGameText(this.gameSettings).subscribe((data) => {
        this.textWall = data.text;
        this.resetGame();
        this.hubService.sendGameText(this.gameId!, currentUsername || 'player', this.textWall);
        this.alertService.show('Match found! Game starting...', 'success');
      });
    } else {
      // P2 waits for text from P1 via ReceiveGameText listener
      this.alertService.show('Match found! Waiting for game text...', 'success');
    }
  }

  private resetGame(): void {
    this.stopTimer();
    this.isGameActive = false;
    this.isGameOver = false;
    this.elapsedSeconds = 0;
    this.remainingSeconds.set(this.gameService.convertTime(this.gameSettings.rightModifier));

    const charStates = this.gameService.buildCharStates(this.textWall);

    // Always initialize both boards with the same text
    this.playerOneCharStates = [...charStates];
    this.playerTwoCharStates = [...charStates];

    if (this.currentPlayer === 'p1') {
      this.playerOneInput = new Array(charStates.length).fill(null);
      this.playerOneIndex = 0;
      this.playerOneExtra = 0;
    } else {
      this.playerTwoInput = new Array(charStates.length).fill(null);
      this.playerTwoIndex = 0;
      this.playerTwoExtra = 0;
    }

    this.updatePlayerOneVisibleWindow();
    this.updatePlayerTwoVisibleWindow();
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.isGameOver || !this.gameId || !this.countdownComplete()) return;

    const key = this.gameService.normalizeKey(event.key);
    if (!key) return;
    event.preventDefault();

    if (this.currentPlayer === 'p1') {
      this.handlePlayerOneInput(key);
    } else {
      this.handlePlayerTwoInput(key);
    }

    // Check win condition
    if (this.gameSettings.middleKey !== 'time' && this.getCurrentIndex() >= this.getCharStates().length) {
      this.endGame();
    }
  }

  private handlePlayerOneInput(key: string): void {
    if (key === 'Backspace') {
      this.handlePlayerOneBackspace();
    } else {
      this.handlePlayerOneCharacter(key);
    }

    // Send update to opponent
    this.sendUpdateToOpponent();
  }

  private handlePlayerTwoInput(key: string): void {
    if (key === 'Backspace') {
      this.handlePlayerTwoBackspace();
    } else {
      this.handlePlayerTwoCharacter(key);
    }

    // Send update to opponent
    this.sendUpdateToOpponent();
  }

  private handlePlayerOneBackspace(): void {
    if (this.playerOneExtra > 0) {
      this.playerOneExtra--;
      return;
    }
    if (this.playerOneIndex === 0) return;

    this.playerOneIndex--;
    this.playerOneInput[this.playerOneIndex] = null;
    this.playerOneCharStates = this.playerOneCharStates.map((state, i) =>
      i === this.playerOneIndex ? { ...state, status: 'pending' as CharStatus } : state,
    );
    this.updatePlayerOneCurrentMarker();
  }

  private handlePlayerTwoBackspace(): void {
    if (this.playerTwoExtra > 0) {
      this.playerTwoExtra--;
      return;
    }
    if (this.playerTwoIndex === 0) return;

    this.playerTwoIndex--;
    this.playerTwoInput[this.playerTwoIndex] = null;
    this.playerTwoCharStates = this.playerTwoCharStates.map((state, i) =>
      i === this.playerTwoIndex ? { ...state, status: 'pending' as CharStatus } : state,
    );
    this.updatePlayerTwoCurrentMarker();
  }

  private handlePlayerOneCharacter(key: string): void {
    if (this.playerOneIndex >= this.playerOneCharStates.length) {
      this.playerOneExtra++;
      return;
    }

    this.playerOneInput[this.playerOneIndex] = key;
    const nextStatus: CharStatus = key === this.playerOneCharStates[this.playerOneIndex].char ? 'correct' : 'incorrect';
    this.playerOneCharStates = this.playerOneCharStates.map((state, i) =>
      i === this.playerOneIndex ? { ...state, status: nextStatus } : state,
    );
    this.playerOneIndex++;
    this.updatePlayerOneCurrentMarker();
  }

  private handlePlayerTwoCharacter(key: string): void {
    if (this.playerTwoIndex >= this.playerTwoCharStates.length) {
      this.playerTwoExtra++;
      return;
    }

    this.playerTwoInput[this.playerTwoIndex] = key;
    const nextStatus: CharStatus = key === this.playerTwoCharStates[this.playerTwoIndex].char ? 'correct' : 'incorrect';
    this.playerTwoCharStates = this.playerTwoCharStates.map((state, i) =>
      i === this.playerTwoIndex ? { ...state, status: nextStatus } : state,
    );
    this.playerTwoIndex++;
    this.updatePlayerTwoCurrentMarker();
  }

  private updatePlayerOneCurrentMarker(): void {
    this.playerOneCharStates = this.gameService.setCurrentIndex(this.playerOneCharStates, this.playerOneIndex);
    this.updatePlayerOneVisibleWindow();
  }

  private updatePlayerTwoCurrentMarker(): void {
    this.playerTwoCharStates = this.gameService.setCurrentIndex(this.playerTwoCharStates, this.playerTwoIndex);
    this.updatePlayerTwoVisibleWindow();
  }

  private updatePlayerOneVisibleWindow(): void {
    const visibleChars = this.gameService.getVisibleText(this.playerOneCharStates, this.playerOneIndex);
    this.playerOneVisibleCharStates.set(visibleChars);
  }

  private updatePlayerTwoVisibleWindow(): void {
    const visibleChars = this.gameService.getVisibleText(this.playerTwoCharStates, this.playerTwoIndex);
    this.playerTwoVisibleCharStates.set(visibleChars);
  }

  private sendUpdateToOpponent(): void {
    if (!this.gameId) return;

    const visibleChars = this.currentPlayer === 'p1'
      ? this.playerOneVisibleCharStates()
      : this.playerTwoVisibleCharStates();
    const payload = JSON.stringify(visibleChars);
    this.hubService.hubConnection.invoke('SendVisibleTextUpdate', this.gameId, payload).catch((err) => {
      console.error('Error sending text update:', err);
    });
  }

  private handleOpponentUpdate(_update: any): void {
    // Opponent charStates arrive via ReceiveVisibleTextUpdate listener (JSON)
  }

  private startGame(): void {
    this.isGameActive = true;
    this.isGameOver = false;
    this.startTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.tickId = setInterval(() => {
      this.elapsedSeconds++;

      if (this.gameSettings.middleKey === 'time') {
        this.remainingSeconds.update((seconds) => Math.max(0, seconds - 1));
        if (this.remainingSeconds() === 0) {
          this.endGame();
        }
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.tickId) {
      clearInterval(this.tickId);
      this.tickId = null;
    }
  }

  private getCharStates(): CharState[] {
    return this.currentPlayer === 'p1' ? this.playerOneCharStates : this.playerTwoCharStates;
  }

  private getCurrentIndex(): number {
    return this.currentPlayer === 'p1' ? this.playerOneIndex : this.playerTwoIndex;
  }

  private endGame(): void {
    if (this.isGameOver) return;

    this.isGameActive = false;
    this.isGameOver = true;
    this.stopTimer();

    const p1Stats = this.getPlayerStats('p1');
    const p2Stats = this.getPlayerStats('p2');  

    const playerResults: PlayerResults[] = [
      {
        username: this.playerOne()?.username,
        testResults: p1Stats,
      },
      {
        username: this.playerTwo()?.username,
        testResults: p2Stats,
      },
    ];

    // Disconnect from hub
    this.hubService.hubConnection.stop();

    this.router.navigate(['/result'], { state: { playerResults } });
  }

  private getPlayerStats(player: 'p1' | 'p2'): TestResults {
    const charStates = player === 'p1' ? this.playerOneCharStates : this.playerTwoCharStates;
    const extraCount = player === 'p1' ? this.playerOneExtra : this.playerTwoExtra;

    const stats = this.gameService.getFinalChars(charStates, extraCount);
    const totalSeconds =
      this.gameSettings.middleKey === 'time'
        ? this.gameService.convertTime(this.gameSettings.rightModifier)
        : this.elapsedSeconds;

    return {
      userName: this.userService.user()?.username,
      rawWPM: this.gameService.getRawWPM(totalSeconds, stats.correct),
      wpm: this.gameService.getWPM(totalSeconds, stats),
      timeTaken: totalSeconds,
      TestType: {
        test: this.gameSettings.middleKey,
        modifier: this.gameSettings.rightModifier,
      },
      TestCharacters: stats as TestCharacters,
      hasPunctuation: this.gameSettings.hasPunctuation,
      hasNumbers: this.gameSettings.hasNumbers,
    };
  }

  onCountdownClosed(): void {
    this.countdownModal?.nativeElement.close();
    this.countdownComplete.set(true);
    this.displayInstructions = false;
    this.startGame();
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
