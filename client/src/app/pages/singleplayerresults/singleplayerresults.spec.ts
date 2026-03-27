import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Singleplayerresults } from './singleplayerresults';

describe('Singleplayerresults', () => {
  let component: Singleplayerresults;
  let fixture: ComponentFixture<Singleplayerresults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Singleplayerresults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Singleplayerresults);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
