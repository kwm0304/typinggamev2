import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Multiplayerresults } from './multiplayerresults';

describe('Multiplayerresults', () => {
  let component: Multiplayerresults;
  let fixture: ComponentFixture<Multiplayerresults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Multiplayerresults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Multiplayerresults);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
