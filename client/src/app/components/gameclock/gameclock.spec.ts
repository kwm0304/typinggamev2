import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gameclock } from './gameclock';

describe('Gameclock', () => {
  let component: Gameclock;
  let fixture: ComponentFixture<Gameclock>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gameclock],
    })
      .compileComponents();

    fixture = TestBed.createComponent(Gameclock);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render provided startTime', () => {
    fixture.componentRef.setInput('startTime', 42);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    expect(host.textContent?.trim()).toBe('42');
  });
});
