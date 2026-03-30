import { Component, inject, input, OnInit } from '@angular/core';
import { ResultTable } from '../../components/result-table/result-table';
import { CommonModule } from '@angular/common';
import { TestResults } from '../../types/gametypes';
import { Location } from '@angular/common';

@Component({
  selector: 'app-result',
  imports: [ResultTable, CommonModule],
  templateUrl: './result.html',
  styleUrl: './result.css',
  standalone: true,
})
export class Result implements OnInit {
  isSinglePlayer = input<boolean>();
private location = inject(Location);
  results: TestResults | null = null;
  accuracy: string = '';
  wpm: number = 0;
  testType: string = '';
  testModifier: string = '';
  hasPunctuation: boolean = false;
  hasNumbers: boolean = false;
  correctChars: number = 0;
  incorrectChars: number = 0
  extraChars: number = 0;
  missedChars: number = 0;
  timeTaken: number = 0;
  ngOnInit() {
    // Determine if the result is for single player or multiplayer based on route or data
    // For example, you could check the route parameters or a service that holds the game state
    // this.isSinglePlayer = someService.isSinglePlayer();
    const state = this.location.getState() as { gameStats?: TestResults };
    this.results = state?.gameStats ?? null;
    if (this.results) {
      this.accuracy = ((this.results.TestCharacters.correct / (this.results.TestCharacters.correct + this.results.TestCharacters.incorrect)) * 100).toFixed(2);
      this.wpm = this.results.rawWPM;
      this.testType = this.results.TestType.test;
      this.testModifier = this.results.TestType.modifier;
      this.hasPunctuation = this.results.hasPunctuation ?? false;
      this.hasNumbers = this.results.hasNumbers ?? false;
      this.correctChars = this.results.TestCharacters.correct;
      this.incorrectChars = this.results.TestCharacters.incorrect;
      this.extraChars = this.results.TestCharacters.extra;
      this.missedChars = this.results.TestCharacters.missed;
      this.timeTaken = this.results.timeTaken;
    }
  }
}
