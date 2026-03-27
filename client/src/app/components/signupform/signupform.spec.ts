import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Signupform } from './signupform';

describe('Signupform', () => {
  let component: Signupform;
  let fixture: ComponentFixture<Signupform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Signupform]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Signupform);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
