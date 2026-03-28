import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gameboard } from './gameboard';

describe('Gameboard', () => {
  let component: Gameboard;
  let fixture: ComponentFixture<Gameboard>;

  const initializeGameboard = (text: string) => {
    fixture.componentRef.setInput('text', text);
    component.ngOnInit();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gameboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gameboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize character state from text input with first char active', () => {
    initializeGameboard('ab');

    expect(component.intakeArray).toEqual(['a', 'b']);
    expect(component.charArray.length).toBe(2);
    expect(component.charArray[0].active).toBeTrue();
    expect(component.charArray[1].active).toBeFalse();
  });

  it('should start game and advance to next char on first valid keydown', () => {
    initializeGameboard('ab');

    const activeSpy = spyOn(component.isGameActiveChange, 'emit');
    const startSpy = spyOn(component.gameStart, 'emit');
    const setStartGameStateSpy = spyOn<any>(component, 'setStartGameState').and.callThrough();
    const evaluateInputSpy = spyOn<any>(component, 'evaluateInput').and.callThrough();

    component.onDocumentKeydown({
      key: 'a',
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as KeyboardEvent);

    expect(setStartGameStateSpy).toHaveBeenCalledTimes(1);
    expect(evaluateInputSpy).toHaveBeenCalledWith('a', 0);
    expect(component.isGameActive).toBeTrue();
    expect(component.currentIndex).toBe(1);
    expect(component.charArray[0].correct).toBeTrue();
    expect(component.charArray[1].active).toBeTrue();
    expect(activeSpy).toHaveBeenCalledWith(true);
    expect(startSpy).toHaveBeenCalledTimes(1);
  });

  it('should end game when last character is typed', () => {
    initializeGameboard('a');

    const activeSpy = spyOn(component.isGameActiveChange, 'emit');
    const endSpy = spyOn(component.gameEnd, 'emit');

    component.onDocumentKeydown({
      key: 'a',
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as KeyboardEvent);

    expect(component.isGameActive).toBeFalse();
    expect(component.isGameOver).toBeTrue();
    expect(activeSpy).toHaveBeenCalledWith(true);
    expect(activeSpy).toHaveBeenCalledWith(false);
    expect(endSpy).toHaveBeenCalledTimes(1);
  });

  it('should set start-game state and emit start events', () => {
    initializeGameboard('ab');

    const activeSpy = spyOn(component.isGameActiveChange, 'emit');
    const startSpy = spyOn(component.gameStart, 'emit');

    (component as any).setStartGameState();

    expect(component.isGameActive).toBeTrue();
    expect(component.isGameOver).toBeFalse();
    expect(activeSpy).toHaveBeenCalledWith(true);
    expect(startSpy).toHaveBeenCalledTimes(1);
  });

  it('should set game-over state and emit end events', () => {
    component.isGameActive = true;
    component.isGameOver = false;
    component.isGameStale = true;

    const activeSpy = spyOn(component.isGameActiveChange, 'emit');
    const staleSpy = spyOn(component.isGameStaleChange, 'emit');
    const endSpy = spyOn(component.gameEnd, 'emit');

    (component as any).handleGameOver();

    expect(component.isGameActive).toBeFalse();
    expect(component.isGameOver).toBeTrue();
    expect(component.isGameStale).toBeFalse();
    expect(activeSpy).toHaveBeenCalledWith(false);
    expect(staleSpy).toHaveBeenCalledWith(false);
    expect(endSpy).toHaveBeenCalledTimes(1);
  });

  it('should mark game stale after 3 seconds of inactivity while active', () => {
    jasmine.clock().install();
    try {
      initializeGameboard('ab');

      const staleSpy = spyOn(component.isGameStaleChange, 'emit');

      component.onDocumentKeydown({
        key: 'a',
        ctrlKey: false,
        metaKey: false,
        altKey: false,
        preventDefault: jasmine.createSpy('preventDefault'),
      } as unknown as KeyboardEvent);

      jasmine.clock().tick(2999);
      expect(component.isGameStale).toBeFalse();
      expect(staleSpy).not.toHaveBeenCalledWith(true);

      jasmine.clock().tick(1);
      expect(component.isGameStale).toBeTrue();
      expect(staleSpy).toHaveBeenCalledWith(true);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('should clear stale state on keydown while game is active', () => {
    initializeGameboard('abc');

    component.isGameActive = true;
    component.isGameOver = false;
    component.isGameStale = true;

    const staleSpy = spyOn(component.isGameStaleChange, 'emit');

    component.onDocumentKeydown({
      key: 'b',
      ctrlKey: false,
      metaKey: false,
      altKey: false,
      preventDefault: jasmine.createSpy('preventDefault'),
    } as unknown as KeyboardEvent);

    expect(component.isGameStale).toBeFalse();
    expect(staleSpy).toHaveBeenCalledWith(false);
  });

  it('should deactivate active game when externalGameEnd input becomes true', () => {
    initializeGameboard('abc');

    component.isGameActive = true;
    component.isGameOver = false;
    component.isGameStale = true;

    const activeSpy = spyOn(component.isGameActiveChange, 'emit');
    const staleSpy = spyOn(component.isGameStaleChange, 'emit');

    fixture.componentRef.setInput('externalGameEnd', true);
    fixture.detectChanges();

    expect(component.isGameActive).toBeFalse();
    expect(activeSpy).toHaveBeenCalledWith(false);
    expect(component.isGameStale).toBeFalse();
    expect(staleSpy).toHaveBeenCalledWith(false);
  });

  it('getFinalStats should calculate correct, incorrect, extra, and missed', () => {
    initializeGameboard('a b');

    component.inputArray = [
      { char: 'a', isCorrect: true, index: 0 },
      { char: 'x', isCorrect: false, index: 1 },
      { char: 'c', isCorrect: false, index: 2 },
    ];

    const stats = (component as any).getFinalStats();

    expect(stats).toEqual({
      correct: 1,
      incorrect: 2,
      extra: 1,
      missed: 1,
    });
  });

  it('getFinalStats should handle missing input indices safely', () => {
    initializeGameboard('a b c');

    component.inputArray = [
      { char: 'a', isCorrect: true, index: 0 },
    ];

    const stats = (component as any).getFinalStats();

    expect(stats).toEqual({
      correct: 1,
      incorrect: 0,
      extra: 2,
      missed: 0,
    });
  });

  it('should update selected language and close language modal', () => {
    expect(component.language).toBe('english');
    expect(component.showLanguageModal).toBeFalse();

    component.toggleShowModal();
    expect(component.showLanguageModal).toBeTrue();

    component.selectLanguage('spanish');

    expect(component.language).toBe('spanish');
    expect(component.showLanguageModal).toBeFalse();
  });
});
