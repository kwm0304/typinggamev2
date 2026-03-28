import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gameclock } from './gameclock';

describe('Gameclock', () => {
  let component: Gameclock;
  let fixture: ComponentFixture<Gameclock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gameclock]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gameclock);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not start timer while canStartTimer is false', () => {
    fixture.componentRef.setInput('startTime', 5);
    fixture.detectChanges();

    expect(component.timerRunning()).toBeFalse();
    expect(component.remainingSeconds()).toBe(0);
  });

  it('should start at startTime and decrement once per second when canStartTimer becomes true', () => {
    jasmine.clock().install();
    try {
      fixture.componentRef.setInput('startTime', 3);
      fixture.componentRef.setInput('canStartTimer', true);
      fixture.detectChanges();

      expect(component.timerRunning()).toBeTrue();
      expect(component.remainingSeconds()).toBe(3);

      jasmine.clock().tick(1000);
      expect(component.remainingSeconds()).toBe(2);

      jasmine.clock().tick(1000);
      expect(component.remainingSeconds()).toBe(1);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('should set timeout and stop timer when countdown finishes', () => {
    jasmine.clock().install();
    try {
      fixture.componentRef.setInput('startTime', 1);
      fixture.componentRef.setInput('canStartTimer', true);
      fixture.detectChanges();

      jasmine.clock().tick(1000);
      expect(component.remainingSeconds()).toBe(0);
      expect(component.isTimeOut()).toBeFalse();

      jasmine.clock().tick(1000);
      expect(component.isTimeOut()).toBeTrue();
      expect(component.timerRunning()).toBeFalse();
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('should emit pausedGameTime when game becomes stale', () => {
    jasmine.clock().install();
    try {
      fixture.componentRef.setInput('startTime', 10);
      fixture.componentRef.setInput('canStartTimer', true);
      fixture.detectChanges();

      jasmine.clock().tick(2000);
      const emitSpy = spyOn(component.pausedGameTimeChange, 'emit');

      fixture.componentRef.setInput('isGameStale', true);
      fixture.detectChanges();

      expect(component.remainingSeconds()).toBe(8);
      expect(emitSpy).toHaveBeenCalledWith(8);
    } finally {
      jasmine.clock().uninstall();
    }
  });

  it('should emit paused time and clear interval on destroy when timer is running', () => {
    jasmine.clock().install();
    try {
      fixture.componentRef.setInput('startTime', 5);
      fixture.componentRef.setInput('canStartTimer', true);
      fixture.detectChanges();
      jasmine.clock().tick(1000);

      const emitSpy = spyOn(component.pausedGameTimeChange, 'emit');
      component.ngOnDestroy();

      expect(emitSpy).toHaveBeenCalledWith(4);

      jasmine.clock().tick(2000);
      expect(component.remainingSeconds()).toBe(4);
    } finally {
      jasmine.clock().uninstall();
    }
  });
});
