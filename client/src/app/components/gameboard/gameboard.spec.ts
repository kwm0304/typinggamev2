import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gameboard } from './gameboard';

describe('Gameboard', () => {
  let component: Gameboard;
  let fixture: ComponentFixture<Gameboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gameboard],
    })
      .compileComponents();

    fixture = TestBed.createComponent(Gameboard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('chars', []);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the provided characters with status classes and caret', () => {
    fixture.componentRef.setInput('chars', [
      { char: 'a', status: 'correct', isCurrent: false },
      { char: 'b', status: 'incorrect', isCurrent: true },
    ]);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const cells = host.querySelectorAll('.char-cell');
    const caret = host.querySelector('.typing-caret');

    expect(cells.length).toBe(2);
    expect(cells[0].classList.contains('char-correct')).toBeTrue();
    expect(cells[1].classList.contains('char-incorrect')).toBeTrue();
    expect(cells[0].textContent?.trim()).toBe('a');
    expect(cells[1].textContent?.trim()).toBe('b');
    expect(caret).toBeTruthy();
  });
});
