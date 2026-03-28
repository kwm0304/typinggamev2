import { ChangeDetectorRef, Component, OnDestroy, effect, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-gameclock',
  imports: [],
  templateUrl: './gameclock.html',
  styleUrl: './gameclock.css',
})
export class Gameclock implements OnDestroy {
  startTime = input<number>(30);
  canStartTimer = input<boolean>(false);
  isGameStale = input<boolean>(false);
  pausedGameTimeChange = output<number>();
  timeOut = output<void>();
  remainingSeconds = signal(0);
  timerRunning = signal(false);
  isTimeOut = signal(false);
  pausedGameTime: number = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private cdr: ChangeDetectorRef) {
    //canStartTimer is set based on keyDown
    effect(() => {
      if (this.canStartTimer()) {
        this.startTimer();
      }
    });
    //if game is stale, pause timer and emit to singleplayer to be passed in as next start time
    effect(() => {
      if (this.isGameStale()) {
        this.pausedGameTime = this.remainingSeconds();
        this.pausedGameTimeChange.emit(this.pausedGameTime);
      }
    });
  }
  startTimer() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.remainingSeconds.set(this.startTime());
    this.isTimeOut.set(false);
    this.timerRunning.set(true);

    this.intervalId = setInterval(() => {
      if (this.remainingSeconds() > 0) {
        this.remainingSeconds.update((value) => Math.max(0, value - 1));
      } else {
        this.isTimeOut.set(true);
        this.timerRunning.set(false);
        console.log('[Gameclock] timeout reached; emitting timeOut');
        this.timeOut.emit();
        if (this.intervalId) clearInterval(this.intervalId);
      }
      this.cdr.markForCheck();
    }, 1000);
  }
  

  ngOnDestroy() {
    if (this.timerRunning() && this.remainingSeconds() > 0) {
      this.pausedGameTime = this.remainingSeconds();
      this.pausedGameTimeChange.emit(this.pausedGameTime);
    }
    if (this.intervalId) clearInterval(this.intervalId);
  }
}