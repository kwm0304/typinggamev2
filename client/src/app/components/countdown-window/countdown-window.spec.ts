import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountdownWindow } from './countdown-window';

describe('CountdownWindow', () => {
  let component: CountdownWindow;
  let fixture: ComponentFixture<CountdownWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CountdownWindow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CountdownWindow);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
