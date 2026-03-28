import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  effect,
  input,
  output,
} from '@angular/core';
import { FaIconLibrary, FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEarth } from '@fortawesome/free-solid-svg-icons';

interface UserInput {
  char: string;
  isCorrect: boolean;
  index: number;
}
interface CharState {
  correct: boolean;
  incorrect: boolean;
  active: boolean;
  index: number;
}
@Component({
  selector: 'app-gameboard',
  imports: [FaIconComponent],
  templateUrl: './gameboard.html',
  styleUrl: './gameboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gameboard implements OnInit, OnDestroy {
  text = input<string>('');

  externalGameEnd = input<boolean>(false);
  gameStart = output<void>();
  gameEnd = output<void>();
  isGameActiveChange = output<boolean>();
  isGameActive = false;
  isGameOver = false;

  isGameStaleChange = output<boolean>();
  isGameStale = false;
  staleTimeoutId: ReturnType<typeof setTimeout> | null = null;

  language = 'english';
  languages = [
    { label: 'english', value: 'english' },
    { label: 'spanish', value: 'spanish' },
    { label: 'french', value: 'french' },
    { label: 'german', value: 'german' },
    { label: 'italian', value: 'italian' },
  ];

  currentIndex = 0;
  intakeArray: string[] = [];
  charArray: CharState[] = [];
  inputArray: UserInput[] = [];

  constructor(
    private faIconLibrary: FaIconLibrary,
    private cdr: ChangeDetectorRef,
  ) {
    this.faIconLibrary.addIcons(faEarth);
    //setting and emitting game active to singleplayer
    effect(() => {
      if (!this.externalGameEnd()) {
        return;
      }
      if (this.isGameActive && !this.isGameOver) {
        this.isGameActive = false;
        this.isGameActiveChange.emit(this.isGameActive);
        this.clearStaleTimer();
        this.setGameStale(false);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.intakeArray = this.text().split('');
    this.charArray = this.intakeArray.map((char, index) => ({
      correct: false,
      incorrect: false,
      active: index === 0,
      index,
    }));

    document.addEventListener('keydown', this.onDocumentKeydown);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onDocumentKeydown);
    this.clearStaleTimer();
  }

  private evaluateInput(input: string, index: number) {
    const currentCharState = this.charArray[index];
    if (!currentCharState) {
      // No more characters to evaluate
      this.handleGameOver();
      this.cdr.markForCheck();
      return;
    }

    const expectedChar = this.intakeArray[index];
    const isCorrect = input === expectedChar;
    this.inputArray.push({ char: input, isCorrect, index });
    currentCharState.correct = isCorrect;
    currentCharState.incorrect = !isCorrect;
    let nextIndex = this.incrementCharIndex(index);
    let isGameOver = this.checkIsGameOver(nextIndex);
    if (isGameOver) {
      this.handleGameOver();
      return;
    }
  }
  private incrementCharIndex(index: number): number {
    const nextIndex = index + 1;
    this.setActiveIndex(nextIndex);
    return nextIndex;
  }
  private checkIsGameOver(nextIndex: number): boolean {
    if (this.charArray[nextIndex]) {
      return false;
    }
    return true;
  }

  public displayChar(index: number): string {
    return this.intakeArray[index] ?? '';
  }
  private selectLanguage() {}
  private isValidInput(event: KeyboardEvent): boolean {
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return false;
    }
    if (this.isGameOver) {
      return false;
    }
    if (event.key.length !== 1) {
      return false;
    }
    return true;
  }

  //Listening for the first keydown to start game
  onDocumentKeydown = (event: KeyboardEvent) => {
    if (this.isGameActive && !this.isGameOver) {
      this.setGameStale(false);
      this.startStaleTimer();
    }
    
    let isValid = this.isValidInput(event);
    if (!isValid) {
      return;
    }
    if (event.key === 'Backspace') {
      event.preventDefault();
      this.handleBackspace();
      return;
    }
    event.preventDefault();
    if (!this.isGameActive) {
      this.setStartGameState();
    }
    if (!this.isGameOver) {
      this.evaluateInput(event.key, this.currentIndex);
    }
  };
  private setStartGameState() {
    this.isGameActive = true;
    this.isGameActiveChange.emit(this.isGameActive);
    this.setGameStale(false);
    this.startStaleTimer();
    this.gameStart.emit();
  }

  private handleBackspace() {
    if (this.currentIndex === 0) {
      return;
    }

    const previousIndex = this.currentIndex - 1;
    const previousCharState = this.charArray[previousIndex];
    previousCharState.correct = false;
    previousCharState.incorrect = false;
    this.setActiveIndex(previousIndex);
    this.inputArray = this.inputArray.filter((item) => item.index < this.currentIndex);
    this.cdr.markForCheck();
  }

  private handleGameOver() {
    this.isGameActive = false;
    this.isGameActiveChange.emit(this.isGameActive);
    this.clearStaleTimer();
    this.setGameStale(false);
    this.isGameOver = true;
    this.gameEnd.emit();
    this.cdr.markForCheck();
  }

  /*if game is active and gameOver is false  and there is no input for 3 seconds, 
  mark game as stale and emit to singleplayer via setGameStale
  */
  private startStaleTimer() {
    this.clearStaleTimer();

    this.staleTimeoutId = setTimeout(() => {
      if (this.isGameActive && !this.isGameOver) {
        this.setGameStale(true);
      }
    }, 3000);
  }

  private clearStaleTimer() {
    if (this.staleTimeoutId) {
      clearTimeout(this.staleTimeoutId);
      this.staleTimeoutId = null;
    }
  }

  private setGameStale(isStale: boolean) {
    if (this.isGameStale === isStale) {
      return;
    }
    this.isGameStale = isStale;
    this.isGameStaleChange.emit(this.isGameStale);
    this.cdr.markForCheck();
  }

  private setActiveIndex(nextIndex: number) {
    for (const charState of this.charArray) {
      charState.active = false;
    }

    this.currentIndex = nextIndex;
    if (this.charArray[nextIndex]) {
      this.charArray[nextIndex].active = true;
    }

    this.cdr.markForCheck();
  }
}