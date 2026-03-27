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
});
