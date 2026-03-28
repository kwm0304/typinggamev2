export interface UserInput {
  char: string;
  isCorrect: boolean;
  index: number;
};

export interface CharState {
  correct: boolean;
  incorrect: boolean;
  active: boolean;
  index: number;
};

export interface GameSettings {
  hasPunctuation: boolean;
  hasNumbers: boolean;
  middleKey: MiddleNavKey;
  rightModifier: string;
}
export type MiddleNavKey = 'time' | 'words' | 'quote' | 'custom' | 'zen';

export interface NavItem {
  label: string;
  icon?: any;
  isSelected?: boolean;
  index: number;
  onClick: () => void;
};