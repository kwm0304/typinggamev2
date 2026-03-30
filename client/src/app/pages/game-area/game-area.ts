import { Component, input, OnInit, output } from '@angular/core';
import { CharState } from '../../types/gametypes';

@Component({
  selector: 'app-game-area',
  imports: [],
  templateUrl: './game-area.html',
  styleUrl: './game-area.css',
})
export class GameArea implements OnInit{
  
  gameText: string = '';

  isGameActive = output<boolean>();
  isGameOver = output<boolean>();
  isGameStale = output<boolean>();
  userInput = output<CharState[]>();
  staleTimeoutId: ReturnType<typeof setTimeout> | null = null;

  
  ngOnInit(): void {
    //make service call to get game text
  }

}
