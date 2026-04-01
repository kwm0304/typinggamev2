import { Component } from '@angular/core';
import { LeaderboardEntry } from '../../types/gametypes';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard {
  leaderboardData: LeaderboardEntry[] = [
    { Rank: 1, Username: 'User1', WPM: 75, Accuracy: '95%', RawWPM: 80, PlayedAt: '2024-06-01' },
    { Rank: 2, Username: 'User2', WPM: 70, Accuracy: '90%', RawWPM: 78, PlayedAt: '2024-06-02' },
    { Rank: 3, Username: 'User3', WPM: 65, Accuracy: '85%', RawWPM: 72, PlayedAt: '2024-06-03' },
    // Add more entries as needed
  ];
}
