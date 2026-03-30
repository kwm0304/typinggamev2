import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

type CharStatus = 'pending' | 'correct' | 'incorrect';

interface CharState {
  char: string;
  status: CharStatus;
  isCurrent: boolean;
}

@Component({
  selector: 'app-gameboard',
  imports: [],
  templateUrl: './gameboard.html',
  styleUrl: './gameboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gameboard {
  chars = input.required<CharState[]>();
}