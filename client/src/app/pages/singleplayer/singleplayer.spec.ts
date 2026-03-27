import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Singleplayer } from './singleplayer';

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
});
