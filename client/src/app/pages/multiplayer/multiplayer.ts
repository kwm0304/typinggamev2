import { Component, input, OnInit } from '@angular/core';
import { AuthResponse } from '../../types/usertypes';

@Component({
  selector: 'app-multiplayer',
  imports: [],
  templateUrl: './multiplayer.html',
  styleUrl: './multiplayer.css',
})
export class Multiplayer implements OnInit {
  playerOne = input<AuthResponse>({
    username: 'Player 1',
    email: '',
    token: '',
  });
  playerTwo = input<AuthResponse>({
    username: 'Player 2',
    email: '',
    token: '',
  });

  showInstructionsModal: boolean = false;
  isGameStarted: boolean = false;
  isGameActive: boolean = false;
  isGameFinished: boolean = false;

  constructor() {}
  ngOnInit(): void {
    if (this.playerOne().username && this.playerTwo().username) {
      this.showInstructionsModal = true;
      this.handleStartGame();
    }
  }
  handleStartGame() {
    this.startGameTimer();
    this.isGameActive = true;
    this.isGameStarted = true;
  }
  startGameTimer() {
    setTimeout(() => {}, 3000);
  }
}
