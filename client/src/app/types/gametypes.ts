export interface UserInput {
  char: string;
  isCorrect: boolean;
  index: number;
};

export interface CharState {
  char: string;
  status: CharStatus;
  isCurrent: boolean;
};
export type CharStatus = 'pending' | 'correct' | 'incorrect';

export interface GameState { 
  gameTextArrays: GameTextArrays;
  gameText: GameText;
  gameCounters: GameCounters;
  gameControls: GameControls;
}
export interface GameTextArrays {
  visibleCharStates: CharState[];
  userInput: (string | null)[];
  charStates: CharState[];
}
export interface GameText {
  textWall: string;
  visibleText: string;
}
export interface GameControls {
  isGameActive: boolean;
  isGameOver: boolean;
  isGameStale: boolean;
}
export interface GameCounters {
  elapsedSeconds: number;
  currentIndex: number;
  extraCount: number;
}

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

export interface TestType {
  test: MiddleNavKey;
  modifier: string;
}

export interface TestCharacters {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
}
export interface TestResults {
  rawWPM: number;
  timeTaken: number;
  TestType: TestType;
  TestCharacters: TestCharacters;
  hasPunctuation?: boolean;
  hasNumbers?: boolean;
  accuracy?: string;
}
export interface PlayerResults {
  username: string;
  testResults: TestResults;
}