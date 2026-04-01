import { Component, OnInit, output } from '@angular/core';

@Component({
  selector: 'app-countdown-window',
  imports: [],
  templateUrl: './countdown-window.html',
  styleUrl: './countdown-window.css',
})
export class CountdownWindow {
  secondsRemaining: number = 5;
  closeInstructions = output<boolean>();

  startCountdown() {
    const countdownInterval = setInterval(() => {
      this.secondsRemaining--;
      if (this.secondsRemaining <= 0) {
        clearInterval(countdownInterval);
        this.closeInstructionWindow();
      }
    }, 1000);
  }

  closeInstructionWindow() {
    this.closeInstructions.emit(true);
  }
}
