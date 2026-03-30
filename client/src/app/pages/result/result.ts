import { Component, inject, OnInit } from '@angular/core';
import { ResultTable } from '../../components/result-table/result-table';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { PlayerResults, TestResults } from '../../types/gametypes';

interface ResultViewModel {
  username: string;
  results: TestResults;
  accuracy: string;
  wpm: number;
  testType: string;
  testModifier: string;
  hasPunctuation: boolean;
  hasNumbers: boolean;
  correctChars: number;
  incorrectChars: number;
  extraChars: number;
  missedChars: number;
  timeTaken: number;
}

@Component({
  selector: 'app-result',
  imports: [ResultTable, CommonModule],
  templateUrl: './result.html',
  styleUrl: './result.css',
  standalone: true,
})
export class Result implements OnInit {
  private location = inject(Location);

  isSinglePlayer = true;
  playerResults: PlayerResults[] = [];
  winner: string = '';
  // each player gets their own mapped variables
  playerOne: ResultViewModel | null = null;
  playerTwo: ResultViewModel | null = null;

  ngOnInit() {
    const state = this.location.getState() as { playerResults?: PlayerResults[] };
    this.playerResults = state?.playerResults ?? [];
    this.isSinglePlayer = this.playerResults.length === 1;

    this.playerOne = this.playerResults[0]
      ? this.toViewModel(this.playerResults[0])
      : null;

    this.playerTwo = this.playerResults[1]
      ? this.toViewModel(this.playerResults[1])
      : null;
      this.winner = this.getWinner();
  }
public getWinner(): string {
  if (!this.isSinglePlayer && this.playerOne && this.playerTwo) {
    let p1Total = this.playerOne.results.rawWPM * parseFloat(this.playerOne.results.accuracy ?? '0');
    let p2Total = this.playerTwo.results.rawWPM * parseFloat(this.playerTwo.results.accuracy ?? '0');
    if (p1Total > p2Total) {
      return this.playerOne.username;
    } else if (p2Total > p1Total) {
      return this.playerTwo.username;
    } else {
      return 'Tie';
    }
  }
      return this.playerOne?.username || 'Unknown Player';

}
  private toViewModel(player: PlayerResults): ResultViewModel {
    const r = player.testResults;
    const totalTyped = r.TestCharacters.correct + r.TestCharacters.incorrect;
    const accuracy = totalTyped > 0
      ? ((r.TestCharacters.correct / totalTyped) * 100).toFixed(2)
      : '0.00';

    return {
      username: player.username,
      results: r,
      accuracy,
      wpm: r.rawWPM,
      testType: r.TestType.test,
      testModifier: r.TestType.modifier,
      hasPunctuation: r.hasPunctuation ?? false,
      hasNumbers: r.hasNumbers ?? false,
      correctChars: r.TestCharacters.correct,
      incorrectChars: r.TestCharacters.incorrect,
      extraChars: r.TestCharacters.extra,
      missedChars: r.TestCharacters.missed,
      timeTaken: r.timeTaken,
    };
  }
}