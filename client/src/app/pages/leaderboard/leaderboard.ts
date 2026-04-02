import { Component, OnInit } from '@angular/core';
import { LeaderboardEntry } from '../../types/gametypes';
import { CommonModule } from '@angular/common';
import { LeaderboardService } from '../../services/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard  implements OnInit{
  leaderboardData: LeaderboardEntry[] = [
    { rank: 1, username: 'User1', wpm: 75, accuracy: 95, rawWPM: 80, playedAt: '2024-06-01' },
    { rank: 2, username: 'User2', wpm: 70, accuracy: 90, rawWPM: 78, playedAt: '2024-06-02' },
    { rank: 3, username: 'User3', wpm: 65, accuracy: 85, rawWPM: 72, playedAt: '2024-06-03' },
    // Add more entries as needed
  ];
  timeFilters = [
    { index: 0, label: 'All Time' },
    { index: 1, label: 'Monthly' },
    { index: 2, label: 'Weekly' },
  ];
  selectedTimeFilter: string = '';
  constructor(private leaderboardService: LeaderboardService) {

  }
  ngOnInit(): void {
    this.selectedTimeFilter = this.timeFilters[0].label;
    this.getLeaderboardForSelectedTimeFrame();
  }
  public selectTimeFrame(filter: string) {
    this.selectedTimeFilter = filter;
    this.getLeaderboardForSelectedTimeFrame();
  }
  public getLeaderboardForSelectedTimeFrame() {
    const timeFrameIndex = this.convertTimeFrameToIndex(this.selectedTimeFilter);
    this.leaderboardService.getLeaderboardForTimeFrame(timeFrameIndex).subscribe((data) => {
      this.leaderboardData = data;
    });
  }

  convertTimeFrameToIndex(timeFrame: string): number {
    switch (timeFrame) {
      case 'All Time':
        return 0;
      case 'Monthly':
        return 2;
      case 'Weekly':
        return 1;
      default:
        return 0;
    }
  }
}
