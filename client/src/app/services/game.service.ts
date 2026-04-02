import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CharState, GameSettings, TestCharacters, TestResults } from '../types/gametypes';
import { Observable } from 'rxjs';

interface GameTextResponse {
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private http: HttpClient) {}
  private baseUrl = 'http://localhost:5262/api/Game';
  private readonly charsPerLine = 55;
  private readonly visibleLineCount = 3;

  /*------------API------------- */
  public getGameText(gameSettings: GameSettings): Observable<GameTextResponse> {
    const formattedGameSettings = this.formatDtoForServer(gameSettings);
    return this.http.post<GameTextResponse>(
      `${this.baseUrl}/create/singleplayer`,
      formattedGameSettings,
    );
  }
  public getMultiplayerGameText(): Observable<GameTextResponse> {
    return this.http.get<GameTextResponse>(`${this.baseUrl}/create/multiplayer`);
  }

  public saveSinglePlayerResult(resultData: any): Observable<object> {
    return this.http.post(`${this.baseUrl}/save/singleplayer`, resultData);
  }
  public saveMultiplayerResult(resultData: any): Observable<object> {
    return this.http.post(`${this.baseUrl}/save/multiplayer`, resultData);
  }
/*-----------API Helper------------- */
  public convertToTestResultDTO(testResults: TestResults, userId: string) {
    return {
      UserId: userId,
      WPM: parseFloat(testResults.wpm.toString()),
      RawWPM: testResults.rawWPM,
      Accuracy: parseFloat(testResults.accuracy?.toString() ?? '0'),
      TimeTaken: testResults.timeTaken,
      TestType: testResults.TestType.test,
      TestModifier: testResults.TestType.modifier,
      TestCharacters: {
        Correct: testResults.TestCharacters.correct,
        Incorrect: testResults.TestCharacters.incorrect,
        Extra: testResults.TestCharacters.extra,
        Missed: testResults.TestCharacters.missed,
      },
    };
  }
  public formatDtoForServer(gameSettings: GameSettings): any {
    return {
      HasPunctuation: gameSettings.hasPunctuation,
      HasNumbers: gameSettings.hasNumbers,
      IsTimed: gameSettings.middleKey === 'time',
      IsWords: gameSettings.middleKey === 'words',
      IsQuote: gameSettings.middleKey === 'quote',
      IsCustom: gameSettings.middleKey === 'custom',
      QuoteSize: gameSettings.middleKey === 'quote' ? gameSettings.rightModifier : undefined,
      GameTextLength:
        gameSettings.middleKey === 'words' ? parseInt(gameSettings.rightModifier, 10) : undefined,
      GameTimeLengthSeconds:
        gameSettings.middleKey === 'time' ? parseInt(gameSettings.rightModifier, 10) : undefined,
    };
  }
/*-----------In Game Helper functions------------- */
  public isGameSettingsUnchanged(current: GameSettings, next: GameSettings): boolean {
    return (
      current.hasPunctuation === next.hasPunctuation &&
      current.hasNumbers === next.hasNumbers &&
      current.middleKey === next.middleKey &&
      current.rightModifier === next.rightModifier
    );
  }

  public convertTime(modifier: string): number {
    switch (modifier) {
      case '10':
        return 10;
      case '30':
        return 30;
      case '60':
        return 60;
      default:
        return 30;
    }
  }
  public buildCharStates(textWall: string): CharState[] {
    return Array.from(textWall).map((char, i) => ({
      char,
      status: 'pending' as CharState['status'],
      isCurrent: i === 0,
    }));
  }

  public normalizeKey(key: string): string | null {
    if (key === 'Backspace') return 'Backspace';
    if (key.length === 1) return key;
    if (key === 'Enter') return '\n';
    return null;
  }

  public getVisibleText(charStates: CharState[], currentIndex: number): CharState[] {
    const windowSize = this.charsPerLine * this.visibleLineCount;
    const cursorLine = Math.floor(currentIndex / this.charsPerLine);
    const startLine = Math.max(0, cursorLine - 1);
    const requestedStart = startLine * this.charsPerLine;
    const maxStart = Math.max(0, charStates.length - windowSize);
    const startAt = Math.min(requestedStart, maxStart);
    const endAt = Math.min(charStates.length, startAt + windowSize);
    return charStates.slice(startAt, endAt);
  }

  public getVisibleTextString(arr: CharState[]): string {
    return arr.map((state) => state.char).join('');
  }

  public setCurrentIndex(arr: CharState[], currentIndex: number): CharState[] {
    return arr.map((state, index) => ({
      ...state,
      isCurrent: index === currentIndex,
    }));
  }

  public getFinalChars(charStateArr: CharState[], extraCount: number): TestCharacters {
    const correct = charStateArr.filter((c) => c.status === 'correct').length;
    const incorrect = charStateArr.filter((c) => c.status === 'incorrect').length;
    const missed = charStateArr.filter((c) => c.status === 'pending').length;
    return { correct, incorrect, extra: extraCount, missed };
  }

  public getRawWPM(seconds: number, correctNum: number): number {
    return seconds > 0 ? correctNum / 5 / (seconds / 60) : 0;
  }
  public getWPM(seconds: number, stats: TestCharacters): number {
    const grossWPM = this.getRawWPM(seconds, stats.correct);
    const accuracy = stats.correct + stats.incorrect > 0 ? stats.correct / (stats.correct + stats.incorrect) : 0;
    return Math.round(grossWPM * accuracy).toFixed(2) as unknown as number;
  }
}
