import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Navbar } from './navbar';

describe('Navbar', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit initial default game settings on init', () => {
    const emitSpy = spyOn(component.gameSettingsChange, 'emit');

    component.ngOnInit();

    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith({
      hasPunctuation: false,
      hasNumbers: false,
      middleKey: 'time',
      rightModifier: '30',
    });
  });

  it('should toggle punctuation and emit updated settings', () => {
    const emitSpy = spyOn(component.gameSettingsChange, 'emit');

    component.selectLeftItem(0);

    expect(component.leftNavItems[0].isSelected).toBeTrue();
    expect(component.hasPunctuation).toBeTrue();
    expect(component.gameSettings.hasPunctuation).toBeTrue();
    expect(component.gameSettings.hasNumbers).toBeFalse();
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      hasPunctuation: true,
      hasNumbers: false,
    }));
  });

  it('should switch middle selection to words and use words right-nav items', () => {
    const emitSpy = spyOn(component.gameSettingsChange, 'emit');

    component.selectMiddleItem('words');

    expect(component.selectedMiddle).toBe('words');
    expect(component.rightNavItems).toBe(component.wordItems);
    expect(component.gameSettings.middleKey).toBe('words');
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({ middleKey: 'words' }));
  });

  it('should enforce single selected item for time and update right modifier', () => {
    const emitSpy = spyOn(component.gameSettingsChange, 'emit');

    component.selectItem(2, 'time');

    expect(component.timeItems[2].isSelected).toBeTrue();
    expect(component.timeItems.filter((item) => item.isSelected).length).toBe(1);
    expect(component.gameSettings.rightModifier).toBe('60');
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({ rightModifier: '60' }));
  });

  it('should enforce single selected item for words and emit selected modifier', () => {
    const emitSpy = spyOn(component.gameSettingsChange, 'emit');

    component.selectMiddleItem('words');
    component.selectItem(3, 'words');

    expect(component.wordItems[3].isSelected).toBeTrue();
    expect(component.wordItems.filter((item) => item.isSelected).length).toBe(1);
    expect(component.gameSettings.rightModifier).toBe('100');
    expect(emitSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      middleKey: 'words',
      rightModifier: '100',
    }));
  });

  it('should emit a new object snapshot, not the same gameSettings reference', () => {
    let emittedSettings: any;
    spyOn(component.gameSettingsChange, 'emit').and.callFake((settings) => {
      emittedSettings = settings;
    });

    component.selectItem(0, 'time');

    expect(emittedSettings).toBeTruthy();
    expect(emittedSettings).not.toBe(component.gameSettings);
    component.gameSettings.rightModifier = '120';
    expect(emittedSettings.rightModifier).toBe('15');
  });
});
