import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  constructor(private http: HttpClient) {}
  private baseUrl = 'http://localhost:5262/api/Leaderboard';

  public getLeaderboardForTimeFrame(timeFrame: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${timeFrame}`);
  }
}
