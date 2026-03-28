import { CommonModule } from '@angular/common';
import { Component, OnInit, output } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPenNib,
  faHashtag,
  faStopwatch,
  faA,
  faQuoteLeft,
  faPeace,
  faWrench,
  faFile,
} from '@fortawesome/free-solid-svg-icons';

import { GameSettings, MiddleNavKey, NavItem } from '../../types/gametypes'


@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  gameSettingsChange = output<GameSettings>();
  hasPunctuation: boolean = false;
  hasNumbers: boolean = false;
  selectedMiddleIndex: number = 1;
  rightNavByMiddle: any[] = [];
  selectedMiddle: MiddleNavKey = 'time';
  selectedRightModifier: string = '30';
  gameSettings: GameSettings = {
    hasPunctuation: this.hasPunctuation,
    hasNumbers: this.hasNumbers,
    middleKey: this.selectedMiddle,
    rightModifier: this.selectedRightModifier,
  };
  
  constructor(private faIconLibrary: FaIconLibrary) {}
  //Can have none, one, or both isSelected be true on left
  leftNavItems = [
    {
      label: 'punctuation',
      index: 0,
      icon: faPenNib,
      ngModel: this.hasPunctuation,
      isSelected: false,
    },
    { label: 'numbers', index: 1, icon: faHashtag, ngModel: this.hasNumbers, isSelected: false },
  ];
  //only 1 selected at a time for middle and right, default is 'time' and '30'
  middleNavItems = [
    {
      label: 'time',
      icon: faStopwatch,
      isSelected: true,
      index: 0,
      onClick: () => this.selectMiddleItem('time'),
    },
    {
      label: 'words',
      icon: faA,
      index: 1,
      isSelected: false,
      onClick: () => this.selectMiddleItem('words'),
    },
    {
      label: 'quote',
      icon: faQuoteLeft,
      index: 2,
      isSelected: false,
      onClick: () => this.selectMiddleItem('quote'),
    },
    {
      label: 'zen',
      icon: faPeace,
      index: 3,
      isSelected: false,
      onClick: () => this.selectMiddleItem('zen'),
    },
    {
      label: 'custom',
      icon: faWrench,
      index: 4,
      isSelected: false,
      onClick: () => this.selectMiddleItem('custom'),
    },
  ];
  //right nav items determined by middle selection, default is timeItems
  timeItems = [
    { label: '15', index: 0, isSelected: false, onClick: () => this.selectItem(0) },
    { label: '30', index: 1, isSelected: true, onClick: () => this.selectItem(1) },
    { label: '60', index: 2, isSelected: false, onClick: () => this.selectItem(2) },
    { label: '120', index: 3, isSelected: false, onClick: () => this.selectItem(3) },
  ];
  wordItems = [
    { label: '10', index: 0, isSelected: false, onClick: () => this.selectItem(0) },
    { label: '25', index: 1, isSelected: false, onClick: () => this.selectItem(1) },
    { label: '50', index: 2, isSelected: false, onClick: () => this.selectItem(2) },
    { label: '100', index: 3, isSelected: false, onClick: () => this.selectItem(3) },
    {
      label: 'custom',
      index: 4,
      icon: faFile,
      isSelected: false,
      onClick: () => this.selectItem(4),
    },
  ];
  quoteItems = [
    { label: 'all', index: 0, isSelected: false, onClick: () => this.selectItem(0) },
    { label: 'short', index: 1, isSelected: false, onClick: () => this.selectItem(1) },
    { label: 'medium', index: 2, isSelected: false, onClick: () => this.selectItem(2) },
    { label: 'long', index: 3, isSelected: false, onClick: () => this.selectItem(3) },
    { label: 'thicc', index: 4, isSelected: false, onClick: () => this.selectItem(4) },
  ];
  customItems = [
    { label: 'change', index: 0, isSelected: false, onClick: () => this.selectItem(0) },
  ];
  //mapping the right nav array for each middle item
  rightNavMap: Record<MiddleNavKey, NavItem[]> = {
    time: this.timeItems,
    words: this.wordItems,
    quote: this.quoteItems,
    custom: this.customItems,
    zen: [],
  };
  rightNavItems = this.rightNavMap[this.selectedMiddle];

  //onClick functions for navitems, also sets gameSettings and emits to singleplayer
  public selectLeftItem(index: number) {
    const item = this.leftNavItems[index];
    item.ngModel = !item.ngModel;
    item.isSelected = item.ngModel;
    if (item.label === 'punctuation') {
      this.hasPunctuation = item.ngModel;
    }
    if (item.label === 'numbers') {
      this.hasNumbers = item.ngModel;
    }
    this.gameSettings.hasPunctuation = this.hasPunctuation;
    this.gameSettings.hasNumbers = this.hasNumbers;
    this.emitGameSettings();
  }
  public selectMiddleItem(key: MiddleNavKey) {
    this.selectedMiddle = key;
    this.gameSettings.middleKey = key;
    this.rightNavItems = this.rightNavMap[key];
    this.emitGameSettings();
  }
  public selectItem(index: number, middleKey: MiddleNavKey = this.selectedMiddle) {
    switch (middleKey) {
      case 'time':
        this.timeItems.forEach((item) => (item.isSelected = item.index === index));
        this.gameSettings.rightModifier = this.timeItems[index].label;
        break;
      case 'words':
        this.wordItems.forEach((item) => (item.isSelected = item.index === index));
        this.gameSettings.rightModifier = this.wordItems[index].label;
        break;
      case 'quote':
        this.quoteItems.forEach((item) => (item.isSelected = item.index === index));
        this.gameSettings.rightModifier = this.quoteItems[index].label;
        break;
      case 'custom':
        this.customItems.forEach((item) => (item.isSelected = item.index === index));
        this.gameSettings.rightModifier = this.customItems[index].label;
        break;
      default:
        break;
    }
    this.emitGameSettings();
  }
  addIcons() {
    for (let item of this.leftNavItems) {
      if (item.icon) {
        this.faIconLibrary.addIcons(item.icon);
      }
    }
  }

  ngOnInit(): void {
    this.gameSettings = {
      hasPunctuation: this.hasPunctuation,
      hasNumbers: this.hasNumbers,
      middleKey: this.selectedMiddle,
      rightModifier: this.selectedRightModifier,
    };
    this.emitGameSettings();
  }

  private emitGameSettings() {
    this.gameSettingsChange.emit({ ...this.gameSettings });
  }
}
