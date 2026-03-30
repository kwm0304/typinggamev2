import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GameService } from './game.service';
import { GameSettings } from '../types/gametypes';

describe('GameService', () => {
  let service: GameService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GameService],
    });
    service = TestBed.inject(GameService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createGame', () => {
    it('should POST to /api/Game with formatted settings', (done) => {
      const settings: GameSettings = {
        hasPunctuation: true,
        hasNumbers: false,
        middleKey: 'words',
        rightModifier: '25',
      };

      service.createGame(settings).subscribe((response) => {
        expect(response.text).toBe('test text');
        done();
      });

      const req = httpMock.expectOne('http://localhost:5262/api/Game');
      expect(req.request.method).toBe('POST');
      expect(req.request.body.HasPunctuation).toBe(true);
      expect(req.request.body.HasNumbers).toBe(false);
      expect(req.request.body.IsWords).toBe(true);
      expect(req.request.body.GameTextLength).toBe(25);
      req.flush({ text: 'test text' });
    });

    it('should set IsTimed and GameTimeLengthSeconds for time mode', (done) => {
      const settings: GameSettings = {
        hasPunctuation: false,
        hasNumbers: false,
        middleKey: 'time',
        rightModifier: '60',
      };

      service.createGame(settings).subscribe(() => {
        done();
      });

      const req = httpMock.expectOne('http://localhost:5262/api/Game');
      expect(req.request.body.IsTimed).toBe(true);
      expect(req.request.body.GameTimeLengthSeconds).toBe(60);
      expect(req.request.body.GameTextLength).toBeUndefined();
      req.flush({ text: '' });
    });
  });

  describe('getGameText', () => {
    it('should delegate to createGame', (done) => {
      const settings: GameSettings = {
        hasPunctuation: false,
        hasNumbers: false,
        middleKey: 'time',
        rightModifier: '30',
      };

      service.getGameText(settings).subscribe((response) => {
        expect(response.text).toBe('game text');
        done();
      });

      const req = httpMock.expectOne('http://localhost:5262/api/Game');
      req.flush({ text: 'game text' });
    });
  });

  describe('isGameSettingsUnchanged', () => {
    it('should return true when settings are identical', () => {
      const current: GameSettings = {
        hasPunctuation: true,
        hasNumbers: false,
        middleKey: 'words',
        rightModifier: '25',
      };
      const next: GameSettings = {
        hasPunctuation: true,
        hasNumbers: false,
        middleKey: 'words',
        rightModifier: '25',
      };

      expect(service.isGameSettingsUnchanged(current, next)).toBeTrue();
    });

    it('should return false when hasPunctuation differs', () => {
      const current: GameSettings = {
        hasPunctuation: true,
        hasNumbers: false,
        middleKey: 'words',
        rightModifier: '25',
      };
      const next: GameSettings = {
        hasPunctuation: false,
        hasNumbers: false,
        middleKey: 'words',
        rightModifier: '25',
      };

      expect(service.isGameSettingsUnchanged(current, next)).toBeFalse();
    });

    it('should return false when middleKey differs', () => {
      const current: GameSettings = {
        hasPunctuation: false,
        hasNumbers: false,
        middleKey: 'words',
        rightModifier: '25',
      };
      const next: GameSettings = {
        hasPunctuation: false,
        hasNumbers: false,
        middleKey: 'time',
        rightModifier: '25',
      };

      expect(service.isGameSettingsUnchanged(current, next)).toBeFalse();
    });

    it('should return false when rightModifier differs', () => {
      const current: GameSettings = {
        hasPunctuation: false,
        hasNumbers: false,
        middleKey: 'words',
        rightModifier: '25',
      };
      const next: GameSettings = {
        hasPunctuation: false,
        hasNumbers: false,
        middleKey: 'words',
        rightModifier: '50',
      };

      expect(service.isGameSettingsUnchanged(current, next)).toBeFalse();
    });
  });

  describe('convertTime', () => {
    it('should convert "10" to 10', () => {
      expect(service.convertTime('10')).toBe(10);
    });

    it('should convert "30" to 30', () => {
      expect(service.convertTime('30')).toBe(30);
    });

    it('should convert "60" to 60', () => {
      expect(service.convertTime('60')).toBe(60);
    });

    it('should return 30 for unknown modifier', () => {
      expect(service.convertTime('unknown')).toBe(30);
    });
  });

  describe('buildCharStates', () => {
    it('should create CharState array from text', () => {
      const text = 'hello';
      const result = service.buildCharStates(text);

      expect(result.length).toBe(5);
      expect(result[0]).toEqual({ char: 'h', status: 'pending', isCurrent: true });
      expect(result[1]).toEqual({ char: 'e', status: 'pending', isCurrent: false });
      expect(result[4]).toEqual({ char: 'o', status: 'pending', isCurrent: false });
    });

    it('should mark only first char as isCurrent', () => {
      const text = 'test';
      const result = service.buildCharStates(text);

      const currentCount = result.filter((c) => c.isCurrent).length;
      expect(currentCount).toBe(1);
      expect(result[0].isCurrent).toBeTrue();
    });

    it('should handle empty text', () => {
      const result = service.buildCharStates('');
      expect(result).toEqual([]);
    });
  });

  describe('normalizeKey', () => {
    it('should return "Backspace" for Backspace key', () => {
      expect(service.normalizeKey('Backspace')).toBe('Backspace');
    });

    it('should return the character for single character keys', () => {
      expect(service.normalizeKey('a')).toBe('a');
      expect(service.normalizeKey('Z')).toBe('Z');
      expect(service.normalizeKey('0')).toBe('0');
    });

    it('should return newline for Enter key', () => {
      expect(service.normalizeKey('Enter')).toBe('\n');
    });

    it('should return null for non-printable keys', () => {
      expect(service.normalizeKey('Shift')).toBeNull();
      expect(service.normalizeKey('Control')).toBeNull();
      expect(service.normalizeKey('ArrowUp')).toBeNull();
    });

    it('should return null for multi-character printable strings', () => {
      expect(service.normalizeKey('abc')).toBeNull();
    });
  });

  describe('getVisibleText', () => {
    let charStates: any[];

    beforeEach(() => {
      // Create 165 chars (3 lines of 55 chars each)
      charStates = Array.from({ length: 165 }, (_, i) => ({
        char: String.fromCharCode(65 + (i % 26)),
        status: 'pending' as const,
        isCurrent: i === 0,
      }));
    });

    it('should return visible window starting at cursor line', () => {
      const result = service.getVisibleText(charStates, 0);
      // Should show 3 lines worth = 165 chars for cursor at index 0
      expect(result.length).toBe(165);
    });

    it('should center visible window around cursor', () => {
      // Cursor at index 110 (line 2), should show lines 1-3
      const result = service.getVisibleText(charStates, 110);
      expect(result.length).toBe(165);
    });

    it('should clamp window when at end of text', () => {
      const result = service.getVisibleText(charStates, 160);
      // Should show last 3 lines, not go past end
      expect(result[result.length - 1]).toEqual(charStates[charStates.length - 1]);
    });

    it('should handle text shorter than window', () => {
      const shortChars = Array.from({ length: 20 }, (_, i) => ({
        char: 'a',
        status: 'pending' as const,
        isCurrent: i === 0,
      }));
      const result = service.getVisibleText(shortChars, 0);
      expect(result).toEqual(shortChars);
    });
  });

  describe('getVisibleTextString', () => {
    it('should join chars from CharState array', () => {
      const charStates = [
        { char: 'h', status: 'correct' as const, isCurrent: true },
        { char: 'i', status: 'pending' as const, isCurrent: false },
      ];
      expect(service.getVisibleTextString(charStates)).toBe('hi');
    });

    it('should handle empty array', () => {
      expect(service.getVisibleTextString([])).toBe('');
    });
  });

  describe('setCurrentIndex', () => {
    it('should mark only the specified index as isCurrent', () => {
      const charStates = [
        { char: 'a', status: 'pending' as const, isCurrent: true },
        { char: 'b', status: 'pending' as const, isCurrent: false },
        { char: 'c', status: 'pending' as const, isCurrent: false },
      ];

      const result = service.setCurrentIndex(charStates, 1);

      expect(result[0]).toEqual({ ...charStates[0], isCurrent: false });
      expect(result[1]).toEqual({ ...charStates[1], isCurrent: true });
      expect(result[2]).toEqual({ ...charStates[2], isCurrent: false });
    });

    it('should not mutate input array', () => {
      const charStates = [
        { char: 'a', status: 'pending' as const, isCurrent: true },
        { char: 'b', status: 'pending' as const, isCurrent: false },
      ];

      service.setCurrentIndex(charStates, 1);

      expect(charStates[0].isCurrent).toBeTrue();
      expect(charStates[1].isCurrent).toBeFalse();
    });
  });

  describe('getFinalChars', () => {
    it('should count correct, incorrect, and missed chars', () => {
      const charStates = [
        { char: 'a', status: 'correct' as const, isCurrent: false },
        { char: 'b', status: 'correct' as const, isCurrent: false },
        { char: 'c', status: 'incorrect' as const, isCurrent: false },
        { char: 'd', status: 'pending' as const, isCurrent: false },
        { char: 'e', status: 'pending' as const, isCurrent: true },
      ];

      const result = service.getFinalChars(charStates, 1);

      expect(result.correct).toBe(2);
      expect(result.incorrect).toBe(1);
      expect(result.missed).toBe(2);
      expect(result.extra).toBe(1);
    });

    it('should handle all correct', () => {
      const charStates = [
        { char: 'a', status: 'correct' as const, isCurrent: false },
        { char: 'b', status: 'correct' as const, isCurrent: true },
      ];

      const result = service.getFinalChars(charStates, 0);

      expect(result.correct).toBe(2);
      expect(result.incorrect).toBe(0);
      expect(result.missed).toBe(0);
      expect(result.extra).toBe(0);
    });
  });

  describe('getRawWPM', () => {
    it('should calculate correct WPM', () => {
      // 50 correct chars at 60 seconds = (50/5) / (60/60) = 10 WPM
      const wpm = service.getRawWPM(60, 50);
      expect(wpm).toBe(10);
    });

    it('should handle 30 second test', () => {
      // 25 correct chars at 30 seconds = (25/5) / (30/60) = 5 / 0.5 = 10 WPM
      const wpm = service.getRawWPM(30, 25);
      expect(wpm).toBe(10);
    });

    it('should return 0 for zero seconds', () => {
      const wpm = service.getRawWPM(0, 50);
      expect(wpm).toBe(0);
    });

    it('should handle no correct chars', () => {
      const wpm = service.getRawWPM(60, 0);
      expect(wpm).toBe(0);
    });
  });
});
