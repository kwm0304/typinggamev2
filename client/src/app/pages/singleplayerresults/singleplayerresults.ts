import { Component, OnInit, inject } from '@angular/core';
import { Location } from '@angular/common';
import { TestResults } from '../../types/gametypes';

@Component({
  selector: 'app-singleplayerresults',
  templateUrl: './singleplayerresults.html',
  styleUrl: './singleplayerresults.css',
})
export class Singleplayerresults implements OnInit {
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
  ngOnInit(): void {
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