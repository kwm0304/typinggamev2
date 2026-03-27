import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gameinfo } from './gameinfo';

describe('Gameinfo', () => {
  let component: Gameinfo;
  let fixture: ComponentFixture<Gameinfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gameinfo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gameinfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
