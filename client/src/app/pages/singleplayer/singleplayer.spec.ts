import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { Singleplayer } from './singleplayer';
import { GameService } from '../../services/game.service';
import { GameSettings, CharState } from '../../types/gametypes';

describe('Singleplayer', () => {
  let component: Singleplayer;
  let fixture: ComponentFixture<Singleplayer>;
  let gameService: jasmine.SpyObj<GameService>;
  let router: jasmine.SpyObj<Router>;
  let cdr: ChangeDetectorRef;

  const mockGameSettings: GameSettings = {
    hasPunctuation: false,
    hasNumbers: false,
    middleKey: 'words',
    rightModifier: '25',
  };

  const mockText = 'The quick brown fox jumps over the lazy dog';

  beforeEach(async () => {
    const gameServiceSpy = jasmine.createSpyObj('GameService', [
      'createGame',
      'getGameText',
      'isGameSettingsUnchanged',
      'convertTime',
      'buildCharStates',
      'normalizeKey',
      'getVisibleText',
      'getVisibleTextString',
      'setCurrentIndex',
      'getFinalChars',
      'getRawWPM',
    ]);

    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    gameServiceSpy.createGame.and.returnValue(of({ text: mockText }));
    gameServiceSpy.getGameText.and.returnValue(of({ text: mockText }));
    gameServiceSpy.buildCharStates.and.callFake((text: string) => {
      return text.split('').map((char, i) => ({
        char,
        status: 'pending' as const,
        isCurrent: i === 0,
      }));
    });
    gameServiceSpy.getVisibleText.and.callFake((charStates: CharState[]) => {
      return charStates.slice(0, 20);
    });
    gameServiceSpy.getVisibleTextString.and.callFake((chars: CharState[]) => {
      return chars.map((c) => c.char).join('');
    });
    gameServiceSpy.normalizeKey.and.callFake((key: string) => {
      if (key === 'Backspace') return 'Backspace';
      if (key === 'Enter') return '\n';
      if (key.length === 1) return key;
      return null;
    });
    gameServiceSpy.setCurrentIndex.and.callFake((arr: CharState[], idx: number) => {
      return arr.map((c, i) => ({ ...c, isCurrent: i === idx }));
    });
    gameServiceSpy.isGameSettingsUnchanged.and.returnValue(true);
    gameServiceSpy.convertTime.and.returnValue(30);
    gameServiceSpy.getFinalChars.and.returnValue({
      correct: 10,
      incorrect: 2,
      missed: 5,
      extra: 0,
    });
    gameServiceSpy.getRawWPM.and.returnValue(40);

    await TestBed.configureTestingModule({
      imports: [Singleplayer],
      providers: [
        { provide: GameService, useValue: gameServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    gameService = TestBed.inject(GameService) as jasmine.SpyObj<GameService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(Singleplayer);
    component = fixture.componentInstance;
    cdr = fixture.debugElement.injector.get(ChangeDetectorRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('State Initialization', () => {
    it('should initialize with default state', () => {
      expect(component.charStates).toEqual([]);
      expect(component.userInput).toEqual([]);
      expect(component.currentIndex).toBe(0);
      expect(component.extraCount).toBe(0);
      expect(component.isGameActive).toBeFalse();
      expect(component.isGameOver).toBeFalse();
    });

    it('should initialize with signal defaults', () => {
      expect(component.visibleCharStates()).toEqual([]);
      expect(component.isGameStale()).toBeFalse();
      expect(component.remainingSeconds()).toBe(30);
    });
  });

  describe('getGameText', () => {
    it('should call createGame with game settings', (done) => {
      component.gameSettings = mockGameSettings;

      component['getGameText']();

      setTimeout(() => {
        expect(gameService.createGame).toHaveBeenCalledWith(mockGameSettings);
        done();
      }, 10);
    });

    it('should set textWall when data is received', (done) => {
      component.gameSettings = mockGameSettings;

      component['getGameText']();

      setTimeout(() => {
        expect(component.textWall).toBe(mockText);
        done();
      }, 10);
    });
  });

  describe('resetRound', () => {
    it('should clear timers and reset all state', () => {
      component.textWall = mockText;
      component.currentIndex = 5;
      component.extraCount = 2;
      spyOn(component as any, 'updateVisibleWindow');

      (component as any).resetRound();

      expect(component.charStates.length).toBe(mockText.length);
      expect(component.userInput.length).toBe(mockText.length);
      expect(component.currentIndex).toBe(0);
      expect(component.extraCount).toBe(0);
      expect((component as any).updateVisibleWindow).toHaveBeenCalled();
    });

    it('should build charStates from textWall', () => {
      component.textWall = 'ab';
      (component as any).resetRound();

      expect(component.charStates.length).toBe(2);
      expect(component.charStates[0].char).toBe('a');
      expect(component.charStates[1].char).toBe('b');
    });

    it('should initialize userInput array with nulls', () => {
      component.textWall = 'test';
      (component as any).resetRound();

      expect(component.userInput.length).toBe(4);
      expect(component.userInput[0]).toBeNull();
    });
  });

  describe('startGame', () => {
    it('should set game active and not over', () => {
      component.isGameActive = false;
      component.isGameOver = true;

      component['startGame']();

      expect(component.isGameActive).toBeTrue();
      expect(component.isGameOver).toBeFalse();
    });

    it('should clear isGameStale signal', () => {
      component.isGameStale.set(true);

      component['startGame']();

      expect(component.isGameStale()).toBeFalse();
    });
  });

  describe('handleCharacter', () => {
    beforeEach(() => {
      component.textWall = 'hello';
      (component as any).resetRound();
    });

    it('should record typed character in userInput', () => {
      (component as any).handleCharacter('h');

      expect(component.userInput[0]).toBe('h');
    });

    it('should update charStates status based on correctness', () => {
      (component as any).handleCharacter('h'); // correct

      expect(component.charStates[0].status).toBe('correct');
    });

    it('should mark incorrect characters', () => {
      (component as any).handleCharacter('x'); // incorrect

      expect(component.charStates[0].status).toBe('incorrect');
    });

    it('should increment currentIndex', () => {
      const initialIndex = component.currentIndex;
      (component as any).handleCharacter('h');

      expect(component.currentIndex).toBe(initialIndex + 1);
    });

    it('should track extra characters when typing past end', () => {
      component.currentIndex = component.charStates.length - 1;
      (component as any).handleCharacter('e');
      (component as any).handleCharacter('x'); // beyond text length

      expect(component.extraCount).toBe(1);
    });
  });

  describe('handleBackspace', () => {
    beforeEach(() => {
      component.textWall = 'hello';
      (component as any).resetRound();
      component.currentIndex = 2;
      component.userInput[0] = 'h';
      component.userInput[1] = 'e';
    });

    it('should decrement currentIndex when not at extra chars', () => {
      (component as any).handleBackspace();

      expect(component.currentIndex).toBe(1);
    });

    it('should decrement extraCount when at or past end', () => {
      component.currentIndex = component.charStates.length;
      component.extraCount = 1;

      (component as any).handleBackspace();

      expect(component.extraCount).toBe(0);
    });

    it('should clear userInput entry', () => {
      (component as any).handleBackspace();

      expect(component.userInput[1]).toBeNull();
    });

    it('should reset status to pending', () => {
      component.charStates[1].status = 'correct';
      (component as any).handleBackspace();

      expect(component.charStates[1].status).toBe('pending');
    });
  });

  describe('updateVisibleWindow', () => {
    beforeEach(() => {
      component.textWall = 'abcdefghijklmnopqrstuvwxyz';
      (component as any).resetRound();
    });

    it('should update visibleCharStates signal', () => {
      (component as any).updateVisibleWindow();

      expect(component.visibleCharStates().length).toBeGreaterThan(0);
    });

    it('should include currentIndex in visible window', () => {
      component.currentIndex = 0;
      (component as any).updateVisibleWindow();

      expect(gameService.getVisibleText).toHaveBeenCalled();
    });
  });

  describe('startTimer', () => {
    it('should create an interval timer', () => {
      spyOn(window, 'setInterval').and.returnValue(123 as any);
      component.remainingSeconds.set(5);
      component.isGameActive = true;
      component.isGameOver = false;

      (component as any).startTimer();

      expect(window.setInterval).toHaveBeenCalled();
      const call = (window.setInterval as jasmine.Spy).calls.mostRecent();
      expect(call.args[1]).toBe(1000); // 1 second interval
    });
  });

  describe('startStaleTimer', () => {
    it('should set up an inactivity timeout', () => {
      spyOn(window, 'setTimeout').and.returnValue(456 as any);
      (component as any).startStaleTimer();

      expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), 3000);
    });
  });

  describe('endGame', () => {
    beforeEach(() => {
      component.textWall = 'test text';
      component.charStates = [
        { char: 't', status: 'correct', isCurrent: false },
        { char: 'e', status: 'correct', isCurrent: false },
        { char: 's', status: 'incorrect', isCurrent: true },
        { char: 't', status: 'pending', isCurrent: false },
      ];
      component.gameSettings = mockGameSettings;
    });

    it('should set game inactive and over', () => {
      component.isGameActive = true;
      component.isGameOver = false;

      (component as any).endGame();

      expect(component.isGameActive).toBeFalse();
      expect(component.isGameOver).toBeTrue();
    });

    it('should navigate to results page', () => {
      (component as any).endGame();

      expect(router.navigate).toHaveBeenCalledWith(['/results'], jasmine.any(Object));
    });
  });

  describe('onKeydown', () => {
    beforeEach(() => {
      component.textWall = 'hello';
      component.gameSettings = mockGameSettings;
      (component as any).resetRound();
      spyOn(component as any, 'startGame');
      spyOn(component as any, 'handleCharacter');
      spyOn(component as any, 'handleBackspace');
    });

    it('should start game on first keydown if inactive', () => {
      component.isGameActive = false;
      const event = new KeyboardEvent('keydown', { key: 'h' });

      component.onKeydown(event);

      expect((component as any).startGame).toHaveBeenCalled();
    });

    it('should delegate to handleCharacter for valid chars', () => {
      component.isGameActive = true;
      const event = new KeyboardEvent('keydown', { key: 'h' });

      component.onKeydown(event);

      expect((component as any).handleCharacter).toHaveBeenCalledWith('h');
    });

    it('should delegate to handleBackspace for Backspace', () => {
      component.isGameActive = true;
      const event = new KeyboardEvent('keydown', { key: 'Backspace' });

      component.onKeydown(event);

      expect((component as any).handleBackspace).toHaveBeenCalled();
    });

    it('should check game completion', () => {
      component.isGameActive = true;
      component.currentIndex = component.charStates.length;
      spyOn(component as any, 'endGame');

      const event = new KeyboardEvent('keydown', { key: 'h' });
      component.onKeydown(event);

      expect((component as any).endGame).toHaveBeenCalled();
    });

    it('should ignore invalid keys', () => {
      component.isGameActive = true;
      const event = new KeyboardEvent('keydown', { key: 'Shift' });

      component.onKeydown(event);

      expect((component as any).handleCharacter).not.toHaveBeenCalled();
    });
  });

  describe('integration: full typing flow', () => {
    it('should handle complete character sequence', () => {
      component.textWall = 'hi';
      component.gameSettings = mockGameSettings;
      (component as any).resetRound();

      // Type 'h'
      (component as any).handleCharacter('h');
      expect(component.userInput[0]).toBe('h');
      expect(component.charStates[0].status).toBe('correct');
      expect(component.currentIndex).toBe(1);

      // Type 'i'
      (component as any).handleCharacter('i');
      expect(component.userInput[1]).toBe('i');
      expect(component.charStates[1].status).toBe('correct');
      expect(component.currentIndex).toBe(2);
    });

    it('should handle backspace in sequence', () => {
      component.textWall = 'hi';
      (component as any).resetRound();

      (component as any).handleCharacter('h');
      (component as any).handleCharacter('x'); // wrong
      expect(component.currentIndex).toBe(2);

      (component as any).handleBackspace();
      expect(component.currentIndex).toBe(1);
      expect(component.userInput[1]).toBeNull();
      expect(component.charStates[1].status).toBe('pending');
    });
  });
});
