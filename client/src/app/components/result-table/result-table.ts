import { Component, input } from '@angular/core';

@Component({
  selector: 'app-result-table',
  imports: [],
  templateUrl: './result-table.html',
  styleUrl: './result-table.css',
})
export class ResultTable {
  hasPunctuation = input<boolean>();
  hasNumbers = input<boolean>();
  wpm = input<number>();
  accuracy = input<string>();
  correctChars = input<number>();
  incorrectChars = input<number>();
  extraChars = input<number>();
  missedChars = input<number>();
  timeTaken = input<string>();
  testType = input<string>();
  testModifier = input<string>();
}
