import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-gameclock',
  imports: [],
  templateUrl: './gameclock.html',
  styleUrl: './gameclock.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gameclock {
  startTime = input<number>(30);
}