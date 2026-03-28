import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { TopMenu } from './top-menu';

describe('TopMenu', () => {
  let component: TopMenu;
  let fixture: ComponentFixture<TopMenu>;
  let routerMock: { navigate: jasmine.Spy };

  beforeEach(async () => {
    routerMock = {
      navigate: jasmine.createSpy('navigate'),
    };

    await TestBed.configureTestingModule({
      imports: [TopMenu],
      providers: [{ provide: Router, useValue: routerMock }],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open sidebar when openSidebar is called', () => {
    component.showSidebar = false;

    component.openSidebar();

    expect(component.showSidebar).toBeTrue();
  });

  it('should close sidebar when closeSidebar is called', () => {
    component.showSidebar = true;

    component.closeSidebar();

    expect(component.showSidebar).toBeFalse();
  });

  it('should update sidebar state from drawer toggle event', () => {
    const checkedEvent = {
      target: { checked: true },
    } as unknown as Event;
    const uncheckedEvent = {
      target: { checked: false },
    } as unknown as Event;

    component.onDrawerToggle(checkedEvent);
    expect(component.showSidebar).toBeTrue();

    component.onDrawerToggle(uncheckedEvent);
    expect(component.showSidebar).toBeFalse();
  });

  it('should toggle sidebar when toggleShowNotifications is called', () => {
    component.showSidebar = false;

    component.toggleShowNotifications();
    expect(component.showSidebar).toBeTrue();

    component.toggleShowNotifications();
    expect(component.showSidebar).toBeFalse();
  });
});
