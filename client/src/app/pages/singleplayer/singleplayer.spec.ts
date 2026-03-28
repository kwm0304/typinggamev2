import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Singleplayer } from './singleplayer';
import { GameSettings } from '../../components/navbar/navbar';

describe('Singleplayer', () => {
  let component: Singleplayer;
  let fixture: ComponentFixture<Singleplayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Singleplayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Singleplayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onGameStart should set active true and gameOver false', () => {
    component.isGameActive = false;
    component.isGameOver = true;

    component.onGameStart();

    expect(component.isGameActive).toBeTrue();
    expect(component.isGameOver).toBeFalse();
  });

  it('onGameEnd should set active false and gameOver true', () => {
    component.isGameActive = true;
    component.isGameOver = false;

    component.onGameEnd();

    expect(component.isGameActive).toBeFalse();
    expect(component.isGameOver).toBeTrue();
  });

  it('onIsGameActiveChange(true) should clear gameOver', () => {
    component.isGameOver = true;

    component.onIsGameActiveChange(true);

    expect(component.isGameActive).toBeTrue();
    expect(component.isGameOver).toBeFalse();
  });

  it('onGameSettingsChange should pulse externalGameEnd when game is active and not over', async () => {
    const nextSettings: GameSettings = {
      hasPunctuation: true,
      hasNumbers: true,
      middleKey: 'words',
      rightModifier: '50',
    };
    component.isGameActive = true;
    component.isGameOver = false;

    component.onGameSettingsChange(nextSettings);

    expect(component.externalGameEnd).toBeTrue();
    expect(component.gameSettings).toEqual(nextSettings);

    await Promise.resolve();

    expect(component.externalGameEnd).toBeFalse();
  });

  it('onIsGameStaleChange should mirror stale state', () => {
    component.onIsGameStaleChange(true);
    expect(component.isGameStale).toBeTrue();

    component.onIsGameStaleChange(false);
    expect(component.isGameStale).toBeFalse();
  });
});
